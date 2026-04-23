/**
 * [INPUT]: 依赖 react 的 useState，依赖 @/lib/theme 的 Theme，依赖 @/types/patient 的 PatientRecord、PatientFieldTarget、各区块类型与 getPatientArchetype。
 * [OUTPUT]: 对外提供 TimelineTable、BasicInfoBlock、InitialOnsetBlock 与 TreatmentLineBlock。
 * [POS]: components/timeline 的正式时间线表格渲染器，负责三种 archetype 的区块布局、关键缺失字段高亮与行内编辑入口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from 'react'

import type { Theme } from '@/lib/theme'
import {
  getPatientArchetype,
  type BasicInfo,
  type InitialOnset,
  type PatientArchetype,
  type PatientFieldTarget,
  type PatientRecord,
  type TreatmentLine,
} from '@/types/patient'

type EditorState = {
  id: string
  value: string
}

type TimelineTableProps = {
  disabled?: boolean
  onCommitField?: (target: PatientFieldTarget, value: string) => Promise<void> | void
  record: PatientRecord
  theme: Theme
}

type SharedBlockProps = {
  disabled: boolean
  editor: EditorState | null
  onBeginEdit: (cellId: string, value: string) => void
  onCancelEdit: () => void
  onCommitField?: (target: PatientFieldTarget, value: string) => Promise<void> | void
  onUpdateEditorValue: (value: string) => void
  theme: Theme
}

type BasicInfoBlockProps = SharedBlockProps & {
  basicInfo?: BasicInfo
}

type InitialOnsetBlockProps = SharedBlockProps & {
  initialOnset: InitialOnset
  order: number
}

type TreatmentLineBlockProps = SharedBlockProps & {
  line: TreatmentLine
  order: number
}

type SectionHeaderProps = {
  badge?: string
  order: number
  subtitle: string
  title: string
  theme: Theme
}

type CellProps = {
  cellId: string
  critical?: boolean
  disabled: boolean
  editValue: string
  editor: EditorState | null
  label: string
  onBeginEdit: (cellId: string, value: string) => void
  onCancelEdit: () => void
  onCommitField?: (target: PatientFieldTarget, value: string) => Promise<void> | void
  onUpdateEditorValue: (value: string) => void
  target: PatientFieldTarget
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
    ? 'border border-[var(--ff-timeline-shell-border)] bg-[var(--ff-timeline-shell-bg)] text-[var(--ff-timeline-shell-text)]'
    : 'ff-light-ink-shadow border-2 border-[var(--ff-timeline-shell-border)] bg-[var(--ff-timeline-shell-bg)] text-[var(--ff-timeline-shell-text)]'
}

function getSectionClass(theme: Theme) {
  return theme === 'dark'
    ? 'border border-[var(--ff-timeline-section-border)] bg-[var(--ff-timeline-section-bg)] p-6 sm:p-8'
    : 'border-2 border-[var(--ff-timeline-section-border)] bg-[var(--ff-timeline-section-bg)] p-6 sm:p-8'
}

function getLabelClass() {
  return "font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.24em] text-[var(--ff-timeline-label)]"
}

function getValueClass(theme: Theme, filled: boolean, prominent: boolean) {
  if (theme === 'dark') {
    return prominent
      ? `font-['Inter_Tight'] text-2xl font-black tracking-tight ${filled ? 'text-[var(--ff-timeline-text-strong)]' : 'text-[var(--ff-timeline-text-muted)]'}`
      : `whitespace-pre-wrap text-sm leading-7 ${filled ? 'text-[var(--ff-timeline-text-body)]' : 'text-[var(--ff-timeline-text-muted)]'}`
  }

  return prominent
    ? `font-['Newsreader'] text-[28px] font-bold tracking-tight ${filled ? 'text-[var(--ff-timeline-text-strong)]' : 'text-[var(--ff-timeline-text-muted)]'}`
    : `whitespace-pre-wrap text-sm leading-7 ${filled ? 'text-[var(--ff-timeline-text-body)]' : 'text-[var(--ff-timeline-text-muted)]'}`
}

function getCellClass(theme: Theme, critical: boolean, filled: boolean) {
  if (critical && !filled) {
    return theme === 'dark'
      ? 'border border-dashed border-[var(--ff-timeline-cell-critical-border)] bg-[var(--ff-timeline-cell-critical-bg)]'
      : 'border-2 border-dashed border-[var(--ff-timeline-cell-critical-border)] bg-[var(--ff-timeline-cell-critical-bg)]'
  }

  return theme === 'dark'
    ? 'border border-[var(--ff-timeline-cell-border)] bg-[var(--ff-timeline-cell-bg)]'
    : 'border-2 border-[var(--ff-timeline-cell-border)] bg-[var(--ff-timeline-cell-bg)]'
}

function padOrder(order: number) {
  return String(order).padStart(2, '0')
}

function getEditValue(value: unknown) {
  return value === undefined || value === null ? '' : String(value)
}

function SectionHeader({ badge, order, subtitle, title, theme }: SectionHeaderProps) {
  if (theme === 'dark') {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-['JetBrains_Mono'] text-4xl font-black text-[var(--ff-timeline-order)]">{padOrder(order)}</span>
          <div>
            <h3 className="font-['Inter_Tight'] text-3xl font-black tracking-tight text-[var(--ff-timeline-text-strong)] sm:text-4xl">
              {title}
            </h3>
            <p className="mt-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.28em] text-[var(--ff-timeline-label)]">
              {subtitle}
            </p>
          </div>
        </div>
        <span className="min-w-[160px] self-start border border-[var(--ff-timeline-badge-border)] bg-[var(--ff-timeline-badge-bg)] px-3 py-2 text-right font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[var(--ff-timeline-badge-text)] sm:self-auto">
          {badge ?? '\u00A0'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-baseline gap-4">
        <span className="font-['Playfair_Display'] text-5xl font-black text-[var(--ff-timeline-order)] sm:text-6xl">
          {padOrder(order)}
        </span>
        <div>
          <h3 className="border-b-2 border-[var(--ff-timeline-section-border)] pb-2 font-['Newsreader'] text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h3>
          <p className="mt-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.28em] text-[var(--ff-timeline-label)]">
            {subtitle}
          </p>
        </div>
      </div>
      <span className="min-w-[160px] self-start bg-[var(--ff-timeline-badge-bg)] px-3 py-2 text-right font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[var(--ff-timeline-badge-text)] sm:self-auto">
        {badge ?? '\u00A0'}
      </span>
    </div>
  )
}

function DataCell({
  cellId,
  critical = false,
  disabled,
  editValue,
  editor,
  label,
  onBeginEdit,
  onCancelEdit,
  onCommitField,
  onUpdateEditorValue,
  target,
  theme,
  value,
}: CellProps) {
  const rendered = display(value)
  const filled = rendered !== undefined
  const prominent = !label.includes('免疫组化') && !label.includes('基因检测') && !label.includes('活检')
  const isEditing = editor?.id === cellId
  const isInteractive = onCommitField !== undefined && !disabled

  return (
    <div
      className={`${getCellClass(theme, critical, filled)} flex min-h-[108px] flex-col justify-between gap-4 p-4 ${
        isInteractive ? 'cursor-text transition-colors hover:border-[var(--ff-timeline-hover-border)] hover:bg-inherit' : ''
      }`}
      onClick={() => {
        if (!isInteractive || isEditing) {
          return
        }

        onBeginEdit(cellId, editValue)
      }}
      onKeyDown={(event) => {
        if (!isInteractive || isEditing) {
          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onBeginEdit(cellId, editValue)
        }
      }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <span className={getLabelClass()}>{label}</span>
      {isEditing ? (
        <input
          autoFocus
          className={`${getValueClass(theme, true, prominent)} min-h-[32px] w-full bg-transparent outline-none placeholder:opacity-40`}
          onBlur={(event) => {
            void onCommitField?.(target, event.currentTarget.value)
          }}
          onChange={(event) => onUpdateEditorValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              onCancelEdit()
              return
            }

            if (event.key === 'Enter') {
              event.preventDefault()
              event.currentTarget.blur()
            }
          }}
          value={editor?.value ?? ''}
        />
      ) : (
        <span className={getValueClass(theme, filled, prominent)}>{rendered ?? '\u00A0'}</span>
      )}
    </div>
  )
}

function NarrativeCell({
  cellId,
  critical = false,
  disabled,
  editValue,
  editor,
  label,
  onBeginEdit,
  onCancelEdit,
  onCommitField,
  onUpdateEditorValue,
  target,
  theme,
  value,
}: CellProps) {
  const rendered = display(value)
  const filled = rendered !== undefined
  const isEditing = editor?.id === cellId
  const isInteractive = onCommitField !== undefined && !disabled

  return (
    <div
      className={`${getCellClass(theme, critical, filled)} flex min-h-[176px] flex-col gap-4 p-5 ${
        isInteractive ? 'cursor-text transition-colors hover:border-[var(--ff-timeline-hover-border)] hover:bg-inherit' : ''
      }`}
      onClick={() => {
        if (!isInteractive || isEditing) {
          return
        }

        onBeginEdit(cellId, editValue)
      }}
      onKeyDown={(event) => {
        if (!isInteractive || isEditing) {
          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onBeginEdit(cellId, editValue)
        }
      }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <span className={getLabelClass()}>{label}</span>
      {isEditing ? (
        <textarea
          autoFocus
          className={`${getValueClass(theme, true, false)} min-h-[104px] w-full flex-1 resize-none bg-transparent outline-none placeholder:opacity-40`}
          onBlur={(event) => {
            void onCommitField?.(target, event.currentTarget.value)
          }}
          onChange={(event) => onUpdateEditorValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              onCancelEdit()
            }
          }}
          value={editor?.value ?? ''}
        />
      ) : (
        <div className={getValueClass(theme, filled, false)}>{rendered ?? '\u00A0'}</div>
      )}
    </div>
  )
}

export function BasicInfoBlock({
  basicInfo,
  disabled,
  editor,
  onBeginEdit,
  onCancelEdit,
  onCommitField,
  onUpdateEditorValue,
  theme,
}: BasicInfoBlockProps) {
  const fields = [
    {
      cellId: 'basicInfo.gender',
      editValue: getEditValue(basicInfo?.gender),
      label: 'Gender / 性别',
      target: { field: 'gender', section: 'basicInfo' } as const,
      value: display(basicInfo?.gender),
    },
    {
      cellId: 'basicInfo.age',
      editValue: getEditValue(basicInfo?.age),
      label: 'Age / 年龄',
      target: { field: 'age', section: 'basicInfo' } as const,
      value: formatMetric(basicInfo?.age, '岁'),
    },
    {
      cellId: 'basicInfo.height',
      editValue: getEditValue(basicInfo?.height),
      label: 'Height / 身高',
      target: { field: 'height', section: 'basicInfo' } as const,
      value: formatMetric(basicInfo?.height, 'cm'),
    },
    {
      cellId: 'basicInfo.weight',
      editValue: getEditValue(basicInfo?.weight),
      label: 'Weight / 体重',
      target: { field: 'weight', section: 'basicInfo' } as const,
      value: formatMetric(basicInfo?.weight, 'kg'),
    },
    {
      cellId: 'basicInfo.tumorType',
      critical: true,
      editValue: getEditValue(basicInfo?.tumorType),
      label: 'Tumor Type / 肿瘤类型',
      target: { field: 'tumorType', section: 'basicInfo' } as const,
      value: display(basicInfo?.tumorType),
    },
    {
      cellId: 'basicInfo.diagnosisDate',
      editValue: getEditValue(basicInfo?.diagnosisDate),
      label: 'Diagnosis Date / 诊断日期',
      target: { field: 'diagnosisDate', section: 'basicInfo' } as const,
      value: display(basicInfo?.diagnosisDate),
    },
    {
      cellId: 'basicInfo.stage',
      critical: true,
      editValue: getEditValue(basicInfo?.stage),
      label: 'Stage / 分期',
      target: { field: 'stage', section: 'basicInfo' } as const,
      value: display(basicInfo?.stage),
    },
  ]

  return (
    <section className={getSectionClass(theme)}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            className={
              theme === 'dark'
                ? "font-['Inter_Tight'] text-3xl font-black tracking-tight text-[var(--ff-timeline-text-strong)]"
                : "font-['Newsreader'] text-4xl font-bold tracking-tight text-[var(--ff-timeline-text-strong)]"
            }
          >
            基本信息
          </h2>
          <p className={`mt-2 ${getLabelClass()}`}>BASIC_INFO / TOP_BLOCK</p>
        </div>
        <span
          className={
            "font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[var(--ff-timeline-accent)]"
          }
        >
          CRITICAL_FIELDS: TUMOR_TYPE / STAGE / REGIMEN
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {fields.map((field) => (
          <DataCell
            cellId={field.cellId}
            critical={field.critical}
            disabled={disabled}
            editValue={field.editValue}
            editor={editor}
            key={field.label}
            label={field.label}
            onBeginEdit={onBeginEdit}
            onCancelEdit={onCancelEdit}
            onCommitField={onCommitField}
            onUpdateEditorValue={onUpdateEditorValue}
            target={field.target}
            theme={theme}
            value={field.value}
          />
        ))}
      </div>
    </section>
  )
}

export function InitialOnsetBlock({
  disabled,
  editor,
  initialOnset,
  onBeginEdit,
  onCancelEdit,
  onCommitField,
  onUpdateEditorValue,
  order,
  theme,
}: InitialOnsetBlockProps) {
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
        <NarrativeCell
          cellId="initialOnset.treatment"
          critical
          disabled={disabled}
          editValue={getEditValue(initialOnset.treatment)}
          editor={editor}
          label="治疗方案 / REGIMEN"
          onBeginEdit={onBeginEdit}
          onCancelEdit={onCancelEdit}
          onCommitField={onCommitField}
          onUpdateEditorValue={onUpdateEditorValue}
          target={{ field: 'treatment', section: 'initialOnset' }}
          theme={theme}
          value={initialOnset.treatment}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <DataCell
            cellId="initialOnset.triggerDate"
            disabled={disabled}
            editValue={getEditValue(initialOnset.triggerDate)}
            editor={editor}
            label="Trigger Date / 初发时间"
            onBeginEdit={onBeginEdit}
            onCancelEdit={onCancelEdit}
            onCommitField={onCommitField}
            onUpdateEditorValue={onUpdateEditorValue}
            target={{ field: 'triggerDate', section: 'initialOnset' }}
            theme={theme}
            value={display(initialOnset.triggerDate)}
          />
          <NarrativeCell
            cellId="initialOnset.immunohistochemistry"
            disabled={disabled}
            editValue={getEditValue(initialOnset.immunohistochemistry)}
            editor={editor}
            label="免疫组化 / IHC"
            onBeginEdit={onBeginEdit}
            onCancelEdit={onCancelEdit}
            onCommitField={onCommitField}
            onUpdateEditorValue={onUpdateEditorValue}
            target={{ field: 'immunohistochemistry', section: 'initialOnset' }}
            theme={theme}
            value={initialOnset.immunohistochemistry}
          />
          <NarrativeCell
            cellId="initialOnset.geneticTest"
            disabled={disabled}
            editValue={getEditValue(initialOnset.geneticTest)}
            editor={editor}
            label="基因检测 / GENETIC"
            onBeginEdit={onBeginEdit}
            onCancelEdit={onCancelEdit}
            onCommitField={onCommitField}
            onUpdateEditorValue={onUpdateEditorValue}
            target={{ field: 'geneticTest', section: 'initialOnset' }}
            theme={theme}
            value={initialOnset.geneticTest}
          />
        </div>
      </div>
    </article>
  )
}

export function TreatmentLineBlock({
  disabled,
  editor,
  line,
  onBeginEdit,
  onCancelEdit,
  onCommitField,
  onUpdateEditorValue,
  order,
  theme,
}: TreatmentLineBlockProps) {
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
          <NarrativeCell
            cellId={`treatmentLine.${line.lineNumber}.regimen`}
            critical
            disabled={disabled}
            editValue={getEditValue(line.regimen)}
            editor={editor}
            label="治疗方案 / REGIMEN"
            onBeginEdit={onBeginEdit}
            onCancelEdit={onCancelEdit}
            onCommitField={onCommitField}
            onUpdateEditorValue={onUpdateEditorValue}
            target={{ field: 'regimen', lineNumber: line.lineNumber, section: 'treatmentLine' }}
            theme={theme}
            value={line.regimen}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <DataCell
              cellId={`treatmentLine.${line.lineNumber}.startDate`}
              disabled={disabled}
              editValue={getEditValue(line.startDate)}
              editor={editor}
              label="Start Date / 开始时间"
              onBeginEdit={onBeginEdit}
              onCancelEdit={onCancelEdit}
              onCommitField={onCommitField}
              onUpdateEditorValue={onUpdateEditorValue}
              target={{ field: 'startDate', lineNumber: line.lineNumber, section: 'treatmentLine' }}
              theme={theme}
              value={display(line.startDate)}
            />
            <DataCell
              cellId={`treatmentLine.${line.lineNumber}.endDate`}
              disabled={disabled}
              editValue={getEditValue(line.endDate)}
              editor={editor}
              label="End Date / 结束时间"
              onBeginEdit={onBeginEdit}
              onCancelEdit={onCancelEdit}
              onCommitField={onCommitField}
              onUpdateEditorValue={onUpdateEditorValue}
              target={{ field: 'endDate', lineNumber: line.lineNumber, section: 'treatmentLine' }}
              theme={theme}
              value={display(line.endDate)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <NarrativeCell
            cellId={`treatmentLine.${line.lineNumber}.biopsy`}
            disabled={disabled}
            editValue={getEditValue(line.biopsy)}
            editor={editor}
            label="活检 / BIOPSY"
            onBeginEdit={onBeginEdit}
            onCancelEdit={onCancelEdit}
            onCommitField={onCommitField}
            onUpdateEditorValue={onUpdateEditorValue}
            target={{ field: 'biopsy', lineNumber: line.lineNumber, section: 'treatmentLine' }}
            theme={theme}
            value={line.biopsy}
          />
          <NarrativeCell
            cellId={`treatmentLine.${line.lineNumber}.immunohistochemistry`}
            disabled={disabled}
            editValue={getEditValue(line.immunohistochemistry)}
            editor={editor}
            label="免疫组化 / IHC"
            onBeginEdit={onBeginEdit}
            onCancelEdit={onCancelEdit}
            onCommitField={onCommitField}
            onUpdateEditorValue={onUpdateEditorValue}
            target={{ field: 'immunohistochemistry', lineNumber: line.lineNumber, section: 'treatmentLine' }}
            theme={theme}
            value={line.immunohistochemistry}
          />
          <NarrativeCell
            cellId={`treatmentLine.${line.lineNumber}.geneticTest`}
            disabled={disabled}
            editValue={getEditValue(line.geneticTest)}
            editor={editor}
            label="基因检测 / GENETIC"
            onBeginEdit={onBeginEdit}
            onCancelEdit={onCancelEdit}
            onCommitField={onCommitField}
            onUpdateEditorValue={onUpdateEditorValue}
            target={{ field: 'geneticTest', lineNumber: line.lineNumber, section: 'treatmentLine' }}
            theme={theme}
            value={line.geneticTest}
          />
        </div>
      </div>
    </article>
  )
}

function EmptyState({ theme }: { theme: Theme }) {
  return (
    <div className={`${getSectionClass(theme)} text-[var(--ff-timeline-text-muted)]`}>
      <div className={getLabelClass()}>TIMELINE_STATE</div>
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

export function TimelineTable({ disabled = false, onCommitField, record, theme }: TimelineTableProps) {
  const archetype = getPatientArchetype(record)
  const [editor, setEditor] = useState<EditorState | null>(null)
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

  function beginEdit(cellId: string, value: string) {
    if (!onCommitField || disabled) {
      return
    }

    setEditor({ id: cellId, value })
  }

  function cancelEdit() {
    setEditor(null)
  }

  function updateEditorValue(value: string) {
    setEditor((current) => (current ? { ...current, value } : current))
  }

  async function commitField(target: PatientFieldTarget, value: string) {
    if (!onCommitField) {
      return
    }

    setEditor(null)
    await onCommitField(target, value)
  }

  return (
    <section className={getShellClass(theme)}>
      <header
        className={
          theme === 'dark'
            ? 'border-b border-[var(--ff-timeline-shell-border)] px-6 py-6 sm:px-8'
            : 'border-b-2 border-[var(--ff-timeline-shell-border)] px-6 py-6 sm:px-8'
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={getLabelClass()}>TIMELINE_TABLE</div>
            <h1
              className={
                theme === 'dark'
                  ? "mt-3 font-['Inter_Tight'] text-4xl font-black tracking-tight text-[var(--ff-timeline-text-strong)] sm:text-5xl"
                  : "mt-3 font-['Playfair_Display'] text-5xl font-black tracking-tighter text-[var(--ff-timeline-text-strong)] sm:text-6xl"
              }
            >
              治疗时间线表格
            </h1>
          </div>
          <div
            className={
              theme === 'dark'
                ? 'border border-[var(--ff-timeline-section-border)] bg-[var(--ff-timeline-header-panel-bg)] px-4 py-3 text-right'
                : 'border-2 border-[var(--ff-timeline-section-border)] bg-[var(--ff-timeline-header-panel-bg)] px-4 py-3 text-right'
            }
          >
            <div className={getLabelClass()}>ARCHETYPE</div>
            <div
              className={
                "mt-2 font-['JetBrains_Mono'] text-[12px] font-bold tracking-[0.18em] text-[var(--ff-timeline-accent)]"
              }
            >
              {ARCHETYPE_LABELS[archetype]}
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
        <BasicInfoBlock
          basicInfo={record.basicInfo}
          disabled={disabled}
          editor={editor}
          onBeginEdit={beginEdit}
          onCancelEdit={cancelEdit}
          onCommitField={commitField}
          onUpdateEditorValue={updateEditorValue}
          theme={theme}
        />

        {sections.length === 0 ? <EmptyState theme={theme} /> : null}

        {sections.map((section, index) =>
          section.kind === 'initial-onset' ? (
            <InitialOnsetBlock
              disabled={disabled}
              editor={editor}
              initialOnset={section.value}
              key={`initial-onset-${section.value.triggerDate ?? index}`}
              onBeginEdit={beginEdit}
              onCancelEdit={cancelEdit}
              onCommitField={commitField}
              onUpdateEditorValue={updateEditorValue}
              order={index + 1}
              theme={theme}
            />
          ) : (
            <TreatmentLineBlock
              disabled={disabled}
              editor={editor}
              key={`treatment-line-${section.value.lineNumber}`}
              line={section.value}
              onBeginEdit={beginEdit}
              onCancelEdit={cancelEdit}
              onCommitField={commitField}
              onUpdateEditorValue={updateEditorValue}
              order={index + 1}
              theme={theme}
            />
          ),
        )}
      </div>
    </section>
  )
}
