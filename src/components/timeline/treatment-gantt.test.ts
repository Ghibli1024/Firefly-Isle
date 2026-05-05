/**
 * [INPUT]: 依赖 vitest 的 describe/it/expect，依赖 ./treatment-gantt 的 buildTreatmentGanttRows。
 * [OUTPUT]: 对外提供治疗线甘特数据归一化回归测试。
 * [POS]: components/timeline 的纯逻辑测试，约束治疗线排序、缺失日期、持续时间 bar 与当前治疗线判定。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vitest'

import type { TreatmentLine } from '@/types/patient'

import { buildTreatmentGanttRows } from './treatment-gantt'

describe('buildTreatmentGanttRows', () => {
  it('orders treatment lines and maps complete date ranges to proportional bars', () => {
    const rows = buildTreatmentGanttRows([
      { endDate: '2024-02', lineNumber: 2, regimen: 'Docetaxel', startDate: '2023-11' },
      { endDate: '2023-10', lineNumber: 1, regimen: 'Osimertinib', startDate: '2023-05' },
      { lineNumber: 3, regimen: 'Clinical trial', startDate: '2024-03' },
    ])

    expect(rows.map((row) => row.lineNumber)).toEqual([1, 2, 3])
    expect(rows[0]).toMatchObject({
      bar: {
        leftPercent: 0,
      },
      isCurrent: false,
      status: 'complete',
    })
    expect(rows[1].bar?.leftPercent).toBeGreaterThan(rows[0].bar?.leftPercent ?? 0)
    expect(rows[1].bar?.widthPercent).toBeGreaterThan(0)
    expect(rows[2]).toMatchObject({
      bar: null,
      isCurrent: true,
      status: 'pending',
    })
  })

  it('does not create fake bars for missing start or end dates', () => {
    const rows = buildTreatmentGanttRows([
      { endDate: '2023-10', lineNumber: 1, regimen: 'Missing start' },
      { lineNumber: 2, regimen: 'Missing end', startDate: '2023-11' },
    ])

    expect(rows).toHaveLength(2)
    expect(rows.every((row) => row.status === 'pending')).toBe(true)
    expect(rows.every((row) => row.bar === null)).toBe(true)
  })

  it('handles empty treatment lines without synthetic rows', () => {
    expect(buildTreatmentGanttRows([] satisfies TreatmentLine[])).toEqual([])
  })
})
