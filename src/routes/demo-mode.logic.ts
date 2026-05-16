/**
 * [INPUT]: 依赖全产品 Demo fixture、record-sharing 的授权码只读读取边界、Supabase env 状态与 PatientRecord 类型。
 * [OUTPUT]: 对外提供 loadDemoPatientRecord、resolveDemoPatientRecord、DemoPatientRecordLoadResult 与 getDemoRecordShareCode。
 * [POS]: routes 的 Demo 数据源逻辑层，在 /demo/record 与 /demo/analytics 之间统一“优先 Supabase 公开分享码、失败回退 fixture”的读取策略。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { demoLabAnalyticsRecord } from '@/components/analytics/demo-lab-analytics'
import { loadSharedPatientRecordByCode, type SharedRecordLoadResult, type SharedRecordStatus } from '@/lib/record-sharing'
import { hasSupabaseEnv } from '@/lib/supabase'
import type { PatientRecord } from '@/types/patient'

type DemoPatientRecordSource = 'fixture' | 'supabase-share'
type DemoPatientRecordStatus = SharedRecordStatus | 'active' | 'incomplete-shared-record' | 'missing-code' | 'missing-supabase-env' | 'load-error'

type ResolveDemoPatientRecordOptions = {
  canUseSupabase?: boolean
  code?: string
  fallbackRecord?: PatientRecord
  loadSharedRecord?: (code: string) => Promise<SharedRecordLoadResult>
}

export type DemoPatientRecordLoadResult = {
  record: PatientRecord
  source: DemoPatientRecordSource
  status: DemoPatientRecordStatus
}

export function getDemoRecordShareCode() {
  return import.meta.env.VITE_DEMO_RECORD_SHARE_CODE?.trim() ?? ''
}

function hasCompleteDemoRecord(record: PatientRecord) {
  return (record.treatmentLines?.length ?? 0) > 0 && (record.labResults?.length ?? 0) > 0
}

export async function resolveDemoPatientRecord({
  canUseSupabase = hasSupabaseEnv,
  code = getDemoRecordShareCode(),
  fallbackRecord = demoLabAnalyticsRecord,
  loadSharedRecord = loadSharedPatientRecordByCode,
}: ResolveDemoPatientRecordOptions = {}): Promise<DemoPatientRecordLoadResult> {
  if (!code) {
    return {
      record: fallbackRecord,
      source: 'fixture',
      status: 'missing-code',
    }
  }

  if (!canUseSupabase) {
    return {
      record: fallbackRecord,
      source: 'fixture',
      status: 'missing-supabase-env',
    }
  }

  try {
    const result = await loadSharedRecord(code)

    if (result.status === 'active') {
      if (!hasCompleteDemoRecord(result.record)) {
        return {
          record: fallbackRecord,
          source: 'fixture',
          status: 'incomplete-shared-record',
        }
      }

      return {
        record: result.record,
        source: 'supabase-share',
        status: 'active',
      }
    }

    return {
      record: fallbackRecord,
      source: 'fixture',
      status: result.status,
    }
  } catch {
    return {
      record: fallbackRecord,
      source: 'fixture',
      status: 'load-error',
    }
  }
}

export function loadDemoPatientRecord() {
  return resolveDemoPatientRecord()
}
