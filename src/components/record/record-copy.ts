/**
 * [INPUT]: 依赖 @/lib/locale 的 Locale 类型、demo-record 的默认病例、record-line-labels 的中文线别与 components/record/types 的展示类型。
 * [OUTPUT]: 对外提供 record labels、含癌种/体格指标占位的 demo summaryMetrics 与 00 起算/中文线别/补充资料归一的逐线演示时间线文案。
 * [POS]: components/record 的静态文案模块，被 RecordDossier 和路由错误态复用；默认病例原始数据留在 demo-record，本文只做文案与 timeline 组装。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { Locale } from '@/lib/locale'

import { demoPatientRecord } from './demo-record'
import { getTreatmentLineSubtitle } from './record-line-labels'
import type { Metric, TimelineEntry } from './types'

export const labels = {
  en: {
    access: 'Protected medical record / Authorized access only',
    aiStatus: 'AI Verification',
    archiveComplete: 'Archive complete · unchanged',
    back: 'Back to workspace',
    clinicalNotes: 'Clinical Notes',
    completeness: 'Data Completeness',
    exportError: 'Export failed. Please try again later.',
    exportPdf: 'Export PDF',
    exportPdfLoading: 'Exporting PDF...',
    exportPng: 'Export PNG',
    exportPngLoading: 'Exporting PNG...',
    footer: 'Firefly Core System V3.1',
    loadingRecord: 'Loading medical record...',
    loadRecordError: 'Unable to load this medical record.',
    missingRecord: 'No authorized medical record was found for this ID.',
    pageTitle: 'Clinical History Dossier',
    timeline: 'Treatment Timeline',
    verified: 'AI VERIFIED',
  },
  zh: {
    access: '受控医疗记录 / 仅限授权访问',
    aiStatus: 'AI 验证状态',
    archiveComplete: '档案完整 · 未篡改',
    back: '返回工作台',
    clinicalNotes: '临床备注',
    completeness: '数据完整性',
    exportError: '导出失败，请稍后重试。',
    exportPdf: '导出 PDF',
    exportPdfLoading: '导出 PDF 中...',
    exportPng: '导出 PNG',
    exportPngLoading: '导出 PNG 中...',
    footer: '萤岛核心系统 V3.1',
    loadingRecord: '正在载入病历...',
    loadRecordError: '无法载入这份病历。',
    missingRecord: '没有找到当前账号可访问的病历。',
    pageTitle: '临床病史档案',
    timeline: '治疗时间线',
    verified: 'AI VERIFIED',
  },
} satisfies Record<Locale, Record<string, string>>

export const summaryMetrics = {
  en: [
    { label: 'Cancer Type', value: 'Breast cancer' },
    { label: 'Gender', value: 'Female' },
    { label: 'Age', value: 'Not provided' },
    { label: 'Height', value: '--' },
    { label: 'Weight', value: '--' },
    { label: 'BMI', value: '--' },
    { label: 'Tumor Stage', value: 'Relapsed advanced' },
    { label: 'Follow-up Status', value: 'In treatment' },
    { label: 'Diagnosis Date', value: '2021.07' },
    { label: 'Genetic Test', value: 'PTEN loss / FGFR1 amp' },
    { label: 'IHC', value: 'Luminal B -> TNBC shift' },
    { label: 'Current Plan', value: 'PARP + CDK4/6 + SERM' },
  ],
  zh: [
    { label: '癌种', value: '乳腺癌' },
    { label: '性别', value: '女' },
    { label: '年龄', value: '未提供' },
    { label: '身高', value: '--' },
    { label: '体重', value: '--' },
    { label: 'BMI', value: '--' },
    { label: '肿瘤分期', value: '复发/晚期' },
    { label: '随访状态', value: '治疗中' },
    { label: '诊断日期', value: '2021.07' },
    { label: '基因检测', value: 'PTEN 缺失 / FGFR1 扩增' },
    { label: '免疫组化', value: 'Luminal B -> 三阴转化' },
    { label: '当前方案', value: 'PARP + CDK4/6 + SERM' },
  ],
} satisfies Record<Locale, Metric[]>

type DemoTreatmentLine = typeof demoPatientRecord.treatmentLines[number]

function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function cleanText(value: string | undefined) {
  return hasText(value) ? value.trim() : ''
}

function getLineTimeframe(line: DemoTreatmentLine, locale: Locale) {
  const start = cleanText(line.startDate)
  const end = cleanText(line.endDate)

  if (start && end) {
    return `${start} - ${end}`
  }

  if (start) {
    return start
  }

  return locale === 'zh' ? '时间待补充' : 'Date pending'
}

function getSupplementItems(line: DemoTreatmentLine, locale: Locale) {
  const items: { label: string; value: string }[] = []

  if (line.immunohistochemistry) {
    items.push({ label: locale === 'zh' ? '免疫组化' : 'IHC', value: line.immunohistochemistry })
  }

  if (line.geneticTest) {
    items.push({ label: locale === 'zh' ? '基因检测' : 'Genetic Test', value: line.geneticTest })
  }

  if (line.biopsy) {
    items.push({ label: '', value: line.biopsy })
  }

  return items
}

function buildInitialTimelineEntry(locale: Locale): TimelineEntry {
  if (locale === 'en') {
    return {
      body: [],
      cards: [
        {
          items: [
            { label: 'IHC', value: 'Luminal B; ER / PR 90%+ / 90%+; HER2 0; Ki67 60%' },
          ],
          title: 'Supplement',
        },
      ],
      index: '00',
      meta: [],
      subtitle: 'Baseline',
      timeframe: '2021.07 - 2022.10',
      title: 'Initial Treatment',
      treatment: 'AC x4 / RT 25+5 / Exemestane + Leuprorelin',
    }
  }

  return {
    body: [],
    cards: [
      {
        items: [
          { label: '免疫组化', value: 'Luminal B；ER / PR 90%+ / 90%+；HER2 0；Ki67 60%' },
        ],
        title: '补充资料',
      },
    ],
    index: '00',
    meta: [],
    subtitle: '基线',
    timeframe: '2021.07 - 2022.10',
    title: '初发治疗',
    treatment: 'AC方案4次 / 放疗25+5 / 依西美坦 + 亮丙',
  }
}

function buildLineTimelineEntry(line: DemoTreatmentLine, sequence: number, locale: Locale): TimelineEntry {
  const isOpen = !hasText(line.endDate)
  const supplementItems = getSupplementItems(line, locale)

  return {
    badge: isOpen ? (locale === 'zh' ? '进行中' : 'Ongoing') : undefined,
    body: [],
    cards: supplementItems.length > 0
      ? [
          {
            items: supplementItems,
            title: locale === 'zh' ? '补充资料' : 'Supplement',
          },
        ]
      : [],
    index: String(sequence).padStart(2, '0'),
    meta: [],
    subtitle: getTreatmentLineSubtitle(line.lineNumber, locale),
    timeframe: getLineTimeframe(line, locale),
    title: locale === 'zh' ? '治疗' : 'Therapy',
    treatment: cleanText(line.regimen) || (locale === 'zh' ? '治疗方案待补充' : 'Regimen pending'),
  }
}

export function getTimelineEntries(locale: Locale): TimelineEntry[] {
  return [
    buildInitialTimelineEntry(locale),
    ...demoPatientRecord.treatmentLines
      .slice()
      .sort((left, right) => left.lineNumber - right.lineNumber)
      .map((line, index) => buildLineTimelineEntry(line, index + 1, locale)),
  ]
}
