/**
 * [INPUT]: 依赖 node:fs 读取 Supabase 迁移，依赖 vitest 断言，依赖 ./patient-record-storage 的 PatientRecord 持久化映射工具。
 * [OUTPUT]: 对外提供 lab_results 迁移/RLS 合同、患者记录 labResults row 映射与假 id 落库防线测试。
 * [POS]: lib 的数据边界测试，约束患者记录读取/落库、持久化 id 所有权校验与实验室指标 RLS 不分叉。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const supabaseMocks = vi.hoisted(() => ({
  getSupabaseClient: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: supabaseMocks.getSupabaseClient,
}))

import { mapLabResultRow, persistPatientRecord, toLabResultPayload } from './patient-record-storage'

const migrationSql = readFileSync(resolve(process.cwd(), 'supabase/migrations/002_lab_results.sql'), 'utf8')

function createPatientBuilder() {
  const builder = {
    eq: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    select: vi.fn(() => builder),
    single: vi.fn(async () => ({ data: { id: 'patient-real' }, error: null })),
    update: vi.fn(() => builder),
  }

  return builder
}

beforeEach(() => {
  supabaseMocks.getSupabaseClient.mockReset()
})

describe('patient-record-storage lab result mapping', () => {
  it('maps database lab rows into PatientRecord labResults', () => {
    expect(
      mapLabResultRow({
        category: 'tumor-marker',
        item_code: 'cea',
        item_name: 'CEA',
        reference_high: 5,
        reference_low: null,
        source: 'ocr',
        test_date: '2024-02-01',
        unit: 'ng/mL',
        value: 8.2,
      }),
    ).toEqual({
      category: 'tumor-marker',
      itemCode: 'cea',
      itemName: 'CEA',
      referenceHigh: 5,
      referenceLow: undefined,
      source: 'ocr',
      testDate: '2024-02-01',
      unit: 'ng/mL',
      value: 8.2,
    })
  })

  it('serializes OCR and manual lab readings into the same database payload shape', () => {
    expect(
      toLabResultPayload(
        { category: 'blood-biochemistry', itemCode: 'alt', itemName: 'ALT', source: 'manual', value: 66 },
        'patient-42',
      ),
    ).toMatchObject({
      category: 'blood-biochemistry',
      item_code: 'alt',
      item_name: 'ALT',
      patient_id: 'patient-42',
      source: 'manual',
      value: 66,
    })
  })
})

describe('patient-record-storage patient identity', () => {
  it('creates a new patient row when the incoming record id is not owned or persisted', async () => {
    const patientBuilders: ReturnType<typeof createPatientBuilder>[] = []
    const supabase = {
      from: vi.fn((table: string) => {
        if (table !== 'patients') {
          return {
            insert: vi.fn(async () => ({ error: null })),
            upsert: vi.fn(async () => ({ error: null })),
          }
        }

        const builder = createPatientBuilder()
        patientBuilders.push(builder)
        return builder
      }),
    }

    supabaseMocks.getSupabaseClient.mockReturnValue(supabase)

    await expect(
      persistPatientRecord(
        {
          basicInfo: { tumorType: '乳腺癌' },
          id: '627b6ba7-74b1-4e10-b79b-ad509bb88687',
          treatmentLines: [],
        },
        'user-1',
      ),
    ).resolves.toMatchObject({
      id: 'patient-real',
    })
    expect(patientBuilders[0].maybeSingle).toHaveBeenCalled()
    expect(patientBuilders[1].insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1' }))
  })
})

describe('002_lab_results migration', () => {
  it('creates lab_results with patient ownership and useful trend indexes', () => {
    expect(migrationSql).toContain('create table if not exists public.lab_results')
    expect(migrationSql).toContain('patient_id uuid not null references public.patients (id) on delete cascade')
    expect(migrationSql).toContain('item_code text not null')
    expect(migrationSql).toContain('reference_high numeric')
    expect(migrationSql).toContain('create index if not exists lab_results_patient_item_date_idx')
  })

  it('enforces RLS through owning patients and rejects unauthorized access', () => {
    expect(migrationSql).toContain('alter table public.lab_results enable row level security')
    expect(migrationSql.match(/auth\.uid\(\) is not null/g)?.length).toBeGreaterThanOrEqual(4)
    expect(migrationSql.match(/public\.patients\.user_id = auth\.uid\(\)/g)?.length).toBeGreaterThanOrEqual(4)
    expect(migrationSql).toContain('create policy lab_results_insert_own')
    expect(migrationSql).toContain('create policy lab_results_update_own')
    expect(migrationSql).toContain('create policy lab_results_delete_own')
  })
})
