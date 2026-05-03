/**
 * [INPUT]: 依赖 @/components/system/surfaces 的 PanelSurface，依赖 @/lib/copy 与 locale 文案，依赖 PatientRecord 与 PatientFieldTarget 维持 inline edit / export 边界，依赖 transitions-dev.css 的 .t-digit-group 数字动效合同。
 * [OUTPUT]: 对外提供 ReportPreviewFrame 组件，渲染 V3 工作区病历预览、缺失字段告警、临床备注与验证状态带。
 * [POS]: components/workspace 的报告预览区块，被 workspace-page 组合，是 /app 中病史输入之后的 V3 主表面，同时保留 setReportRef 导出捕获点。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from 'react'

import { PanelSurface } from '@/components/system/surfaces'
import { getCopy, copy } from '@/lib/copy'
import { useLocale, type Locale } from '@/lib/locale'
import type { PatientFieldTarget, PatientRecord } from '@/types/patient'

type ReportPreviewFrameProps = {
  followUpCount?: number
  isExtracting: boolean
  isSaving: boolean
  onCommitField: (target: PatientFieldTarget, value: string) => void
  record: PatientRecord
  remainingMissing: string[]
  setReportRef: (node: HTMLDivElement | null) => void
  theme: 'dark' | 'light'
}

type EditableCellProps = {
  critical?: boolean
  disabled: boolean
  label: string
  onCommitField: (target: PatientFieldTarget, value: string) => void
  target?: PatientFieldTarget
  value: string
}

type DisplayCellProps = {
  critical?: boolean
  label: string
  value: string
}

type TimelinePillProps = {
  label: string
  tone: 'initial' | 'line' | 'stable'
}

type AuditItemProps = {
  icon: string
  label: string
  value: string
}

const placeholderMissing = {
  en: ['Tumor Type', 'Stage', 'Regimen'],
  zh: ['肿瘤类型', '分期', '治疗方案'],
} satisfies Record<Locale, string[]>

const previewSectionTitleClass = 'font-[var(--ff-font-display)] text-base font-semibold tracking-normal text-[var(--ff-text-primary)]'

function hasRecordData(record: PatientRecord) {
  return Boolean(record.basicInfo || record.initialOnset || record.treatmentLines.length > 0)
}

function hasText(value: unknown) {
  return typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null
}

function display(value: unknown, fallback = '--') {
  if (!hasText(value)) {
    return fallback
  }

  return typeof value === 'string' ? value.trim() : String(value)
}

function displayAge(value: number | undefined, locale: Locale) {
  if (!Number.isFinite(value)) {
    return locale === 'zh' ? '56 岁' : '56 years'
  }

  return locale === 'zh' ? `${value} 岁` : `${value} years`
}

function AnimatedNumber({ value }: { value: number }) {
  const digits = String(value).split('')

  return (
    <span aria-label={String(value)} className="t-digit-group is-animating inline-flex min-w-[1ch] justify-center">
      {digits.map((digit, index) => (
        <span className="t-digit" data-stagger={index === 0 ? undefined : index === 1 ? '1' : '2'} key={`${digit}-${index}`}>
          {digit}
        </span>
      ))}
    </span>
  )
}

function firstTreatmentLine(record: PatientRecord) {
  return record.treatmentLines.find((line) => line.lineNumber === 1) ?? record.treatmentLines[0]
}

function getRegimenTarget(record: PatientRecord): PatientFieldTarget | undefined {
  const line = firstTreatmentLine(record)

  if (line) {
    return { field: 'regimen', lineNumber: line.lineNumber, section: 'treatmentLine' }
  }

  if (record.initialOnset) {
    return { field: 'treatment', section: 'initialOnset' }
  }

  return undefined
}

function getInitialGenetic(record: PatientRecord) {
  return record.initialOnset?.geneticTest ?? firstTreatmentLine(record)?.geneticTest
}

function getInitialIhc(record: PatientRecord) {
  return record.initialOnset?.immunohistochemistry ?? firstTreatmentLine(record)?.immunohistochemistry
}

function EditableCell({ critical = false, disabled, label, onCommitField, target, value }: EditableCellProps) {
  const [draft, setDraft] = useState(value === '--' ? '' : value)
  const [editing, setEditing] = useState(false)
  const isMissing = value === '--'

  if (!editing || !target) {
    return (
      <button
        className={[
          'group flex min-h-[64px] w-full items-center justify-between rounded-[var(--ff-radius-md)] border px-4 py-3 text-left transition-colors',
          critical && isMissing
            ? 'border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] text-[var(--ff-accent-primary)]'
            : 'border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] text-[var(--ff-text-primary)]',
          target && !disabled ? 'hover:border-[var(--ff-accent-primary)]' : 'cursor-default',
        ].join(' ')}
        disabled={!target || disabled}
        onClick={() => {
          setDraft(value === '--' ? '' : value)
          setEditing(true)
        }}
        type="button"
      >
        <span>
          <span className="block text-xs text-[var(--ff-text-muted)]">{label}</span>
          <span className="mt-1 block font-[var(--ff-font-ui)] text-base font-semibold tracking-normal">{value}</span>
        </span>
        {critical && isMissing ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-primary)] text-xs font-bold text-white">
            !
          </span>
        ) : target ? (
          <span className="material-symbols-outlined text-lg text-[var(--ff-text-muted)] opacity-0 transition-opacity group-hover:opacity-100">
            edit
          </span>
        ) : null}
      </button>
    )
  }

  return (
    <form
      className="rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-panel)] p-3"
      onSubmit={(event) => {
        event.preventDefault()
        onCommitField(target, draft)
        setEditing(false)
      }}
    >
      <label className="mb-2 block text-xs text-[var(--ff-text-muted)]">{label}</label>
      <div className="flex items-center gap-2">
        <input
          autoFocus
          className="min-w-0 flex-1 rounded-[var(--ff-radius-sm)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-3 py-2 text-sm text-[var(--ff-text-primary)] outline-none focus:border-[var(--ff-accent-primary)]"
          onChange={(event) => setDraft(event.target.value)}
          value={draft}
        />
        <button
          className="flex h-9 w-9 items-center justify-center rounded-[var(--ff-radius-sm)] bg-[var(--ff-accent-primary)] text-white"
          type="submit"
        >
          <span className="material-symbols-outlined text-lg">check</span>
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-[var(--ff-radius-sm)] border border-[var(--ff-border-default)] text-[var(--ff-text-secondary)]"
          onClick={() => setEditing(false)}
          type="button"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </form>
  )
}

function DisplayCell({ critical = false, label, value }: DisplayCellProps) {
  const isMissing = value === '--'

  return (
    <div
      className={[
        'min-h-[64px] rounded-[var(--ff-radius-md)] border px-4 py-3',
        critical && isMissing
          ? 'border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] text-[var(--ff-accent-primary)]'
          : 'border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] text-[var(--ff-text-primary)]',
      ].join(' ')}
    >
      <span className="block text-xs text-[var(--ff-text-muted)]">{label}</span>
      <span className="mt-1 block font-[var(--ff-font-ui)] text-base font-semibold">{value}</span>
    </div>
  )
}

function TimelinePill({ label, tone }: TimelinePillProps) {
  const toneClass =
    tone === 'stable'
      ? 'border-[color:color-mix(in_srgb,var(--ff-accent-success)_46%,var(--ff-border-default))] bg-[color:color-mix(in_srgb,var(--ff-accent-success)_10%,var(--ff-surface-panel))]'
      : tone === 'line'
        ? 'border-[color:color-mix(in_srgb,var(--ff-line)_46%,var(--ff-border-default))] bg-[color:color-mix(in_srgb,var(--ff-line)_10%,var(--ff-surface-panel))]'
        : 'border-[var(--ff-border-default)] bg-[var(--ff-surface-soft)]'

  return (
    <div className={`flex h-11 min-w-[150px] items-center justify-center rounded-[var(--ff-radius-md)] border px-4 font-semibold ${toneClass}`}>
      {label}
    </div>
  )
}

function Connector() {
  return (
    <div className="hidden w-7 shrink-0 items-center md:flex">
      <div className="h-px flex-1 border-t border-dashed border-[var(--ff-line)]" />
      <span className="mx-2 block h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-[var(--ff-line)]" />
    </div>
  )
}

function AuditItem({ icon, label, value }: AuditItemProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <span className="material-symbols-outlined text-[32px] text-[var(--ff-text-primary)]">{icon}</span>
      <div className="min-w-0">
        <span className="block font-[var(--ff-font-display)] text-lg font-bold tracking-normal">{label}</span>
        <span className="mt-1 inline-flex rounded-[var(--ff-radius-sm)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-soft)] px-4 py-2 text-sm text-[var(--ff-text-secondary)]">
          {value}
        </span>
      </div>
    </div>
  )
}

export function ReportPreviewFrame({
  followUpCount = 0,
  isExtracting,
  isSaving,
  onCommitField,
  record,
  remainingMissing,
  setReportRef,
  theme,
}: ReportPreviewFrameProps) {
  const { locale } = useLocale()
  const disabled = isExtracting || isSaving
  const recordHasData = hasRecordData(record)
  const basicInfo = record.basicInfo
  const lineOne = firstTreatmentLine(record)
  const missingLabels =
    recordHasData && remainingMissing.length > 0 ? remainingMissing : recordHasData ? [] : placeholderMissing[locale]
  const missingCount = missingLabels.length
  const notePlaceholder =
    locale === 'zh' ? '可在此记录关键临床备注或补充说明...' : 'Record key clinical notes or supplemental comments...'

  return (
    <PanelSurface className="p-4 sm:p-6" theme={theme} tone="panel">
      <div ref={setReportRef}>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px]">calendar_month</span>
            <h2 className="font-[var(--ff-font-display)] text-2xl font-black leading-tight tracking-normal">
              {getCopy(copy.timeline.tableTitle, locale)}
            </h2>
            <span className="rounded-[var(--ff-radius-full)] border border-[color:color-mix(in_srgb,var(--ff-accent-success)_36%,var(--ff-border-default))] bg-[color:color-mix(in_srgb,var(--ff-accent-success)_12%,var(--ff-surface-panel))] px-3 py-1 text-sm font-semibold text-[var(--ff-accent-success)]">
              {getCopy(copy.timeline.archetypeLabels.nonAdvanced, locale)}
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex min-h-11 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] px-4 py-2 text-sm font-semibold text-[var(--ff-accent-primary)]">
              <span className="material-symbols-outlined text-xl">warning</span>
              <span>
                {locale === 'zh' ? '必填字段 / 缺失字段：' : 'Required / Missing: '}
                {missingLabels.length > 0 ? missingLabels.join(locale === 'zh' ? ' / ' : ' / ') : locale === 'zh' ? '无' : 'None'}
              </span>
            </div>
            <div className="inline-flex min-h-11 items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] px-4 py-2 text-sm font-semibold text-[var(--ff-accent-primary)]">
              <span className="material-symbols-outlined text-xl">chat_bubble</span>
              <span>
                {locale === 'zh' ? (
                  <>
                    待补充 <AnimatedNumber value={missingCount} /> 项 · 第 <AnimatedNumber value={followUpCount} />/3 轮追问
                  </>
                ) : (
                  <>
                    <AnimatedNumber value={missingCount} /> missing · round <AnimatedNumber value={followUpCount} />/3
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <h3 className={`mb-2 ${previewSectionTitleClass}`}>{getCopy(copy.timeline.basicInfoTitle, locale)}</h3>
        <div className="grid gap-2 lg:grid-cols-[1.08fr_1fr]">
          <div className="grid gap-2 sm:grid-cols-3">
            <DisplayCell label={locale === 'zh' ? '姓名' : 'Name'} value={locale === 'zh' ? '张三' : 'Zhang San'} />
            <EditableCell
              disabled={disabled}
              label={getCopy(copy.timeline.gender, locale)}
              onCommitField={onCommitField}
              target={{ field: 'gender', section: 'basicInfo' }}
              value={display(basicInfo?.gender, locale === 'zh' ? '女' : 'Female')}
            />
            <EditableCell
              disabled={disabled}
              label={getCopy(copy.timeline.age, locale)}
              onCommitField={onCommitField}
              target={{ field: 'age', section: 'basicInfo' }}
              value={displayAge(basicInfo?.age, locale)}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <EditableCell
              critical
              disabled={disabled}
              label={getCopy(copy.timeline.tumorType, locale)}
              onCommitField={onCommitField}
              target={{ field: 'tumorType', section: 'basicInfo' }}
              value={display(basicInfo?.tumorType)}
            />
            <EditableCell
              critical
              disabled={disabled}
              label={getCopy(copy.timeline.stage, locale)}
              onCommitField={onCommitField}
              target={{ field: 'stage', section: 'basicInfo' }}
              value={display(basicInfo?.stage)}
            />
            <EditableCell
              critical
              disabled={disabled}
              label={getCopy(copy.timeline.regimen, locale)}
              onCommitField={onCommitField}
              target={getRegimenTarget(record)}
              value={display(lineOne?.regimen ?? record.initialOnset?.treatment)}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-4 lg:col-span-2">
            <EditableCell
              disabled={disabled}
              label={getCopy(copy.timeline.diagnosisDate, locale)}
              onCommitField={onCommitField}
              target={{ field: 'diagnosisDate', section: 'basicInfo' }}
              value={display(basicInfo?.diagnosisDate)}
            />
            <DisplayCell label={getCopy(copy.timeline.genetic, locale)} value={display(getInitialGenetic(record))} />
            <DisplayCell label={getCopy(copy.timeline.immunohistochemistry, locale)} value={display(getInitialIhc(record))} />
            <DisplayCell label={locale === 'zh' ? '其他信息' : 'Other Information'} value="--" />
          </div>
        </div>

        <h3 className={`mt-4 ${previewSectionTitleClass}`}>{locale === 'zh' ? '治疗时间线' : 'Treatment Timeline'}</h3>
        <div className="mt-2 max-w-full overflow-x-auto pb-2">
          <div className="flex flex-col gap-3 md:min-w-max md:flex-row md:items-center md:gap-2">
            <span className="hidden h-8 w-8 shrink-0 rounded-[var(--ff-radius-full)] border-2 border-dashed border-[var(--ff-line)] md:block" />
            <Connector />
            <TimelinePill label={locale === 'zh' ? '初发治疗（可选）' : 'Initial Treatment (Optional)'} tone="initial" />
            <Connector />
            <TimelinePill label={locale === 'zh' ? '1L 治疗线' : '1L Treatment Line'} tone="line" />
            <Connector />
            <TimelinePill label={locale === 'zh' ? '2L 治疗线' : '2L Treatment Line'} tone="line" />
            <Connector />
            <TimelinePill label={locale === 'zh' ? '3L 治疗线' : '3L Treatment Line'} tone="stable" />
            <Connector />
            <span className="hidden h-8 w-8 shrink-0 rounded-[var(--ff-radius-full)] border-2 border-dashed border-[var(--ff-line)] md:block" />
          </div>
        </div>

        <h3 className={`mt-4 ${previewSectionTitleClass}`}>{getCopy(copy.workspace.report.clinicalNotes, locale)}</h3>
        <div className="mt-2 flex gap-3">
          <div className="flex min-h-12 flex-1 items-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-4 text-sm text-[var(--ff-text-muted)]">
            {notePlaceholder}
          </div>
          <button
            className="flex h-12 w-14 shrink-0 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] text-[var(--ff-text-primary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)]"
            type="button"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-4 md:flex-row md:items-center">
          <AuditItem
            icon="health_and_safety"
            label={locale === 'zh' ? 'AI 验证状态' : 'AI Verification Status'}
            value={locale === 'zh' ? '未开始验证' : getCopy(copy.workspace.report.verifiedBy, locale)}
          />
          <div className="hidden h-14 w-px bg-[var(--ff-border-default)] md:block" />
          <AuditItem
            icon="database"
            label={locale === 'zh' ? '数据完整性' : 'Data Completeness'}
            value={remainingMissing.length > 0 || !recordHasData ? '--' : getCopy(copy.workspace.report.completed, locale)}
          />
        </div>
      </div>
    </PanelSurface>
  )
}
