/**
 * [INPUT]: 依赖 @/types/patient 的 PatientRecord 与 getPatientArchetype。
 * [OUTPUT]: 对外提供 TimelineTable、BasicInfoBlock、InitialOnsetBlock 与 TreatmentLineBlock。
 * [POS]: components/timeline 的正式时间线表格渲染器，负责三种 archetype 的区块布局与关键缺失字段高亮。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
  getPatientArchetype,
  type BasicInfo,
  type InitialOnset,
  type PatientArchetype,
  type PatientRecord,
  type TreatmentLine,
} from '@/types/patient'

type Theme = 'dark' | 'light'

type TimelineTableProps = {
  record: PatientRecord
  theme: Theme
}

type BasicInfoBlockProps = {
  basicInfo?: BasicInfo
  theme: Theme
}

type InitialOnsetBlockProps = {
  initialOnset: InitialOnset
  order: number
  theme: Theme
}

type TreatmentLineBlockProps = {
  line: TreatmentLine
  order: number
  theme: Theme
}

type SectionHeaderProps = {
  badge?: string
  order: number
  subtitle: string
  title: string
  theme: Theme
}

type CellProps = {
  critical?: boolean
  label: string
  theme: Theme
  value?: string
}

const ARCHETYPE_LABELS: Record<PatientArchetype, string> = {
  'de-novo-advanced': 'DE_NOVO_ADVANCED',
  'non-advanced': 'NON_ADVANCED',
  'relapsed-advanced': 'RELAPSED_ADVANCED',
}

function hasValue(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value)
  }

  return typeof value === 'string' && value.trim().length > 0
}

function display(value: unknown) {
  if (!hasValue(value)) {
    return undefined
  }

  return typeof value === 'string' ? value.trim() : String(value)
}

function formatMetric(value: number | undefined, unit: string) {
  return value === undefined ? undefined : `${value} ${unit}`
}

function formatPeriod(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) {
    return undefined
  }

  if (!startDate) {
    return endDate
  }

  if (!endDate) {
    return `${startDate} — 至今`
  }

  return `${startDate} — ${endDate}`
}

function getShellClass(theme: Theme) {
  return theme === 'dark'
    ? 'border border-[#262626] bg-[#0A0A0A] text-[#FAFAFA]'
    : 'ff-light-ink-shadow border-2 border-[#111111] bg-white text-[#111111]'
}

function getSectionClass(theme: Theme) {
  return theme === 'dark'
    ? 'border border-[#262626] bg-[#131313] p-6 sm:p-8'
    : 'border-2 border-[#111111] bg-white p-6 sm:p-8'
}

function getLabelClass(theme: Theme) {
  return theme === 'dark'
    ? "font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.24em] text-[#666666]"
    : "font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.24em] text-[#5d5f5b]"
}

function getValueClass(theme: Theme, filled: boolean, prominent: boolean) {
  if (theme === 'dark') {
    return prominent
      ? `font-['Inter_Tight'] text-2xl font-black tracking-tight ${filled ? 'text-[#FAFAFA]' : 'text-[#FAFAFA]/70'}`
      : `whitespace-pre-wrap text-sm leading-7 ${filled ? 'text-[#FAFAFA]/88' : 'text-[#FAFAFA]/70'}`
  }

  return prominent
    ? `font-['Newsreader'] text-[28px] font-bold tracking-tight ${filled ? 'text-[#111111]' : 'text-[#111111]/70'}`
    : `whitespace-pre-wrap text-sm leading-7 ${filled ? 'text-[#111111]/82' : 'text-[#111111]/70'}`
}

function getCellClass(theme: Theme, critical: boolean, filled: boolean) {
  if (theme === 'dark') {
    if (critical && !filled) {
      return 'border border-dashed border-[#FF3D00] bg-[#1A1A1A]'
    }

    return 'border border-[#262626] bg-[#0F0F0F]'
  }

  if (critical && !filled) {
    return 'border-2 border-dashed border-[#ba1a1a] bg-[#fff1ec]'
  }

  return 'border-2 border-[#111111] bg-[#F9F9F7]'
}

function padOrder(order: number) {
  return String(order).padStart(2, '0')
}

function SectionHeader({ badge, order, subtitle, title, theme }: SectionHeaderProps) {
  if (theme === 'dark') {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-['JetBrains_Mono'] text-4xl font-black text-[#FF3D00]">{padOrder(order)}</span>
          <div>
            <h3 className="font-['Inter_Tight'] text-3xl font-black tracking-tight text-[#FAFAFA] sm:text-4xl">
              {title}
            </h3>
            <p className="mt-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.28em] text-[#666666]">
              {subtitle}
            </p>
          </div>
        </div>
        <span className="min-w-[160px] self-start border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-right font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[#FAFAFA]/70 sm:self-auto">
          {badge ?? '\u00A0'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-baseline gap-4">
        <span className="font-['Playfair_Display'] text-5xl font-black text-[#111111]/12 sm:text-6xl">
          {padOrder(order)}
        </span>
        <div>
          <h3 className="border-b-2 border-[#111111] pb-2 font-['Newsreader'] text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h3>
          <p className="mt-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.28em] text-[#5d5f5b]">
            {subtitle}
          </p>
        </div>
      </div>
      <span className="min-w-[160px] self-start bg-[#111111] px-3 py-2 text-right font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-white sm:self-auto">
        {badge ?? '\u00A0'}
      </span>
    </div>
  )
}

function DataCell({ critical = false, label, theme, value }: CellProps) {
  const rendered = display(value)
  const filled = rendered !== undefined
  const prominent = !label.includes('免疫组化') && !label.includes('基因检测') && !label.includes('活检')

  return (
    <div className={`${getCellClass(theme, critical, filled)} flex min-h-[108px] flex-col justify-between gap-4 p-4`}>
      <span className={getLabelClass(theme)}>{label}</span>
      <span className={getValueClass(theme, filled, prominent)}>{rendered ?? '\u00A0'}</span>
    </div>
  )
}

function NarrativeCell({ critical = false, label, theme, value }: CellProps) {
  const rendered = display(value)
  const filled = rendered !== undefined

  return (
    <div className={`${getCellClass(theme, critical, filled)} flex min-h-[176px] flex-col gap-4 p-5`}>
      <span className={getLabelClass(theme)}>{label}</span>
      <div className={getValueClass(theme, filled, false)}>{rendered ?? '\u00A0'}</div>
    </div>
  )
}

export function BasicInfoBlock({ basicInfo, theme }: BasicInfoBlockProps) {
  const fields = [
    { label: 'Gender / 性别', value: display(basicInfo?.gender) },
    { label: 'Age / 年龄', value: formatMetric(basicInfo?.age, '岁') },
    { label: 'Height / 身高', value: formatMetric(basicInfo?.height, 'cm') },
    { label: 'Weight / 体重', value: formatMetric(basicInfo?.weight, 'kg') },
    { critical: true, label: 'Tumor Type / 肿瘤类型', value: display(basicInfo?.tumorType) },
    { label: 'Diagnosis Date / 诊断日期', value: display(basicInfo?.diagnosisDate) },
    { critical: true, label: 'Stage / 分期', value: display(basicInfo?.stage) },
  ]

  return (
    <section className={getSectionClass(theme)}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            className={
              theme === 'dark'
                ? "font-['Inter_Tight'] text-3xl font-black tracking-tight text-[#FAFAFA]"
                : "font-['Newsreader'] text-4xl font-bold tracking-tight text-[#111111]"
            }
          >
            基本信息
          </h2>
          <p className={`mt-2 ${getLabelClass(theme)}`}>BASIC_INFO / TOP_BLOCK</p>
        </div>
        <span
          className={
            theme === 'dark'
              ? "font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[#FF3D00]"
              : "font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[#ba1a1a]"
          }
        >
          CRITICAL_FIELDS: TUMOR_TYPE / STAGE / REGIMEN
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {fields.map((field) => (
          <DataCell critical={field.critical} key={field.label} label={field.label} theme={theme} value={field.value} />
        ))}
      </div>
    </section>
  )
}

export function InitialOnsetBlock({ initialOnset, order, theme }: InitialOnsetBlockProps) {
  return (
    <article className="space-y-6">
      <SectionHeader
        badge={display(initialOnset.triggerDate)}
        order={order}
        subtitle="INITIAL_ONSET"
        title="初发区块"
        theme={theme}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <NarrativeCell critical label="治疗方案 / REGIMEN" theme={theme} value={initialOnset.treatment} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <NarrativeCell label="免疫组化 / IHC" theme={theme} value={initialOnset.immunohistochemistry} />
          <NarrativeCell label="基因检测 / GENETIC" theme={theme} value={initialOnset.geneticTest} />
        </div>
      </div>
    </article>
  )
}

export function TreatmentLineBlock({ line, order, theme }: TreatmentLineBlockProps) {
  return (
    <article className="space-y-6">
      <SectionHeader
        badge={formatPeriod(line.startDate, line.endDate)}
        order={order}
        subtitle={`LINE_${padOrder(line.lineNumber)}`}
        title={`治疗线 ${line.lineNumber}`}
        theme={theme}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="grid gap-4">
          <NarrativeCell critical label="治疗方案 / REGIMEN" theme={theme} value={line.regimen} />
          <div className="grid gap-4 sm:grid-cols-2">
            <DataCell label="Start Date / 开始时间" theme={theme} value={display(line.startDate)} />
            <DataCell label="End Date / 结束时间" theme={theme} value={display(line.endDate)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <NarrativeCell label="活检 / BIOPSY" theme={theme} value={line.biopsy} />
          <NarrativeCell label="免疫组化 / IHC" theme={theme} value={line.immunohistochemistry} />
          <NarrativeCell label="基因检测 / GENETIC" theme={theme} value={line.geneticTest} />
        </div>
      </div>
    </article>
  )
}

function EmptyState({ theme }: { theme: Theme }) {
  return (
    <div className={`${getSectionClass(theme)} ${theme === 'dark' ? 'text-[#FAFAFA]/70' : 'text-[#111111]/70'}`}>
      <div className={getLabelClass(theme)}>TIMELINE_STATE</div>
      <p
        className={
          theme === 'dark'
            ? "mt-4 font-['Inter_Tight'] text-2xl font-bold"
            : "mt-4 font-['Newsreader'] text-3xl font-bold"
        }
      >
        尚未生成初发区块或治疗线。
      </p>
      <p className="mt-3 text-sm leading-7">提交患者描述后，这里会按 archetype 自动切换布局，并对关键缺失字段做高亮提示。</p>
    </div>
  )
}

export function TimelineTable({ record, theme }: TimelineTableProps) {
  const archetype = getPatientArchetype(record)
  const sections: Array<
    | { kind: 'initial-onset'; value: InitialOnset }
    | { kind: 'treatment-line'; value: TreatmentLine }
  > = []

  if (archetype !== 'de-novo-advanced' && record.initialOnset) {
    sections.push({ kind: 'initial-onset', value: record.initialOnset })
  }

  for (const line of [...record.treatmentLines].sort((left, right) => left.lineNumber - right.lineNumber)) {
    sections.push({ kind: 'treatment-line', value: line })
  }

  return (
    <section className={getShellClass(theme)}>
      <header
        className={
          theme === 'dark'
            ? 'border-b border-[#262626] px-6 py-6 sm:px-8'
            : 'border-b-2 border-[#111111] px-6 py-6 sm:px-8'
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={getLabelClass(theme)}>TIMELINE_TABLE</div>
            <h1
              className={
                theme === 'dark'
                  ? "mt-3 font-['Inter_Tight'] text-4xl font-black tracking-tight text-[#FAFAFA] sm:text-5xl"
                  : "mt-3 font-['Playfair_Display'] text-5xl font-black tracking-tighter text-[#111111] sm:text-6xl"
              }
            >
              治疗时间线表格
            </h1>
          </div>
          <div
            className={
              theme === 'dark'
                ? 'border border-[#262626] bg-[#131313] px-4 py-3 text-right'
                : 'border-2 border-[#111111] bg-[#F9F9F7] px-4 py-3 text-right'
            }
          >
            <div className={getLabelClass(theme)}>ARCHETYPE</div>
            <div
              className={
                theme === 'dark'
                  ? "mt-2 font-['JetBrains_Mono'] text-[12px] font-bold tracking-[0.18em] text-[#FF3D00]"
                  : "mt-2 font-['JetBrains_Mono'] text-[12px] font-bold tracking-[0.18em] text-[#ba1a1a]"
              }
            >
              {ARCHETYPE_LABELS[archetype]}
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
        <BasicInfoBlock basicInfo={record.basicInfo} theme={theme} />

        {sections.length === 0 ? <EmptyState theme={theme} /> : null}

        {sections.map((section, index) =>
          section.kind === 'initial-onset' ? (
            <InitialOnsetBlock
              initialOnset={section.value}
              key={`initial-onset-${section.value.triggerDate ?? index}`}
              order={index + 1}
              theme={theme}
            />
          ) : (
            <TreatmentLineBlock
              key={`treatment-line-${section.value.lineNumber}`}
              line={section.value}
              order={index + 1}
              theme={theme}
            />
          ),
        )}
      </div>
    </section>
  )
}
