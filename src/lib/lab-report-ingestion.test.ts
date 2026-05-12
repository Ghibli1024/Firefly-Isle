/**
 * [INPUT]: 依赖 vitest 断言，依赖 ./lab-report-ingestion 的 OCR 文本复核行构建、确认读数输出和阻塞复核判断。
 * [OUTPUT]: 对外提供网页端实验室报告摄入纯逻辑回归测试，覆盖 OCR candidate 复核、保存前修正、未解析行与 CBC 派生 payload。
 * [POS]: lib 的实验室报告摄入测试，确保网页端上传路径不依赖本地 Excel 且保存前必须形成可复核结构。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vitest'

import { buildLabReportDate, extractLabReportReviewRows, hasBlockingReviewRows, toConfirmedLabReadings, type LabReviewRow } from './lab-report-ingestion'

describe('lab report ingestion', () => {
  it('extracts dated OCR rows into editable review rows', () => {
    const rows = extractLabReportReviewRows(
      [
        '检验日期：2026年5月10日',
        '白细胞 2.8 10^9/L 参考范围 3.5-9.5',
        '中性粒细胞绝对值 1.8',
        '淋巴细胞绝对值 0.9',
        '血小板 180',
      ].join('\n'),
      'blood-routine',
    )

    expect(buildLabReportDate('报告日期 2026/5/10')).toBe('2026-05-10')
    expect(rows[0]).toMatchObject({
      itemCode: 'wbc',
      referenceHigh: '9.5',
      referenceLow: '3.5',
      status: 'mapped',
      testDate: '2026-05-10',
      value: '2.8',
    })
  })

  it('turns confirmed review rows into direct and derived lab readings', () => {
    const rows = extractLabReportReviewRows(
      ['2026-05-10', '中性粒细胞绝对值 1.8', '淋巴细胞绝对值 0.9', '单核细胞绝对值 0.27', '血小板 180'].join('\n'),
      'blood-routine',
    )

    expect(toConfirmedLabReadings(rows, 'blood-routine')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ itemCode: 'neutrophil_abs', source: 'ocr' }),
        expect.objectContaining({ itemCode: 'nlr', isDerived: true, source: 'derived', value: 2 }),
        expect.objectContaining({ itemCode: 'plr', isDerived: true, value: 200 }),
        expect.objectContaining({ itemCode: 'mlr', isDerived: true, value: 0.3 }),
      ]),
    )
  })

  it('blocks unresolved included rows but allows excluded rows', () => {
    const row: LabReviewRow = {
      id: 'row-1',
      include: true,
      itemCode: '',
      itemName: '未知',
      message: '需要复核',
      rawText: '未知指标 1',
      referenceHigh: '',
      referenceLow: '',
      status: 'needs-review',
      testDate: '2026-05-10',
      unit: '',
      value: '1',
    }

    expect(hasBlockingReviewRows([row])).toBe(true)
    expect(hasBlockingReviewRows([{ ...row, include: false }])).toBe(false)
  })
})
