/**
 * [INPUT]: 依赖 node:fs 读取 Supabase 迁移，依赖 vitest 断言，依赖 ./patient-record-storage 的 PatientRecord 持久化映射工具。
 * [OUTPUT]: 对外提供 lab_results 迁移/RLS 合同、患者记录 labResults row 映射、clinical_notes 缺列降级、缺表读取降级与假 id 落库防线测试。
 * [POS]: lib 的数据边界测试，约束患者记录读取/落库、持久化 id 所有权校验、可选 clinical_notes/lab_results 迁移缺口降级与实验室指标 RLS 不分叉。
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

import { loadPatientRecordById, mapLabResultRow, persistPatientRecord, toLabResultPayload } from './patient-record-storage'

const labMigrationSql = readFileSync(resolve(process.cwd(), 'supabase/migrations/002_lab_results.sql'), 'utf8')
const clinicalNotesMigrationSql = readFileSync(resolve(process.cwd(), 'supabase/migrations/004_patient_clinical_notes.sql'), 'utf8')

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
  it('loads a saved patient and treatment lines when the optional lab_results table is not deployed yet', async () => {
    const patientBuilder = {
      eq: vi.fn(() => patientBuilder),
      maybeSingle: vi.fn(async () => ({
        data: {
          basic_info: { tumorType: '乳腺癌' },
          clinical_notes: '其他信息：患者自述乏力。',
          id: '54122ae9-269b-4294-9756-141cf40ffd0c',
          initial_onset: null,
        },
        error: null,
      })),
      select: vi.fn(() => patientBuilder),
    }
    const lineBuilder = {
      eq: vi.fn(() => lineBuilder),
      order: vi.fn(() => lineBuilder),
      returns: vi.fn(async () => ({
        data: [
          {
            biopsy: null,
            end_date: '2023-05',
            genetic_test: null,
            immunohistochemistry: null,
            line_number: 1,
            regimen: '阿贝西利+氟维司群+亮丙瑞林+地舒单抗',
            start_date: '2022-10',
          },
        ],
        error: null,
      })),
      select: vi.fn(() => lineBuilder),
    }
    const labBuilder = {
      eq: vi.fn(() => labBuilder),
      order: vi.fn(() => labBuilder),
      returns: vi.fn(async () => ({
        data: null,
        error: {
          code: 'PGRST205',
          message: "Could not find the table 'public.lab_results' in the schema cache",
        },
      })),
      select: vi.fn(() => labBuilder),
    }
    const supabase = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } }, error: null })),
      },
      from: vi.fn((table: string) => {
        if (table === 'patients') {
          return patientBuilder
        }

        return table === 'treatment_lines' ? lineBuilder : labBuilder
      }),
    }

    supabaseMocks.getSupabaseClient.mockReturnValue(supabase)

    await expect(loadPatientRecordById('54122ae9-269b-4294-9756-141cf40ffd0c')).resolves.toMatchObject({
      id: '54122ae9-269b-4294-9756-141cf40ffd0c',
      clinicalNotes: '其他信息：患者自述乏力。',
      labResults: undefined,
      treatmentLines: [
        {
          lineNumber: 1,
          regimen: '阿贝西利+氟维司群+亮丙瑞林+地舒单抗',
        },
      ],
    })
    expect(labBuilder.returns).toHaveBeenCalled()
  })

  it('loads a saved patient when the clinical_notes column is not deployed yet', async () => {
    let selectedPatientColumns = ''
    const patientBuilder = {
      eq: vi.fn(() => patientBuilder),
      maybeSingle: vi.fn(async () =>
        selectedPatientColumns.includes('clinical_notes')
          ? {
              data: null,
              error: {
                code: '42703',
                message: 'column patients.clinical_notes does not exist',
              },
            }
          : {
              data: {
                basic_info: { tumorType: '乳腺癌' },
                id: '54122ae9-269b-4294-9756-141cf40ffd0c',
                initial_onset: null,
              },
              error: null,
            },
      ),
      select: vi.fn((columns: string) => {
        selectedPatientColumns = columns
        return patientBuilder
      }),
    }
    const lineBuilder = {
      eq: vi.fn(() => lineBuilder),
      order: vi.fn(() => lineBuilder),
      returns: vi.fn(async () => ({ data: [], error: null })),
      select: vi.fn(() => lineBuilder),
    }
    const labBuilder = {
      eq: vi.fn(() => labBuilder),
      order: vi.fn(() => labBuilder),
      returns: vi.fn(async () => ({
        data: null,
        error: {
          code: 'PGRST205',
          message: "Could not find the table 'public.lab_results' in the schema cache",
        },
      })),
      select: vi.fn(() => labBuilder),
    }
    const supabase = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } }, error: null })),
      },
      from: vi.fn((table: string) => {
        if (table === 'patients') return patientBuilder
        return table === 'treatment_lines' ? lineBuilder : labBuilder
      }),
    }

    supabaseMocks.getSupabaseClient.mockReturnValue(supabase)

    await expect(loadPatientRecordById('54122ae9-269b-4294-9756-141cf40ffd0c')).resolves.toMatchObject({
      basicInfo: { tumorType: '乳腺癌' },
      clinicalNotes: undefined,
      id: '54122ae9-269b-4294-9756-141cf40ffd0c',
    })
    expect(patientBuilder.select).toHaveBeenCalledWith('id, basic_info, clinical_notes, initial_onset')
    expect(patientBuilder.select).toHaveBeenCalledWith('id, basic_info, initial_onset')
  })

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

  it('persists the main patient row when the clinical_notes column is not deployed yet', async () => {
    const insertPayloads: Array<Record<string, unknown>> = []
    const updatePayloads: Array<Record<string, unknown>> = []
    const patientBuilder = {
      eq: vi.fn(async () => {
        if (updatePayloads.length === 1) {
          return {
            error: {
              code: '42703',
              message: 'column patients.clinical_notes does not exist',
            },
          }
        }

        return { error: null }
      }),
      insert: vi.fn((payload: Record<string, unknown>) => {
        insertPayloads.push(payload)
        return patientBuilder
      }),
      select: vi.fn(() => patientBuilder),
      single: vi.fn(async () => {
        if (insertPayloads.length === 1) {
          return {
            data: null,
            error: {
              code: '42703',
              message: 'column patients.clinical_notes does not exist',
            },
          }
        }

        return { data: { id: 'patient-real' }, error: null }
      }),
      update: vi.fn((payload: Record<string, unknown>) => {
        updatePayloads.push(payload)
        return patientBuilder
      }),
    }
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === 'patients') {
          return patientBuilder
        }

        return {
          insert: vi.fn(async () => ({ error: null })),
          upsert: vi.fn(async () => ({ error: null })),
        }
      }),
    }

    supabaseMocks.getSupabaseClient.mockReturnValue(supabase)

    await expect(
      persistPatientRecord(
        {
          basicInfo: { tumorType: '乳腺癌' },
          clinicalNotes: '其他信息：需要复核。',
          treatmentLines: [],
        },
        'user-1',
      ),
    ).resolves.toMatchObject({
      id: 'patient-real',
    })
    expect(insertPayloads[0]).toHaveProperty('clinical_notes')
    expect(insertPayloads[1]).not.toHaveProperty('clinical_notes')
    expect(updatePayloads[0]).toHaveProperty('clinical_notes')
    expect(updatePayloads[1]).not.toHaveProperty('clinical_notes')
  })
})

describe('002_lab_results migration', () => {
  it('creates lab_results with patient ownership and useful trend indexes', () => {
    expect(labMigrationSql).toContain('create table if not exists public.lab_results')
    expect(labMigrationSql).toContain('patient_id uuid not null references public.patients (id) on delete cascade')
    expect(labMigrationSql).toContain('item_code text not null')
    expect(labMigrationSql).toContain('reference_high numeric')
    expect(labMigrationSql).toContain('create index if not exists lab_results_patient_item_date_idx')
  })

  it('enforces RLS through owning patients and rejects unauthorized access', () => {
    expect(labMigrationSql).toContain('alter table public.lab_results enable row level security')
    expect(labMigrationSql.match(/auth\.uid\(\) is not null/g)?.length).toBeGreaterThanOrEqual(4)
    expect(labMigrationSql.match(/public\.patients\.user_id = auth\.uid\(\)/g)?.length).toBeGreaterThanOrEqual(4)
    expect(labMigrationSql).toContain('create policy lab_results_insert_own')
    expect(labMigrationSql).toContain('create policy lab_results_update_own')
    expect(labMigrationSql).toContain('create policy lab_results_delete_own')
  })

  it('adds a clinical_notes column to the owning patient row', () => {
    expect(clinicalNotesMigrationSql).toContain('alter table public.patients')
    expect(clinicalNotesMigrationSql).toContain('add column if not exists clinical_notes text')
  })
})
