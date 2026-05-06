/**
 * [INPUT]: 依赖 @/types/patient 的 PatientRecord、@/lib/patient-metrics 的体格指标格式化与 components/record/types 的展示类型。
 * [OUTPUT]: 对外提供真实 PatientRecord 到含癌种/身高/体重/BMI summary metrics 与 00 起算/中文线别/补充资料归一的紧凑 timeline entries 派生函数。
 * [POS]: components/record 的展示数据转换层，使 dossier JSX 不直接理解 PatientRecord 内部结构，并统一真实记录的中文治疗线别、BMI 与详情格式，避免把基础信息和治疗线编号重复塞入时间线。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { Locale } from '@/lib/locale'
import { formatBmi, formatHeight, formatWeight } from '@/lib/patient-metrics'
import type { PatientRecord } from '@/types/patient'

import type { Metric, TimelineEntry } from './types'
import { getTreatmentLineSubtitle } from './record-line-labels'

function hasValue(value: unknown) {
  return typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null
}

function displayValue(value: unknown, fallback = '--') {
  if (!hasValue(value)) {
    return fallback
  }

  return typeof value === 'string' ? value.trim() : String(value)
}

function displayRecordAge(age: number | undefined, locale: Locale) {
  if (!Number.isFinite(age)) {
    return '--'
  }

  return locale === 'zh' ? `${age} 岁` : `${age} years`
}

function firstTreatmentLine(record: PatientRecord) {
  return record.treatmentLines.find((line) => line.lineNumber === 1) ?? record.treatmentLines[0]
}

function getRecordGeneticTest(record: PatientRecord) {
  return record.initialOnset?.geneticTest ?? firstTreatmentLine(record)?.geneticTest
}

function getRecordIhc(record: PatientRecord) {
  return record.initialOnset?.immunohistochemistry ?? firstTreatmentLine(record)?.immunohistochemistry
}

function getCurrentRegimen(record: PatientRecord) {
  const latestLine = [...record.treatmentLines].sort((left, right) => right.lineNumber - left.lineNumber)[0]
  return latestLine?.regimen ?? record.initialOnset?.treatment
}

function getTreatmentLineEvidenceItems(line: PatientRecord['treatmentLines'][number], locale: Locale) {
  const items: { label: string; value: string }[] = []

  if (hasValue(line.immunohistochemistry)) {
    items.push({ label: locale === 'zh' ? '免疫组化' : 'IHC', value: displayValue(line.immunohistochemistry) })
  }

  if (hasValue(line.geneticTest)) {
    items.push({ label: locale === 'zh' ? '基因检测' : 'Genetic Test', value: displayValue(line.geneticTest) })
  }

  if (hasValue(line.biopsy)) {
    items.push({ label: '', value: displayValue(line.biopsy) })
  }

  return items
}

export function getRecordSummaryMetrics(record: PatientRecord, locale: Locale): Metric[] {
  const basicInfo = record.basicInfo

  return locale === 'zh'
    ? [
        { label: '癌种', value: displayValue(basicInfo?.tumorType) },
        { label: '年龄', value: displayRecordAge(basicInfo?.age, locale) },
        { label: '性别', value: displayValue(basicInfo?.gender) },
        { label: '身高', value: formatHeight(basicInfo?.height) },
        { label: '体重', value: formatWeight(basicInfo?.weight) },
        { label: 'BMI', value: formatBmi(basicInfo?.height, basicInfo?.weight) },
        { label: '肿瘤分期', value: displayValue(basicInfo?.stage) },
        { label: '随访状态', value: record.treatmentLines.length > 0 ? '治疗中' : '待补充' },
        { label: '诊断日期', value: displayValue(basicInfo?.diagnosisDate) },
        { label: '基因检测', value: displayValue(getRecordGeneticTest(record)) },
        { label: '免疫组化', value: displayValue(getRecordIhc(record)) },
        { label: '当前方案', value: displayValue(getCurrentRegimen(record)) },
      ]
    : [
        { label: 'Cancer Type', value: displayValue(basicInfo?.tumorType) },
        { label: 'Age', value: displayRecordAge(basicInfo?.age, locale) },
        { label: 'Gender', value: displayValue(basicInfo?.gender) },
        { label: 'Height', value: formatHeight(basicInfo?.height) },
        { label: 'Weight', value: formatWeight(basicInfo?.weight) },
        { label: 'BMI', value: formatBmi(basicInfo?.height, basicInfo?.weight) },
        { label: 'Tumor Stage', value: displayValue(basicInfo?.stage) },
        { label: 'Follow-up Status', value: record.treatmentLines.length > 0 ? 'In treatment' : 'Missing' },
        { label: 'Diagnosis Date', value: displayValue(basicInfo?.diagnosisDate) },
        { label: 'Genetic Test', value: displayValue(getRecordGeneticTest(record)) },
        { label: 'IHC', value: displayValue(getRecordIhc(record)) },
        { label: 'Current Plan', value: displayValue(getCurrentRegimen(record)) },
      ]
}

export function getRecordTimelineEntries(record: PatientRecord, locale: Locale): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  if (record.initialOnset) {
    entries.push({
      body: [],
      cards: [
        {
          items: [
            { label: locale === 'zh' ? '免疫组化' : 'IHC', value: displayValue(record.initialOnset.immunohistochemistry) },
            { label: locale === 'zh' ? '基因检测' : 'Genetic Test', value: displayValue(record.initialOnset.geneticTest) },
          ],
          title: locale === 'zh' ? '补充资料' : 'Supplement',
        },
      ],
      index: '00',
      meta: [],
      subtitle: locale === 'zh' ? '基线' : 'Baseline',
      timeframe: displayValue(record.initialOnset.triggerDate),
      title: locale === 'zh' ? '初发诊断' : 'Initial Diagnosis',
      treatment: displayValue(record.initialOnset.treatment, locale === 'zh' ? '初发治疗待补充' : 'Initial treatment missing'),
    })
  }

  record.treatmentLines
    .slice()
    .sort((left, right) => left.lineNumber - right.lineNumber)
    .forEach((line) => {
      const evidenceItems = getTreatmentLineEvidenceItems(line, locale)

      entries.push({
        badge: locale === 'zh' ? '已保存' : 'Saved',
        body: [],
        cards: evidenceItems.length > 0
          ? [
              {
                items: evidenceItems,
                title: locale === 'zh' ? '补充资料' : 'Supplement',
              },
            ]
          : [],
        index: String(line.lineNumber).padStart(2, '0'),
        meta: [],
        subtitle: getTreatmentLineSubtitle(line.lineNumber, locale),
        timeframe: [line.startDate, line.endDate].filter(hasValue).join(' - ') || '--',
        title: locale === 'zh' ? '治疗' : 'Therapy',
        treatment: displayValue(line.regimen, locale === 'zh' ? '治疗方案待补充' : 'Regimen missing'),
      })
    })

  if (entries.length > 0) {
    return entries
  }

  return [
    {
      body: [locale === 'zh' ? '这份病历还没有治疗线信息。' : 'No treatment-line information has been saved yet.'],
      cards: [],
      index: '00',
      meta: [],
      subtitle: locale === 'zh' ? '待补充' : 'Missing',
      timeframe: '--',
      title: locale === 'zh' ? '治疗时间线待补充' : 'Treatment Timeline Missing',
      treatment: locale === 'zh' ? '请回到工作台补充结构化病历。' : 'Return to the workspace to complete this record.',
    },
  ]
}
