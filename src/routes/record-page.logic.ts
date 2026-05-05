/**
 * [INPUT]: 依赖 @/lib/supabase 的客户端入口与 @/types/patient 的 PatientRecord/TreatmentLine 数据模型。
 * [OUTPUT]: 对外提供 loadPatientRecordById、RecordLoadState 与 getActiveRecordLoadState，封装 /record/:id 的 Supabase 读取和 route load-state 归一。
 * [POS]: routes 的病例详情逻辑层，让 record-page.tsx 只负责路由编排和导出状态，不直接承载数据库 row 映射。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { getSupabaseClient } from '@/lib/supabase'
import type { PatientRecord, TreatmentLine } from '@/types/patient'

export type RecordLoadState = {
  error: string | null
  isLoading: boolean
  record: PatientRecord | null
  recordId: string | null
}

type PatientRow = {
  basic_info: PatientRecord['basicInfo'] | null
  id: string
  initial_onset: PatientRecord['initialOnset'] | null
}

type TreatmentLineRow = {
  biopsy: string | null
  end_date: string | null
  genetic_test: string | null
  immunohistochemistry: string | null
  line_number: number
  regimen: string | null
  start_date: string | null
}

function mapTreatmentLineRow(row: TreatmentLineRow): TreatmentLine {
  return {
    biopsy: row.biopsy ?? undefined,
    endDate: row.end_date ?? undefined,
    geneticTest: row.genetic_test ?? undefined,
    immunohistochemistry: row.immunohistochemistry ?? undefined,
    lineNumber: row.line_number,
    regimen: row.regimen ?? undefined,
    startDate: row.start_date ?? undefined,
  }
}

function mapPatientRow(patient: PatientRow, lines: TreatmentLineRow[]): PatientRecord {
  return {
    basicInfo: patient.basic_info ?? undefined,
    id: patient.id,
    initialOnset: patient.initial_onset ?? undefined,
    treatmentLines: lines.map(mapTreatmentLineRow).sort((left, right) => left.lineNumber - right.lineNumber),
  }
}

export async function loadPatientRecordById(recordId: string): Promise<PatientRecord | null> {
  const supabase = getSupabaseClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    throw authError ?? new Error('Missing authenticated user.')
  }

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id, basic_info, initial_onset')
    .eq('id', recordId)
    .eq('user_id', authData.user.id)
    .maybeSingle<PatientRow>()

  if (patientError) {
    throw patientError
  }

  if (!patient) {
    return null
  }

  const { data: lines, error: linesError } = await supabase
    .from('treatment_lines')
    .select('line_number, start_date, end_date, regimen, biopsy, immunohistochemistry, genetic_test')
    .eq('patient_id', patient.id)
    .order('line_number', { ascending: true })
    .returns<TreatmentLineRow[]>()

  if (linesError) {
    throw linesError
  }

  return mapPatientRow(patient, lines ?? [])
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
