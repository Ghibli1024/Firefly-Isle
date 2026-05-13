/**
 * [INPUT]: 依赖 node:fs 读取 Supabase 迁移，依赖 vitest mock Supabase 与 patient-record-storage，依赖 ./record-sharing 的授权码/share 边界。
 * [OUTPUT]: 对外提供 record_shares 迁移/RLS/RPC 合同、授权码 hash、所有权校验、创建/撤销/读取分享状态回归测试。
 * [POS]: lib 的分享边界测试，证明授权码不明文入库、非 owner 不创建分享、撤销/过期/错误码不返回记录且 active share 只加载单份 PatientRecord。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const supabaseMocks = vi.hoisted(() => ({
  getSupabaseClient: vi.fn(),
  loadSharedPatientRecordById: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: supabaseMocks.getSupabaseClient,
}))

vi.mock('@/lib/patient-record-storage', () => ({
  loadSharedPatientRecordById: supabaseMocks.loadSharedPatientRecordById,
}))

import {
  createRecordShare,
  generateShareCode,
  hashShareCode,
  loadSharedPatientRecordByCode,
  RecordSharePermissionError,
  revokeRecordShare,
} from './record-sharing'

const migrationSql = readFileSync(resolve(process.cwd(), 'supabase/migrations/006_record_shares.sql'), 'utf8')

function createPatientBuilder(data: { id: string } | null) {
  const builder = {
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error: null })),
    select: vi.fn(() => builder),
  }

  return builder
}

function createShareInsertBuilder(row = { created_at: '2026-05-13T00:00:00Z', expires_at: '2026-05-20T00:00:00Z', id: 'share-1', patient_id: 'patient-1', revoked_at: null }) {
  const builder = {
    insert: vi.fn(() => builder),
    select: vi.fn(() => builder),
    single: vi.fn(async () => ({ data: row, error: null })),
  }

  return builder
}

beforeEach(() => {
  supabaseMocks.getSupabaseClient.mockReset()
  supabaseMocks.loadSharedPatientRecordById.mockReset()
})

describe('record share schema contract', () => {
  it('stores only authorization code hashes and owner-scoped management facts', () => {
    expect(migrationSql).toContain('create table if not exists public.record_shares')
    expect(migrationSql).toContain('code_hash text not null unique')
    expect(migrationSql).toContain('owner_user_id uuid not null references auth.users')
    expect(migrationSql).toContain('create policy record_shares_insert_own_patient')
    expect(migrationSql).toContain('public.patients.user_id = auth.uid()')
  })

  it('keeps shared record reads under explicit active-share RLS policies', () => {
    expect(migrationSql).toContain('create policy patients_select_shared')
    expect(migrationSql).toContain('create policy treatment_lines_select_shared')
    expect(migrationSql).toContain('create policy lab_results_select_shared')
    expect(migrationSql).toContain('record_shares.revoked_at is null')
    expect(migrationSql).toContain('record_shares.expires_at > now()')
  })

  it('returns only share status and patient id from the code verification function', () => {
    expect(migrationSql).toContain('function public.get_record_share_access(share_code_hash text)')
    expect(migrationSql).toContain('returns table(status text, patient_id uuid)')
    expect(migrationSql).toContain('grant execute on function public.get_record_share_access(text) to anon, authenticated')
    expect(migrationSql).not.toContain('owner_user_id::')
  })
})

describe('record share code utilities', () => {
  it('generates URL-safe high entropy codes from bytes', () => {
    expect(generateShareCode(new Uint8Array([0, 1, 2, 253, 254, 255]))).toBe('AAEC_f7_')
  })

  it('hashes the code before persistence', async () => {
    await expect(hashShareCode('abc')).resolves.toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})

describe('record share CRUD boundary', () => {
  it('creates a share only after the patient is confirmed to belong to the current user', async () => {
    const patientBuilder = createPatientBuilder({ id: 'patient-1' })
    const shareBuilder = createShareInsertBuilder()
    const supabase = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } }, error: null })),
      },
      from: vi.fn((table: string) => (table === 'patients' ? patientBuilder : shareBuilder)),
    }

    supabaseMocks.getSupabaseClient.mockReturnValue(supabase)

    const created = await createRecordShare('patient-1', '2026-05-20T00:00:00Z')

    expect(patientBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(shareBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({
      code_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      owner_user_id: 'user-1',
      patient_id: 'patient-1',
    }))
    expect(created.code).not.toMatch(/^[a-f0-9]{64}$/)
    expect(created.share.id).toBe('share-1')
  })

  it('rejects share creation for non-owner records before insert', async () => {
    const patientBuilder = createPatientBuilder(null)
    const shareBuilder = createShareInsertBuilder()
    const supabase = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: 'user-2' } }, error: null })),
      },
      from: vi.fn((table: string) => (table === 'patients' ? patientBuilder : shareBuilder)),
    }

    supabaseMocks.getSupabaseClient.mockReturnValue(supabase)

    await expect(createRecordShare('patient-1')).rejects.toBeInstanceOf(RecordSharePermissionError)
    expect(shareBuilder.insert).not.toHaveBeenCalled()
  })

  it('revokes by writing revoked_at instead of deleting the share row', async () => {
    const builder = {
      eq: vi.fn(() => builder),
      select: vi.fn(() => builder),
      single: vi.fn(async () => ({
        data: { created_at: null, expires_at: '2026-05-20T00:00:00Z', id: 'share-1', patient_id: 'patient-1', revoked_at: '2026-05-13T00:00:00Z' },
        error: null,
      })),
      update: vi.fn(() => builder),
    }

    supabaseMocks.getSupabaseClient.mockReturnValue({ from: vi.fn(() => builder) })

    await expect(revokeRecordShare('share-1', '2026-05-13T00:00:00Z')).resolves.toMatchObject({ revokedAt: '2026-05-13T00:00:00Z' })
    expect(builder.update).toHaveBeenCalledWith({ revoked_at: '2026-05-13T00:00:00Z' })
  })
})

describe('shared record loading', () => {
  function mockShareAccess(status: string, patientId: string | null) {
    const rpcBuilder = {
      single: vi.fn(async () => ({ data: { patient_id: patientId, status }, error: null })),
    }

    supabaseMocks.getSupabaseClient.mockReturnValue({
      rpc: vi.fn(() => rpcBuilder),
    })
  }

  it('loads exactly the shared patient record for active codes', async () => {
    mockShareAccess('active', 'patient-1')
    supabaseMocks.loadSharedPatientRecordById.mockResolvedValue({ id: 'patient-1', treatmentLines: [] })

    await expect(loadSharedPatientRecordByCode('valid_share_code_123456')).resolves.toMatchObject({
      record: { id: 'patient-1' },
      status: 'active',
    })
    expect(supabaseMocks.loadSharedPatientRecordById).toHaveBeenCalledWith('patient-1')
  })

  it.each(['expired', 'revoked', 'unavailable'] as const)('does not load patient data when share status is %s', async (status) => {
    mockShareAccess(status, null)

    await expect(loadSharedPatientRecordByCode('valid_share_code_123456')).resolves.toEqual({
      record: null,
      status,
    })
    expect(supabaseMocks.loadSharedPatientRecordById).not.toHaveBeenCalled()
  })

  it('rejects malformed short codes before hitting the RPC boundary', async () => {
    const supabase = {
      rpc: vi.fn(),
    }

    supabaseMocks.getSupabaseClient.mockReturnValue(supabase)

    await expect(loadSharedPatientRecordByCode('bad-code')).resolves.toEqual({
      record: null,
      status: 'unavailable',
    })
    expect(supabase.rpc).not.toHaveBeenCalled()
  })
})
