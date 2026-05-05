/**
 * [INPUT]: 依赖 @/lib/supabase 的客户端入口与 @/types/patient 的 PatientRecord/TreatmentLine/LabResult 数据模型。
 * [OUTPUT]: 对外提供 loadPatientRecordById、loadLatestPatientRecord、persistPatientRecord 与 lab row/payload 映射工具。
 * [POS]: lib 的患者记录持久化边界，统一 routes 与 workspace 对 patients、treatment_lines、lab_results 的读写。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { getSupabaseClient } from '@/lib/supabase'
import type { LabResult, PatientRecord, TreatmentLine } from '@/types/patient'

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

export type LabResultRow = {
  category: LabResult['category']
  id?: string
  item_code: string
  item_name: string
  patient_id?: string
  reference_high: number | null
  reference_low: number | null
  source: NonNullable<LabResult['source']>
  test_date: string | null
  unit: string | null
  value: number
}

function getPatientPayload(record: PatientRecord) {
  return {
    basic_info: record.basicInfo ?? {},
    initial_onset: record.initialOnset ? record.initialOnset : null,
  }
}

function getTreatmentLinePayload(line: TreatmentLine, patientId: string) {
  return {
    biopsy: line.biopsy ?? null,
    end_date: line.endDate ?? null,
    genetic_test: line.geneticTest ?? null,
    immunohistochemistry: line.immunohistochemistry ?? null,
    line_number: line.lineNumber,
    patient_id: patientId,
    regimen: line.regimen ?? null,
    start_date: line.startDate ?? null,
  }
}

export function toLabResultPayload(reading: LabResult, patientId: string) {
  return {
    category: reading.category,
    item_code: reading.itemCode,
    item_name: reading.itemName,
    patient_id: patientId,
    reference_high: reading.referenceHigh ?? null,
    reference_low: reading.referenceLow ?? null,
    source: reading.source ?? 'manual',
    test_date: reading.testDate ?? null,
    unit: reading.unit ?? null,
    value: reading.value,
  }
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

export function mapLabResultRow(row: LabResultRow): LabResult {
  return {
    category: row.category,
    id: row.id,
    itemCode: row.item_code,
    itemName: row.item_name,
    patientId: row.patient_id,
    referenceHigh: row.reference_high ?? undefined,
    referenceLow: row.reference_low ?? undefined,
    source: row.source,
    testDate: row.test_date ?? undefined,
    unit: row.unit ?? undefined,
    value: row.value,
  }
}

function mapPatientRow(patient: PatientRow, lines: TreatmentLineRow[], labRows: LabResultRow[]): PatientRecord {
  const labResults = labRows.map(mapLabResultRow)

  return {
    basicInfo: patient.basic_info ?? undefined,
    id: patient.id,
    initialOnset: patient.initial_onset ?? undefined,
    labResults: labResults.length > 0 ? labResults : undefined,
    treatmentLines: lines.map(mapTreatmentLineRow).sort((left, right) => left.lineNumber - right.lineNumber),
  }
}

async function loadPatientChildren(patient: PatientRow) {
  const supabase = getSupabaseClient()
  const { data: lines, error: linesError } = await supabase
    .from('treatment_lines')
    .select('line_number, start_date, end_date, regimen, biopsy, immunohistochemistry, genetic_test')
    .eq('patient_id', patient.id)
    .order('line_number', { ascending: true })
    .returns<TreatmentLineRow[]>()

  if (linesError) {
    throw linesError
  }

  const { data: labRows, error: labError } = await supabase
    .from('lab_results')
    .select('id, patient_id, test_date, category, item_code, item_name, value, unit, reference_low, reference_high, source')
    .eq('patient_id', patient.id)
    .order('test_date', { ascending: true })
    .returns<LabResultRow[]>()

  if (labError) {
    throw labError
  }

  return mapPatientRow(patient, lines ?? [], labRows ?? [])
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

  return patient ? loadPatientChildren(patient) : null
}

export async function loadLatestPatientRecord(userId: string) {
  const supabase = getSupabaseClient()
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id, basic_info, initial_onset')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<PatientRow>()

  if (patientError) {
    throw patientError
  }

  return patient ? loadPatientChildren(patient) : null
}

async function ensurePatientRecordExists(record: PatientRecord, userId: string) {
  if (record.id) {
    return record.id
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('patients')
    .insert({
      ...getPatientPayload(record),
      user_id: userId,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  return data.id
}

export async function persistPatientRecord(record: PatientRecord, userId: string) {
  const patientId = await ensurePatientRecordExists(record, userId)
  const persistedRecord = record.id ? record : { ...record, id: patientId }
  const supabase = getSupabaseClient()

  const { error: patientError } = await supabase.from('patients').update(getPatientPayload(persistedRecord)).eq('id', patientId)

  if (patientError) {
    throw patientError
  }

  if (persistedRecord.treatmentLines.length > 0) {
    const { error: lineError } = await supabase
      .from('treatment_lines')
      .upsert(
        persistedRecord.treatmentLines.map((line) => getTreatmentLinePayload(line, patientId)),
        { onConflict: 'patient_id,line_number' },
      )

    if (lineError) {
      throw lineError
    }
  }

  if (persistedRecord.labResults) {
    const { error: deleteError } = await supabase.from('lab_results').delete().eq('patient_id', patientId)

    if (deleteError) {
      throw deleteError
    }

    if (persistedRecord.labResults.length > 0) {
      const { error: labError } = await supabase
        .from('lab_results')
        .insert(persistedRecord.labResults.map((reading) => toLabResultPayload(reading, patientId)))

      if (labError) {
        throw labError
      }
    }
  }

  return persistedRecord
}
