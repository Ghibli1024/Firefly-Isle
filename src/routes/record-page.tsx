/**
 * [INPUT]: 依赖 @/components/app-shell 的 V3 可变侧栏与顶部状态条，依赖 @/components/system/surfaces 的 MainShell，点击正式导出时动态加载 @/lib/export-record，依赖 @/lib/theme 的响应式 shell 宽度合同与 locale 状态，依赖 react-router-dom 的 useParams，接收当前会话身份标签。
 * [OUTPUT]: 对外提供 RecordPage 组件，对应 /record/:id。
 * [POS]: routes 的档案详情 orchestration 层，按宽幅响应式长卷病历复刻临床概要、纵向治疗时间线、右侧证据卡、正式导出入口与底部审计状态，不改变路由或认证出口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ArchiveSideNav, ClinicalTopBar } from '@/components/app-shell'
import { MainShell } from '@/components/system/surfaces'
import { useLocale, type Locale } from '@/lib/locale'
import { getSupabaseClient } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { shellWideContentClass, sidebarOffsetClass, topBarOffsetClass } from '@/lib/theme/tokens'
import type { PatientRecord, TreatmentLine } from '@/types/patient'

type RecordPageProps = {
  isSigningOut?: boolean
  onSignOut?: () => void
  userIsAnonymous?: boolean
  userLabel?: string
}

type ExportFormat = 'pdf' | 'png'

type RecordExportState = {
  error: string | null
  format: ExportFormat | null
  isExporting: boolean
}

type RecordLoadState = {
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

type Metric = {
  label: string
  value: string
}

type EvidenceItem = {
  label: string
  value: string
}

type EvidenceCard = {
  title: string
  items: EvidenceItem[]
}

type TimelineEntry = {
  badge?: string
  body: string[]
  cards: EvidenceCard[]
  footMetrics?: Metric[]
  highlight?: {
    body: string
    title: string
  }
  index: string
  meta: Metric[]
  subtitle: string
  timeframe: string
  title: string
  treatment: string
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

async function loadPatientRecordById(recordId: string): Promise<PatientRecord | null> {
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

const labels = {
  en: {
    access: 'Protected medical record / Authorized access only',
    aiStatus: 'AI Verification',
    archiveComplete: 'Archive complete · unchanged',
    back: 'Back to workspace',
    clinicalNotes: 'Clinical Notes',
    completeness: 'Data Completeness',
    dossier: 'CLINICAL HISTORY DOSSIER',
    exportError: 'Export failed. Please try again later.',
    exportPdf: 'Export PDF',
    exportPdfLoading: 'Exporting PDF...',
    exportPng: 'Export PNG',
    exportPngLoading: 'Exporting PNG...',
    footer: 'Firefly Core System V3.1',
    headerSubtitle: 'Zhang San · NSCLC · EGFR L858R',
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
    dossier: 'CLINICAL HISTORY DOSSIER',
    exportError: '导出失败，请稍后重试。',
    exportPdf: '导出 PDF',
    exportPdfLoading: '导出 PDF 中...',
    exportPng: '导出 PNG',
    exportPngLoading: '导出 PNG 中...',
    footer: '萤岛核心系统 V3.1',
    headerSubtitle: '张三 · NSCLC · EGFR L858R',
    loadingRecord: '正在载入病历...',
    loadRecordError: '无法载入这份病历。',
    missingRecord: '没有找到当前账号可访问的病历。',
    pageTitle: '临床病史档案',
    timeline: '治疗时间线',
    verified: 'AI VERIFIED',
  },
} satisfies Record<Locale, Record<string, string>>

const summaryMetrics = {
  en: [
    { label: 'Age', value: '56 years' },
    { label: 'Gender', value: 'Female' },
    { label: 'Tumor Stage', value: 'Stage IV' },
    { label: 'Follow-up Status', value: 'Stable follow-up' },
    { label: 'Diagnosis Date', value: '2023.04' },
    { label: 'Genetic Test', value: 'EGFR L858R' },
    { label: 'IHC', value: 'PD-L1 TPS 45%' },
    { label: 'Current Plan', value: 'Second-line therapy' },
  ],
  zh: [
    { label: '年龄', value: '56 岁' },
    { label: '性别', value: '女' },
    { label: '肿瘤分期', value: 'IV 期' },
    { label: '随访状态', value: '稳定随访' },
    { label: '诊断日期', value: '2023.04' },
    { label: '基因检测', value: 'EGFR L858R' },
    { label: '免疫组化', value: 'PD-L1 TPS 45%' },
    { label: '当前方案', value: '二线治疗' },
  ],
} satisfies Record<Locale, Metric[]>

function getTimelineEntries(locale: Locale): TimelineEntry[] {
  if (locale === 'en') {
    return [
      {
        body: [
          'The patient presented in April 2023 with persistent cough.',
          'CT showed a left upper lung lesion (3.2cm x 2.8cm) with mediastinal lymphadenopathy. Biopsy confirmed lung adenocarcinoma.',
        ],
        cards: [
          {
            items: [
              { label: 'PD-L1', value: 'TPS: 45%' },
              { label: 'TTF-1', value: '(+)' },
              { label: 'Napsin A', value: '(+)' },
            ],
            title: 'Immunohistochemistry',
          },
          {
            items: [
              { label: 'EGFR', value: 'L858R (positive)' },
              { label: 'ALK', value: 'Negative' },
              { label: 'ROS1', value: 'Negative' },
              { label: 'RET', value: 'Negative' },
              { label: 'Test Date', value: '2023.04' },
            ],
            title: 'Genetic Test',
          },
        ],
        index: '01',
        meta: [
          { label: 'Diagnosis Date', value: '2023.04' },
          { label: 'Clinical Stage', value: 'IIIA (T2N2M0)' },
          { label: 'Pathology', value: 'Adenocarcinoma' },
          { label: 'Specimen', value: 'Tested' },
        ],
        subtitle: 'Initial',
        timeframe: '2023.04',
        title: 'Initial Diagnosis',
        treatment: 'Non-small cell lung cancer (NSCLC)',
      },
      {
        badge: 'Phase complete',
        body: [
          'The patient started third-generation EGFR-TKI therapy.',
          'Initial response was good, with tumor volume reduced by about 40%. After 9 months, imaging showed left lung progression and small brain metastases.',
        ],
        cards: [
          {
            items: [
              { label: 'Best Response', value: 'PR partial response' },
              { label: 'Duration', value: '9 months' },
              { label: 'Progression Date', value: '2024.02' },
              { label: 'Overall', value: 'Disease progression (PD)' },
            ],
            title: 'Efficacy Assessment',
          },
        ],
        highlight: {
          body: 'EGFR T790M mutation loss detected with MET amplification (FISH positive).',
          title: 'Resistance Analysis',
        },
        index: '02',
        meta: [],
        subtitle: 'Treatment Line 1',
        timeframe: '2023.05 - 2024.02',
        title: 'First-line Therapy',
        treatment: 'Osimertinib targeted therapy',
      },
      {
        badge: 'In progress',
        body: [
          'For MET amplification, the plan was adjusted to chemotherapy plus MET inhibition.',
          'Four cycles are complete. Dyspnea has improved and brain lesions remain stable.',
        ],
        cards: [
          {
            items: [
              { label: 'Treatment Cycle', value: '4 / 6' },
              { label: 'Imaging', value: 'SD stable' },
              { label: 'Brain Metastasis', value: 'Stable' },
              { label: 'Next Plan', value: 'Continue current plan' },
            ],
            title: 'Efficacy Assessment',
          },
        ],
        footMetrics: [
          { label: 'Regimen Match', value: '94.2%' },
          { label: 'Stability', value: 'Stable expected' },
        ],
        index: '03',
        meta: [],
        subtitle: 'Treatment Line 2',
        timeframe: '2024.03 - Present',
        title: 'Second-line Therapy',
        treatment: 'Pemetrexed + Carboplatin + Savolitinib',
      },
    ]
  }

  return [
    {
      body: [
        '患者于 2023 年 4 月因持续性咳嗽就诊。',
        'CT 检查显示左上肺占位性病变（3.2cm x 2.8cm），伴有纵隔淋巴结肿大。活检病理确认为肺腺癌。',
      ],
      cards: [
        {
          items: [
            { label: 'PD-L1', value: 'TPS: 45%' },
            { label: 'TTF-1', value: '(+)' },
            { label: 'Napsin A', value: '(+)' },
          ],
          title: '免疫组化',
        },
        {
          items: [
            { label: 'EGFR', value: 'L858R（突变阳性）' },
            { label: 'ALK', value: '阴性' },
            { label: 'ROS1', value: '阴性' },
            { label: 'RET', value: '阴性' },
            { label: '检查日期', value: '2023.04' },
          ],
          title: '基因检测',
        },
      ],
      index: '01',
      meta: [
        { label: '诊断日期', value: '2023.04' },
        { label: '临床分期', value: 'IIIA（T2N2M0）' },
        { label: '病理类型', value: '腺癌' },
        { label: '生物标本状态', value: '已检测' },
      ],
      subtitle: '初发',
      timeframe: '2023.04',
      title: '初发诊断',
      treatment: '非小细胞肺癌（NSCLC）',
    },
    {
      badge: '阶段完成',
      body: [
        '患者开始接受第三代 EGFR-TKI 治疗。',
        '初始反应良好，肿瘤体积缩小约 40%。治疗 9 个月后，复查显示左肺病灶增大，并出现微小脑转移灶，判定为疾病进展。',
      ],
      cards: [
        {
          items: [
            { label: '最佳疗效', value: 'PR 部分缓解' },
            { label: '缓解持续时间', value: '9 个月' },
            { label: '疾病进展日期', value: '2024.02' },
            { label: '总体评估', value: '疾病进展 (PD)' },
          ],
          title: '疗效评估',
        },
      ],
      highlight: {
        body: '检测到 EGFR T790M 突变消失，伴随 MET 基因扩增（FISH 阳性）。',
        title: '耐药分析',
      },
      index: '02',
      meta: [],
      subtitle: '治疗线 1',
      timeframe: '2023.05 - 2024.02',
      title: '一线治疗',
      treatment: '奥希替尼靶向治疗 (Osimertinib)',
    },
    {
      badge: '进行中',
      body: [
        '针对 MET 扩增，调整方案为化疗联合 MET 抑制剂治疗。',
        '目前已完成 4 个周期，患者自述呼吸困难症状缓解，脑部病灶稳定。',
      ],
      cards: [
        {
          items: [
            { label: '治疗周期', value: '4 / 6' },
            { label: '影像学评估', value: 'SD 稳定' },
            { label: '脑转移状态', value: '稳定' },
            { label: '下一步计划', value: '继续当前方案' },
          ],
          title: '疗效评估',
        },
      ],
      footMetrics: [
        { label: '方案匹配度', value: '94.2%' },
        { label: '稳定性评估', value: '稳定预期' },
      ],
      index: '03',
      meta: [],
      subtitle: '治疗线 2',
      timeframe: '2024.03 - 至今',
      title: '二线治疗',
      treatment: '培美曲塞 + 卡铂 + 赛沃替尼 (Savolitinib)',
    },
  ]
}

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

function getRecordSummaryMetrics(record: PatientRecord, locale: Locale): Metric[] {
  const basicInfo = record.basicInfo

  return locale === 'zh'
    ? [
        { label: '年龄', value: displayRecordAge(basicInfo?.age, locale) },
        { label: '性别', value: displayValue(basicInfo?.gender) },
        { label: '肿瘤分期', value: displayValue(basicInfo?.stage) },
        { label: '随访状态', value: record.treatmentLines.length > 0 ? '治疗中' : '待补充' },
        { label: '诊断日期', value: displayValue(basicInfo?.diagnosisDate) },
        { label: '基因检测', value: displayValue(getRecordGeneticTest(record)) },
        { label: '免疫组化', value: displayValue(getRecordIhc(record)) },
        { label: '当前方案', value: displayValue(getCurrentRegimen(record)) },
      ]
    : [
        { label: 'Age', value: displayRecordAge(basicInfo?.age, locale) },
        { label: 'Gender', value: displayValue(basicInfo?.gender) },
        { label: 'Tumor Stage', value: displayValue(basicInfo?.stage) },
        { label: 'Follow-up Status', value: record.treatmentLines.length > 0 ? 'In treatment' : 'Missing' },
        { label: 'Diagnosis Date', value: displayValue(basicInfo?.diagnosisDate) },
        { label: 'Genetic Test', value: displayValue(getRecordGeneticTest(record)) },
        { label: 'IHC', value: displayValue(getRecordIhc(record)) },
        { label: 'Current Plan', value: displayValue(getCurrentRegimen(record)) },
      ]
}

function getRecordHeaderSubtitle(record: PatientRecord, locale: Locale) {
  const parts = [
    record.basicInfo?.tumorType,
    record.basicInfo?.stage,
    getRecordGeneticTest(record),
  ]
    .filter(hasValue)
    .map((part) => String(part).trim())

  if (parts.length > 0) {
    return parts.join(' · ')
  }

  return locale === 'zh' ? '已保存病历' : 'Saved medical record'
}

function getRecordTimelineEntries(record: PatientRecord, locale: Locale): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  if (record.initialOnset) {
    entries.push({
      body: [
        record.initialOnset.triggerDate
          ? locale === 'zh'
            ? `初发时间：${record.initialOnset.triggerDate}`
            : `Initial onset: ${record.initialOnset.triggerDate}`
          : locale === 'zh'
            ? '初发信息已记录。'
            : 'Initial onset information recorded.',
        record.initialOnset.treatment
          ? locale === 'zh'
            ? `治疗方案：${record.initialOnset.treatment}`
            : `Treatment: ${record.initialOnset.treatment}`
          : locale === 'zh'
            ? '初发治疗方案待补充。'
            : 'Initial treatment plan missing.',
      ],
      cards: [
        {
          items: [
            { label: locale === 'zh' ? '免疫组化' : 'IHC', value: displayValue(record.initialOnset.immunohistochemistry) },
            { label: locale === 'zh' ? '基因检测' : 'Genetic Test', value: displayValue(record.initialOnset.geneticTest) },
          ],
          title: locale === 'zh' ? '初发检测' : 'Initial Testing',
        },
      ],
      index: '01',
      meta: [
        { label: locale === 'zh' ? '诊断日期' : 'Diagnosis Date', value: displayValue(record.basicInfo?.diagnosisDate) },
        { label: locale === 'zh' ? '分期' : 'Stage', value: displayValue(record.basicInfo?.stage) },
        { label: locale === 'zh' ? '病理类型' : 'Pathology', value: displayValue(record.basicInfo?.tumorType) },
        { label: locale === 'zh' ? '记录 ID' : 'Record ID', value: displayValue(record.id) },
      ],
      subtitle: locale === 'zh' ? '初发' : 'Initial',
      timeframe: displayValue(record.initialOnset.triggerDate),
      title: locale === 'zh' ? '初发诊断' : 'Initial Diagnosis',
      treatment: displayValue(record.initialOnset.treatment, locale === 'zh' ? '初发治疗待补充' : 'Initial treatment missing'),
    })
  }

  record.treatmentLines
    .slice()
    .sort((left, right) => left.lineNumber - right.lineNumber)
    .forEach((line) => {
      entries.push({
        badge: locale === 'zh' ? '已保存' : 'Saved',
        body: [
          line.regimen
            ? locale === 'zh'
              ? `方案：${line.regimen}`
              : `Regimen: ${line.regimen}`
            : locale === 'zh'
              ? '治疗方案待补充。'
              : 'Treatment regimen missing.',
          line.biopsy
            ? locale === 'zh'
              ? `活检：${line.biopsy}`
              : `Biopsy: ${line.biopsy}`
            : locale === 'zh'
              ? '活检信息待补充。'
              : 'Biopsy information missing.',
        ],
        cards: [
          {
            items: [
              { label: locale === 'zh' ? '免疫组化' : 'IHC', value: displayValue(line.immunohistochemistry) },
              { label: locale === 'zh' ? '基因检测' : 'Genetic Test', value: displayValue(line.geneticTest) },
            ],
            title: locale === 'zh' ? '治疗线检测' : 'Line Testing',
          },
        ],
        index: String(entries.length + 1).padStart(2, '0'),
        meta: [
          { label: locale === 'zh' ? '开始日期' : 'Start Date', value: displayValue(line.startDate) },
          { label: locale === 'zh' ? '结束日期' : 'End Date', value: displayValue(line.endDate) },
        ],
        subtitle: locale === 'zh' ? `治疗线 ${line.lineNumber}` : `Treatment Line ${line.lineNumber}`,
        timeframe: [line.startDate, line.endDate].filter(hasValue).join(' - ') || '--',
        title: locale === 'zh' ? `${line.lineNumber}L 治疗` : `Line ${line.lineNumber} Therapy`,
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
      index: '01',
      meta: [{ label: locale === 'zh' ? '记录 ID' : 'Record ID', value: displayValue(record.id) }],
      subtitle: locale === 'zh' ? '待补充' : 'Missing',
      timeframe: '--',
      title: locale === 'zh' ? '治疗时间线待补充' : 'Treatment Timeline Missing',
      treatment: locale === 'zh' ? '请回到工作台补充结构化病历。' : 'Return to the workspace to complete this record.',
    },
  ]
}

function SummaryGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          className={[
            'min-h-[100px] border-[var(--ff-border-default)] p-6',
            index < metrics.length - 1 ? 'border-b' : '',
            index % 2 === 0 ? 'sm:border-r' : '',
            index < metrics.length - 2 ? 'sm:border-b' : 'sm:border-b-0',
            index % 4 !== 3 ? 'lg:border-r' : 'lg:border-r-0',
            index < 4 ? 'lg:border-b' : 'lg:border-b-0',
          ].join(' ')}
          key={metric.label}
        >
          <div className="text-sm text-[var(--ff-text-muted)]">{metric.label}</div>
          <div className="mt-3 text-2xl font-semibold tracking-normal">{metric.value}</div>
        </div>
      ))}
    </div>
  )
}

function EvidenceCardView({ card }: { card: EvidenceCard }) {
  return (
    <article className="rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-5">
      <h4 className="mb-4 font-bold text-[var(--ff-accent-primary)]">{card.title}</h4>
      <div className="space-y-3">
        {card.items.map((item) => (
          <div className="flex justify-between gap-6 border-b border-[var(--ff-border-muted)] pb-2 text-sm" key={item.label}>
            <span className="text-[var(--ff-text-secondary)]">{item.label}</span>
            <span className="text-right font-medium text-[var(--ff-text-primary)]">{item.value}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function TimelineNode({ entry }: { entry: TimelineEntry }) {
  return (
    <article className="relative grid gap-6 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,32%)] xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] 2xl:p-8">
      <div>
        <div className="mb-5 flex flex-wrap items-end gap-4">
          <span className="font-[var(--ff-font-mono)] text-5xl font-bold text-[var(--ff-accent-primary)]">{entry.index}</span>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-3xl font-bold tracking-normal">{entry.title}</h3>
              <span className="text-sm text-[var(--ff-text-muted)]">/ {entry.subtitle}</span>
              {entry.badge ? (
                <span className="rounded-[var(--ff-radius-full)] border border-[color:color-mix(in_srgb,var(--ff-accent-success)_42%,var(--ff-border-default))] bg-[color:color-mix(in_srgb,var(--ff-accent-success)_10%,var(--ff-surface-panel))] px-3 py-1 text-sm text-[var(--ff-accent-success)]">
                  {entry.badge}
                </span>
              ) : null}
            </div>
            <div className="mt-3 font-[var(--ff-font-mono)] text-sm text-[var(--ff-text-secondary)]">{entry.timeframe}</div>
          </div>
        </div>

        <h4 className="mb-4 text-2xl font-semibold">{entry.treatment}</h4>
        <div className="space-y-2 text-base leading-8 text-[var(--ff-text-secondary)]">
          {entry.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {entry.meta.length > 0 ? (
          <div className="mt-10 grid border-t border-[var(--ff-border-default)] pt-5 sm:grid-cols-2 xl:grid-cols-4">
            {entry.meta.map((item, index) => (
              <div
                className={[
                  'border-[var(--ff-border-default)] pr-4',
                  index < entry.meta.length - 1 ? 'border-b pb-4' : '',
                  index < entry.meta.length - 2 ? 'sm:border-b sm:pb-4' : 'sm:border-b-0 sm:pb-0',
                  'xl:border-b-0 xl:pb-0',
                  index % 2 === 0 ? 'sm:border-r' : 'sm:border-r-0',
                  index % 4 !== 3 ? 'xl:border-r' : 'xl:border-r-0',
                ].join(' ')}
                key={item.label}
              >
                <div className="text-xs text-[var(--ff-text-muted)]">{item.label}</div>
                <div className="mt-2 text-sm font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {entry.highlight ? (
          <div className="mt-6 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] p-5">
            <h5 className="font-bold text-[var(--ff-accent-primary)]">{entry.highlight.title}</h5>
            <p className="mt-2 text-sm leading-7 text-[var(--ff-text-secondary)]">{entry.highlight.body}</p>
          </div>
        ) : null}

        {entry.footMetrics ? (
          <div className="mt-6 grid rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] sm:grid-cols-2">
            {entry.footMetrics.map((metric, index) => (
              <div className={index === 0 ? 'border-b border-[var(--ff-border-default)] p-5 sm:border-b-0 sm:border-r' : 'p-5'} key={metric.label}>
                <div className="text-sm text-[var(--ff-text-muted)]">{metric.label}</div>
                <div className={`mt-2 text-2xl font-semibold ${index === 1 ? 'text-[var(--ff-accent-primary)]' : ''}`}>{metric.value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 border-[var(--ff-border-default)] md:border-l md:pl-6">
        {entry.cards.map((card) => (
          <EvidenceCardView card={card} key={card.title} />
        ))}
      </div>
    </article>
  )
}

function RecordDossier({
  exportError,
  exportFormat,
  isExportDisabled,
  isExporting,
  locale,
  onExport,
  record,
  recordRef,
}: {
  exportError: string | null
  exportFormat: ExportFormat | null
  isExportDisabled: boolean
  isExporting: boolean
  locale: Locale
  onExport: (format: ExportFormat) => void
  record?: PatientRecord
  recordRef: RefObject<HTMLDivElement>
}) {
  const text = labels[locale]
  const entries = record ? getRecordTimelineEntries(record, locale) : getTimelineEntries(locale)
  const metrics = record ? getRecordSummaryMetrics(record, locale) : summaryMetrics[locale]
  const headerSubtitle = record ? getRecordHeaderSubtitle(record, locale) : text.headerSubtitle

  return (
    <div
      className="w-full rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:p-8 2xl:p-10"
      ref={recordRef}
    >
      <header className="mb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-5xl font-bold leading-tight tracking-normal md:text-5xl xl:text-6xl">{text.pageTitle}</h1>
            <p className="mt-5 font-[var(--ff-font-mono)] text-xl tracking-[0.08em] text-[var(--ff-text-secondary)]">{headerSubtitle}</p>
          </div>
          <div className="text-left md:text-right">
            <div className="font-[var(--ff-font-mono)] text-sm uppercase tracking-[0.14em] text-[var(--ff-accent-primary)]">{text.dossier}</div>
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--ff-text-secondary)] md:justify-end">
              <span className="material-symbols-outlined text-base">lock</span>
              {text.access}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
              <button
                className="inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isExportDisabled || isExporting}
                onClick={() => onExport('pdf')}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">description</span>
                {isExporting && exportFormat === 'pdf' ? text.exportPdfLoading : text.exportPdf}
              </button>
              <button
                className="inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isExportDisabled || isExporting}
                onClick={() => onExport('png')}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">image</span>
                {isExporting && exportFormat === 'png' ? text.exportPngLoading : text.exportPng}
              </button>
              <Link
                className="inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold"
                to="/app"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                {text.back}
              </Link>
            </div>
            {exportError ? (
              <div className="mt-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] px-4 py-3 text-sm font-semibold text-[var(--ff-accent-primary)]">
                {exportError}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <SummaryGrid metrics={metrics} />

      <section className="mt-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-8 w-[3px] bg-[var(--ff-accent-primary)]" />
          <h2 className="text-2xl font-bold">{text.timeline}</h2>
        </div>

        <div className="relative space-y-4 pl-0 md:pl-10">
          <div className="absolute bottom-0 left-4 top-0 hidden w-px bg-[var(--ff-border-default)] md:block" />
          {entries.map((entry) => (
            <div className="relative" key={entry.index}>
              <span className="absolute left-[-35px] top-8 hidden h-4 w-4 rounded-[var(--ff-radius-full)] border-4 border-[var(--ff-surface-panel)] bg-[var(--ff-line)] md:block" />
              <TimelineNode entry={entry} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold">{text.clinicalNotes}</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ff-text-secondary)]">
              {locale === 'zh'
                ? '此档案由临床 AI 自动整理并结构化，所有数据点均经过病理报告与影像诊断交叉验证。'
                : 'This dossier is automatically structured by clinical AI and cross-checked against pathology and imaging reports.'}
            </p>
          </div>
          <div className="flex items-center gap-4 font-[var(--ff-font-mono)] text-sm text-[var(--ff-text-muted)]">
            2024-05-20 12:08:00
            <button className="flex h-10 w-10 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)]" type="button">
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 grid rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] md:grid-cols-3">
        <div className="flex items-center gap-4 border-[var(--ff-border-default)] p-6 md:border-r">
          <span className="material-symbols-outlined text-[40px]">health_and_safety</span>
          <div>
            <h3 className="font-bold">{text.aiStatus}</h3>
            <p className="mt-1 text-sm text-[var(--ff-accent-success)]">{text.verified}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border-[var(--ff-border-default)] p-6 md:border-r">
          <span className="material-symbols-outlined text-[40px]">database</span>
          <div>
            <h3 className="font-bold">{text.completeness}</h3>
            <p className="mt-1 text-sm text-[var(--ff-accent-success)]">
              {locale === 'zh' ? '所有必填字段已完整捕获' : 'All required fields captured'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6">
          <span className="material-symbols-outlined text-[40px] text-[var(--ff-accent-primary)]">verified</span>
          <div>
            <h3 className="text-2xl font-bold">
              <span className="text-[var(--ff-accent-primary)]">AI</span> VERIFIED
            </h3>
            <p className="mt-1 text-sm text-[var(--ff-text-secondary)]">{text.archiveComplete}</p>
          </div>
        </div>
      </section>

      <footer className="mt-6 flex flex-col gap-2 border-t border-[var(--ff-border-default)] pt-5 font-[var(--ff-font-mono)] text-xs text-[var(--ff-text-muted)] md:flex-row md:justify-between">
        <span>{text.footer}</span>
        <span>LAST_UPDATE: 2024.05.20 12:08:00</span>
      </footer>
    </div>
  )
}

function RecordUnavailableDossier({
  exportError,
  exportFormat,
  isExporting,
  locale,
  message,
  onExport,
}: {
  exportError: string | null
  exportFormat: ExportFormat | null
  isExporting: boolean
  locale: Locale
  message: string
  onExport: (format: ExportFormat) => void
}) {
  const text = labels[locale]

  return (
    <div className="w-full rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5 md:p-8 2xl:p-10">
      <header className="mb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-5xl font-bold leading-tight tracking-normal md:text-5xl xl:text-6xl">{text.pageTitle}</h1>
            <p className="mt-5 font-[var(--ff-font-mono)] text-xl tracking-[0.08em] text-[var(--ff-text-secondary)]">
              {locale === 'zh' ? '真实病历载入中' : 'Loading saved medical record'}
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="font-[var(--ff-font-mono)] text-sm uppercase tracking-[0.14em] text-[var(--ff-accent-primary)]">{text.dossier}</div>
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--ff-text-secondary)] md:justify-end">
              <span className="material-symbols-outlined text-base">lock</span>
              {text.access}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
              <button
                className="inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                disabled
                onClick={() => onExport('pdf')}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">description</span>
                {isExporting && exportFormat === 'pdf' ? text.exportPdfLoading : text.exportPdf}
              </button>
              <button
                className="inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                disabled
                onClick={() => onExport('png')}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">image</span>
                {isExporting && exportFormat === 'png' ? text.exportPngLoading : text.exportPng}
              </button>
              <Link
                className="inline-flex h-12 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-sm font-semibold"
                to="/app"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                {text.back}
              </Link>
            </div>
            {exportError ? (
              <div className="mt-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] px-4 py-3 text-sm font-semibold text-[var(--ff-accent-primary)]">
                {exportError}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 py-8 text-base font-semibold text-[var(--ff-text-secondary)]">
        {message}
      </div>
    </div>
  )
}

export function RecordPage({ isSigningOut, onSignOut, userIsAnonymous, userLabel }: RecordPageProps) {
  const { id = 'demo' } = useParams()
  const { locale } = useLocale()
  const { theme } = useTheme()
  const recordRef = useRef<HTMLDivElement>(null)
  const demoRoute = id.trim() === 'demo'
  const [recordLoadState, setRecordLoadState] = useState<RecordLoadState>(() => ({
    error: null,
    isLoading: !demoRoute,
    record: null,
    recordId: demoRoute ? null : id,
  }))
  const [exportState, setExportState] = useState<RecordExportState>({
    error: null,
    format: null,
    isExporting: false,
  })
  const dark = theme === 'dark'

  useEffect(() => {
    if (demoRoute) {
      return undefined
    }

    let active = true

    void loadPatientRecordById(id)
      .then((record) => {
        if (!active) {
          return
        }

        setRecordLoadState({
          error: null,
          isLoading: false,
          record,
          recordId: id,
        })
      })
      .catch(() => {
        if (!active) {
          return
        }

        setRecordLoadState({
          error: labels[locale].loadRecordError,
          isLoading: false,
          record: null,
          recordId: id,
        })
      })

    return () => {
      active = false
    }
  }, [demoRoute, id, locale])

  const activeLoadedRecord = !demoRoute && recordLoadState.recordId === id ? recordLoadState.record : null
  const activeRecordLoadState =
    !demoRoute && recordLoadState.recordId === id
      ? {
          ...recordLoadState,
          record: activeLoadedRecord,
        }
      : {
          error: null,
          isLoading: !demoRoute,
          record: null,
          recordId: demoRoute ? null : id,
        }

  async function handleExport(format: ExportFormat) {
    if (!recordRef.current || demoRoute || !activeRecordLoadState.record || exportState.isExporting) {
      return
    }

    setExportState({
      error: null,
      format,
      isExporting: true,
    })

    try {
      const { exportElementAsPdf, exportElementAsPng } = await import('@/lib/export-record')

      if (format === 'pdf') {
        await exportElementAsPdf(recordRef.current)
      } else {
        await exportElementAsPng(recordRef.current)
      }

      setExportState({
        error: null,
        format: null,
        isExporting: false,
      })
    } catch (error) {
      console.error(error)
      setExportState({
        error: labels[locale].exportError,
        format: null,
        isExporting: false,
      })
    }
  }

  const content = demoRoute ? (
    <RecordDossier
      exportError={exportState.error}
      exportFormat={exportState.format}
      isExportDisabled
      isExporting={exportState.isExporting}
      locale={locale}
      onExport={(format) => void handleExport(format)}
      recordRef={recordRef}
    />
  ) : activeRecordLoadState.record ? (
    <RecordDossier
      exportError={exportState.error}
      exportFormat={exportState.format}
      isExportDisabled={false}
      isExporting={exportState.isExporting}
      locale={locale}
      onExport={(format) => void handleExport(format)}
      record={activeRecordLoadState.record}
      recordRef={recordRef}
    />
  ) : (
    <RecordUnavailableDossier
      exportError={exportState.error}
      exportFormat={exportState.format}
      isExporting={exportState.isExporting}
      locale={locale}
      message={activeRecordLoadState.isLoading ? labels[locale].loadingRecord : activeRecordLoadState.error ?? labels[locale].missingRecord}
      onExport={(format) => void handleExport(format)}
    />
  )

  return (
    <div className={dark ? 'min-h-screen bg-[var(--ff-surface-base)] text-[var(--ff-text-primary)]' : 'ff-light-record-bg min-h-screen text-[var(--ff-text-primary)]'}>
      <ClinicalTopBar theme={theme} title={locale === 'zh' ? '病历详情' : 'Record Detail'} withRail />
      <ArchiveSideNav dark={dark} isSigningOut={isSigningOut} onSignOut={onSignOut} userIsAnonymous={userIsAnonymous} userLabel={userLabel ?? id} />
      <MainShell className={`${topBarOffsetClass} ${sidebarOffsetClass} min-h-screen px-4 pb-4 md:px-6 md:pb-6`} theme={theme}>
        <div className={`${shellWideContentClass} mt-5 md:mt-6`} data-testid="record-responsive-canvas">
          {content}
        </div>
      </MainShell>
    </div>
  )
}
