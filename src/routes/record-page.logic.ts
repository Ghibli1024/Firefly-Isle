/**
 * [INPUT]: 依赖 @/lib/patient-record-storage 的 loadPatientRecordById 与 @/types/patient 的 PatientRecord 数据模型。
 * [OUTPUT]: 对外提供 loadPatientRecordById、RecordLoadState 与 getActiveRecordLoadState，封装 /record/:id 的 Supabase 读取和 route load-state 归一。
 * [POS]: routes 的病例详情逻辑层，让 record-page.tsx 只负责路由编排和导出状态，数据库 row 映射统一下沉到 lib/patient-record-storage。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { loadPatientRecordById } from '@/lib/patient-record-storage'
import type { PatientRecord } from '@/types/patient'

export { loadPatientRecordById }

export type RecordLoadState = {
  error: string | null
  isLoading: boolean
  record: PatientRecord | null
  recordId: string | null
}

export function getActiveRecordLoadState({
  demoRoute,
  id,
  recordLoadState,
}: {
  demoRoute: boolean
  id: string
  recordLoadState: RecordLoadState
}): RecordLoadState {
  if (demoRoute) {
    return {
      error: null,
      isLoading: false,
      record: null,
      recordId: null,
    }
  }

  if (recordLoadState.recordId === id) {
    return {
      ...recordLoadState,
      record: recordLoadState.record,
    }
  }

  return {
    error: null,
    isLoading: true,
    record: null,
    recordId: id,
  }
}
