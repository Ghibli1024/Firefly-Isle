/**
 * [INPUT]: 依赖 vitest mock、@/lib/supabase mock 与 ./lab-report-storage 的实验室报告批次持久化函数。
 * [OUTPUT]: 对外提供重复批次检测、替换前阻断和保存 batch + lab_results payload 的回归测试。
 * [POS]: lib 的实验室报告持久化测试，约束网页端确认报告写入一条批次事实和多条关联读数。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const supabaseMocks = vi.hoisted(() => ({
  getSupabaseClient: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: supabaseMocks.getSupabaseClient,
}))

import { findExistingLabReportBatch, saveLabReportBatch } from './lab-report-storage'

beforeEach(() => {
  supabaseMocks.getSupabaseClient.mockReset()
})

function createBatchBuilder(existing: unknown, insertedPayloads: unknown[]) {
  const builder = {
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    insert: vi.fn((payload: unknown) => {
      insertedPayloads.push(payload)
      return builder
    }),
    maybeSingle: vi.fn(async () => ({ data: existing, error: null })),
    select: vi.fn(() => builder),
    single: vi.fn(async () => ({
      data: {
        category: 'tumor-marker',
        created_at: '2026-05-12T00:00:00Z',
        id: 'batch-new',
        ocr_text: 'CEA 12.4',
        patient_id: 'patient-42',
        review_status: 'confirmed',
        source_file_name: 'marker.png',
        source_mime_type: 'image/png',
        source_storage_path: null,
        test_date: '2026-05-10',
        updated_at: '2026-05-12T00:00:00Z',
      },
      error: null,
    })),
  }

  return builder
}

function createReadingBuilder(insertedPayloads: unknown[]) {
  const builder = {
    delete: vi.fn(() => builder),
    eq: vi.fn(async () => ({ error: null })),
    insert: vi.fn((payload: unknown) => {
      insertedPayloads.push(payload)
      return builder
    }),
    returns: vi.fn(async () => ({
      data: [
        {
          batch_id: 'batch-new',
          category: 'tumor-marker',
          derivation_method: null,
          id: 'reading-1',
          is_derived: false,
          item_code: 'cea',
          item_name: '癌胚抗原（CEA）',
          patient_id: 'patient-42',
          reference_high: 5,
          reference_low: 0,
          source: 'ocr',
          test_date: '2026-05-10',
          unit: 'ng/mL',
          value: 12.4,
        },
      ],
      error: null,
    })),
    select: vi.fn(() => builder),
  }

  return builder
}

describe('lab report storage', () => {
  it('finds an existing same-patient category/date batch', async () => {
    const batchBuilder = createBatchBuilder(
      {
        category: 'tumor-marker',
        created_at: null,
        id: 'batch-existing',
        ocr_text: null,
        patient_id: 'patient-42',
        review_status: 'confirmed',
        source_file_name: null,
        source_mime_type: null,
        source_storage_path: null,
        test_date: '2026-05-10',
        updated_at: null,
      },
      [],
    )

    supabaseMocks.getSupabaseClient.mockReturnValue({ from: vi.fn(() => batchBuilder) })

    await expect(findExistingLabReportBatch('patient-42', 'tumor-marker', '2026-05-10')).resolves.toMatchObject({
      id: 'batch-existing',
      testDate: '2026-05-10',
    })
    expect(batchBuilder.eq).toHaveBeenCalledWith('patient_id', 'patient-42')
    expect(batchBuilder.eq).toHaveBeenCalledWith('category', 'tumor-marker')
    expect(batchBuilder.eq).toHaveBeenCalledWith('test_date', '2026-05-10')
  })

  it('returns duplicate instead of writing when a same-day category batch exists', async () => {
    const batchBuilder = createBatchBuilder(
      {
        category: 'tumor-marker',
        created_at: null,
        id: 'batch-existing',
        ocr_text: null,
        patient_id: 'patient-42',
        review_status: 'confirmed',
        source_file_name: null,
        source_mime_type: null,
        source_storage_path: null,
        test_date: '2026-05-10',
        updated_at: null,
      },
      [],
    )

    supabaseMocks.getSupabaseClient.mockReturnValue({ from: vi.fn(() => batchBuilder) })

    await expect(
      saveLabReportBatch({
        batch: { category: 'tumor-marker', patientId: 'patient-42', testDate: '2026-05-10' },
        readings: [{ category: 'tumor-marker', itemCode: 'cea', itemName: '癌胚抗原（CEA）', testDate: '2026-05-10', value: 12.4 }],
      }),
    ).resolves.toMatchObject({ status: 'duplicate' })
    expect(batchBuilder.insert).not.toHaveBeenCalled()
  })

  it('creates one batch and associated lab_results payloads after confirmation', async () => {
    const batchPayloads: unknown[] = []
    const readingPayloads: unknown[] = []
    const batchBuilders = [createBatchBuilder(null, batchPayloads), createBatchBuilder(null, batchPayloads)]
    const readingBuilder = createReadingBuilder(readingPayloads)
    const supabase = {
      from: vi.fn((table: string) => (table === 'lab_report_batches' ? batchBuilders.shift() : readingBuilder)),
    }

    supabaseMocks.getSupabaseClient.mockReturnValue(supabase)

    await expect(
      saveLabReportBatch({
        batch: {
          category: 'tumor-marker',
          ocrText: 'CEA 12.4',
          patientId: 'patient-42',
          sourceFileName: 'marker.png',
          sourceMimeType: 'image/png',
          testDate: '2026-05-10',
        },
        readings: [
          {
            category: 'tumor-marker',
            itemCode: 'cea',
            itemName: '癌胚抗原（CEA）',
            referenceHigh: 5,
            referenceLow: 0,
            source: 'ocr',
            testDate: '2026-05-10',
            unit: 'ng/mL',
            value: 12.4,
          },
        ],
      }),
    ).resolves.toMatchObject({ readings: [{ batchId: 'batch-new', itemCode: 'cea' }], status: 'saved' })
    expect(batchPayloads[0]).toMatchObject({
      category: 'tumor-marker',
      ocr_text: 'CEA 12.4',
      patient_id: 'patient-42',
      source_file_name: 'marker.png',
    })
    expect(readingPayloads[0]).toEqual([
      expect.objectContaining({
        batch_id: 'batch-new',
        item_code: 'cea',
        patient_id: 'patient-42',
      }),
    ])
  })
})
