/**
 * [INPUT]: 依赖 @/lib/supabase 的客户端入口、patient-record-storage 的实验室批次/读数 mapper，以及 @/types/patient 的 LabReportBatch/LabResult 类型。
 * [OUTPUT]: 对外提供 findExistingLabReportBatch 与 saveLabReportBatch，负责网页端实验室报告批次和关联读数的 Supabase 写入。
 * [POS]: lib 的实验室报告摄入持久化边界，让 analytics route 不直接拼接 lab_report_batches / lab_results 数据库 payload。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { getSupabaseClient } from '@/lib/supabase'
import {
  mapLabReportBatchRow,
  mapLabResultRow,
  toLabReportBatchPayload,
  toLabResultPayload,
  type LabReportBatchRow,
  type LabResultRow,
} from '@/lib/patient-record-storage'
import type { LabReportBatch, LabResult, LabResultCategory } from '@/types/patient'

type SaveLabReportBatchInput = {
  batch: Omit<LabReportBatch, 'category' | 'patientId'> & {
    category: LabResultCategory
    patientId: string
  }
  readings: LabResult[]
  replaceExisting?: boolean
}

type SaveLabReportBatchResult =
  | {
      existingBatch: LabReportBatch
      status: 'duplicate'
    }
  | {
      batch: LabReportBatch
      readings: LabResult[]
      status: 'saved'
    }

const LAB_BATCH_COLUMNS =
  'id, patient_id, category, test_date, source_file_name, source_mime_type, source_storage_path, ocr_text, review_status, created_at, updated_at'
const LAB_RESULT_COLUMNS =
  'id, patient_id, batch_id, test_date, category, item_code, item_name, value, unit, reference_low, reference_high, source, is_derived, derivation_method'

export async function findExistingLabReportBatch(patientId: string, category: LabResultCategory, testDate: string | undefined) {
  if (!testDate) {
    return null
  }

  const { data, error } = await getSupabaseClient()
    .from('lab_report_batches')
    .select(LAB_BATCH_COLUMNS)
    .eq('patient_id', patientId)
    .eq('category', category)
    .eq('test_date', testDate)
    .maybeSingle<LabReportBatchRow>()

  if (error) {
    throw error
  }

  return data ? mapLabReportBatchRow(data) : null
}

async function deleteBatchWithReadings(batchId: string) {
  const supabase = getSupabaseClient()
  const { error: readingError } = await supabase.from('lab_results').delete().eq('batch_id', batchId)

  if (readingError) {
    throw readingError
  }

  const { error: batchError } = await supabase.from('lab_report_batches').delete().eq('id', batchId)

  if (batchError) {
    throw batchError
  }
}

export async function saveLabReportBatch(input: SaveLabReportBatchInput): Promise<SaveLabReportBatchResult> {
  const testDate = input.batch.testDate ?? input.readings.find((reading) => reading.testDate)?.testDate
  const existingBatch = await findExistingLabReportBatch(input.batch.patientId, input.batch.category, testDate)

  if (existingBatch && !input.replaceExisting) {
    return {
      existingBatch,
      status: 'duplicate',
    }
  }

  if (existingBatch?.id && input.replaceExisting) {
    await deleteBatchWithReadings(existingBatch.id)
  }

  const supabase = getSupabaseClient()
  const { data: batchRow, error: batchError } = await supabase
    .from('lab_report_batches')
    .insert(toLabReportBatchPayload({ ...input.batch, testDate }, input.batch.patientId))
    .select(LAB_BATCH_COLUMNS)
    .single<LabReportBatchRow>()

  if (batchError || !batchRow) {
    throw batchError ?? new Error('Failed to create lab report batch.')
  }

  const batch = mapLabReportBatchRow(batchRow)
  const readingsWithBatch = input.readings.map((reading) => ({ ...reading, batchId: batch.id, patientId: input.batch.patientId }))

  if (readingsWithBatch.length === 0) {
    return {
      batch,
      readings: [],
      status: 'saved',
    }
  }

  const { data: readingRows, error: readingError } = await supabase
    .from('lab_results')
    .insert(readingsWithBatch.map((reading) => toLabResultPayload(reading, input.batch.patientId)))
    .select(LAB_RESULT_COLUMNS)
    .returns<LabResultRow[]>()

  if (readingError) {
    throw readingError
  }

  return {
    batch,
    readings: (readingRows ?? []).map(mapLabResultRow),
    status: 'saved',
  }
}
