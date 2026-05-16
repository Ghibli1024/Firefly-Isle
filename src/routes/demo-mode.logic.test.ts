/**
 * [INPUT]: 依赖 vitest、Demo 数据源逻辑层与 PatientRecord 类型。
 * [OUTPUT]: 对外提供公开 Demo Supabase 分享码读取、缺配置降级、缺 Supabase env 降级、撤销/过期/不完整记录/失败降级的回归测试。
 * [POS]: routes 的 Demo 数据源测试，确保 /demo/record 与 /demo/analytics 共享同一只读公开数据边界且不会因为远端不可用而空白。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it, vi } from 'vitest'

import type { PatientRecord } from '@/types/patient'

import { resolveDemoPatientRecord } from './demo-mode.logic'

const fixtureRecord: PatientRecord = {
  basicInfo: { name: '本地 Demo' },
  id: 'fixture-demo',
  treatmentLines: [],
}

const supabaseRecord: PatientRecord = {
  basicInfo: { name: 'Supabase Demo' },
  id: 'supabase-demo',
  labResults: [
    { category: 'tumor-marker', itemCode: 'ca15_3', itemName: 'CA15-3', testDate: '2026-05-01', value: 32 },
  ],
  treatmentLines: [{ lineNumber: 1, regimen: 'Demo regimen' }],
}

describe('Demo mode data source', () => {
  it('falls back to the local fixture when no public share code is configured', async () => {
    const loadSharedRecord = vi.fn()
    const result = await resolveDemoPatientRecord({
      code: '',
      fallbackRecord: fixtureRecord,
      loadSharedRecord,
    })

    expect(result).toEqual({
      record: fixtureRecord,
      source: 'fixture',
      status: 'missing-code',
    })
    expect(loadSharedRecord).not.toHaveBeenCalled()
  })

  it('does not touch Supabase when browser env is incomplete', async () => {
    const loadSharedRecord = vi.fn()
    const result = await resolveDemoPatientRecord({
      canUseSupabase: false,
      code: 'public-demo-code',
      fallbackRecord: fixtureRecord,
      loadSharedRecord,
    })

    expect(result.source).toBe('fixture')
    expect(result.status).toBe('missing-supabase-env')
    expect(result.record).toBe(fixtureRecord)
    expect(loadSharedRecord).not.toHaveBeenCalled()
  })

  it('uses the public read-only shared record when the configured code is active', async () => {
    const loadSharedRecord = vi.fn().mockResolvedValue({
      record: supabaseRecord,
      status: 'active',
    })
    const result = await resolveDemoPatientRecord({
      canUseSupabase: true,
      code: 'public-demo-code',
      fallbackRecord: fixtureRecord,
      loadSharedRecord,
    })

    expect(result).toEqual({
      record: supabaseRecord,
      source: 'supabase-share',
      status: 'active',
    })
    expect(loadSharedRecord).toHaveBeenCalledWith('public-demo-code')
  })

  it('keeps Demo usable when the public share code is revoked, expired, unavailable, or throws', async () => {
    for (const status of ['revoked', 'expired', 'unavailable'] as const) {
      const result = await resolveDemoPatientRecord({
        canUseSupabase: true,
        code: 'public-demo-code',
        fallbackRecord: fixtureRecord,
        loadSharedRecord: vi.fn().mockResolvedValue({ record: null, status }),
      })

      expect(result).toEqual({
        record: fixtureRecord,
        source: 'fixture',
        status,
      })
    }

    const failedResult = resolveDemoPatientRecord({
      canUseSupabase: true,
      code: 'public-demo-code',
      fallbackRecord: fixtureRecord,
      loadSharedRecord: vi.fn().mockRejectedValue(new Error('network down')),
    })

    await expect(failedResult).resolves.toEqual({
      record: fixtureRecord,
      source: 'fixture',
      status: 'load-error',
    })
  })

  it('falls back when the shared record is reachable but lacks the full demo story', async () => {
    const result = await resolveDemoPatientRecord({
      canUseSupabase: true,
      code: 'public-demo-code',
      fallbackRecord: fixtureRecord,
      loadSharedRecord: vi.fn().mockResolvedValue({
        record: { id: 'partial-demo', treatmentLines: [] },
        status: 'active',
      }),
    })

    expect(result).toEqual({
      record: fixtureRecord,
      source: 'fixture',
      status: 'incomplete-shared-record',
    })
  })
})
