/**
 * [INPUT]: 依赖 node:fs 读取 Supabase 迁移，依赖 vitest 断言，依赖 ./patient-record-storage 的 PatientRecord 持久化映射工具。
 * [OUTPUT]: 对外提供 lab_results 迁移/RLS 合同与患者记录 labResults row 映射测试。
 * [POS]: lib 的数据边界测试，约束患者记录读取/落库与实验室指标 RLS 不分叉。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { mapLabResultRow, toLabResultPayload } from './patient-record-storage'

const migrationSql = readFileSync(resolve(process.cwd(), 'supabase/migrations/002_lab_results.sql'), 'utf8')

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
