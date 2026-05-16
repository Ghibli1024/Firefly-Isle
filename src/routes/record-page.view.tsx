/**
 * [INPUT]: 依赖 react 的 RefObject，依赖 @/components/record 的 dossier/AI 分析/分享展示、demo-record 的默认病例、record-copy 的 labels、@/components/timeline 的 TimelineTable/TreatmentGanttView、PatientRecord 字段编辑目标、./record-page.logic 的 RecordLoadState 与 transitions-dev.css 的 tab/record view 动效合同。
 * [OUTPUT]: 对外提供 RecordPageContent、RecordViewMode、RecordExportState 与 RecordSaveState，并统一档案/极简表格/Gantt 切换动效锚点、页面级编辑入口、真实分享入口、Demo 分享预览、AI 分析入口和字段保存状态展示。
 * [POS]: routes 的档案详情内容组合层，隔离 dossier/table/gantt 视图切换、分享面板、AI 分析面板、右侧编辑工具条、字段提交入口与 crossfade 入场，让 record-page.tsx 保持路由、副作用和 Supabase 持久化编排。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { CSSProperties, RefObject } from 'react'

import type { ClinicalAnalysisPanelState } from '@/components/record/ClinicalAnalysisPanel'
import { demoTreatmentGanttSupplementNotes } from '@/components/record/demo-record'
import { labels } from '@/components/record/record-copy'
import { RecordSharePanel, type RecordSharePanelState } from '@/components/record/RecordSharePanel'
import { RecordDossier, RecordUnavailableDossier } from '@/components/record/record-dossier'
import type { ExportFormat } from '@/components/record/types'
import { TimelineTable } from '@/components/timeline/TimelineTable'
import { TreatmentGanttView } from '@/components/timeline/TreatmentGanttView'
import type { Locale } from '@/lib/locale'
import type { Theme } from '@/lib/theme'
import type { PatientFieldTarget, PatientRangeTarget, PatientRecord } from '@/types/patient'

import type { RecordLoadState } from './record-page.logic'

export type RecordViewMode = 'dossier' | 'table' | 'gantt'

export type RecordExportState = {
  error: string | null
  format: ExportFormat | null
  isExporting: boolean
}

export type RecordSaveState = {
  error: string | null
  status: 'idle' | 'saving' | 'saved' | 'error'
}

type RecordPageContentProps = {
  activeRecordLoadState: RecordLoadState
  clinicalAnalysisState?: ClinicalAnalysisPanelState
  demoRecord: PatientRecord
  demoRoute: boolean
  exportState: RecordExportState
  isChartEditing: boolean
  locale: Locale
  onChartEditingChange: (isEditing: boolean) => void
  onClinicalAnalyze?: () => void
  onCopyShareUrl?: () => void
  onCommitField: (target: PatientFieldTarget, value: string) => Promise<void> | void
  onCommitRange: (target: PatientRangeTarget, value: string) => Promise<void> | void
  onCreateShare?: () => void
  onExport: (format: ExportFormat) => void
  onRevokeShare?: (shareId: string) => void
  onViewModeChange: (viewMode: RecordViewMode) => void
  recordRef: RefObject<HTMLDivElement>
  saveState: RecordSaveState
  sharePreviewNotice?: string
  shareState?: RecordSharePanelState
  theme: Theme
  viewMode: RecordViewMode
}

const switchCopy = {
  en: {
    dossier: 'Dossier view',
    table: 'Timeline table',
    gantt: 'Gantt view',
  },
  zh: {
    dossier: '档案视图',
    table: '极简表格',
    gantt: '甘特图视图',
  },
} satisfies Record<Locale, Record<RecordViewMode, string>>

const emptyClinicalAnalysisState: ClinicalAnalysisPanelState = {
  error: null,
  isLoading: false,
  result: null,
}

function getGanttRecord(demoRoute: boolean, activeRecordLoadState: RecordLoadState, demoRecord: PatientRecord): PatientRecord | null {
  return demoRoute ? demoRecord : activeRecordLoadState.record
}

function RecordEditToolbar({
  isChartEditing,
  locale,
  onChartEditingChange,
  saveState,
}: {
  isChartEditing: boolean
  locale: Locale
  onChartEditingChange: (isEditing: boolean) => void
  saveState: RecordSaveState
}) {
  const activeLabel = locale === 'zh' ? '关闭编辑' : 'Turn off editing'
  const inactiveLabel = locale === 'zh' ? '开启编辑' : 'Turn on editing'
  const inactiveText = locale === 'zh' ? '编辑' : 'Edit'
  const statusText = {
    error: saveState.error ?? (locale === 'zh' ? '保存失败' : 'Save failed'),
    idle: '',
    saved: locale === 'zh' ? '已保存' : 'Saved',
    saving: locale === 'zh' ? '保存中...' : 'Saving...',
  }[saveState.status]

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 text-sm font-semibold text-[var(--ff-text-secondary)]">
      {statusText ? (
        <span className={saveState.status === 'error' ? 'text-[var(--ff-accent-primary)]' : 'text-[var(--ff-text-muted)]'} role={saveState.status === 'error' ? 'alert' : 'status'}>
          {statusText}
        </span>
      ) : null}
      <button
        aria-label={isChartEditing ? activeLabel : inactiveLabel}
        aria-pressed={isChartEditing}
        className={[
          'inline-flex h-8 items-center gap-1.5 rounded-[var(--ff-radius-sm)] border px-2.5 text-xs font-bold',
          isChartEditing
            ? 'border-[var(--ff-accent-primary)] bg-[color-mix(in_srgb,var(--ff-accent-primary)_14%,transparent)] text-[var(--ff-accent-primary)]'
            : 'border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] text-[var(--ff-text-secondary)]',
        ].join(' ')}
        onClick={() => onChartEditingChange(!isChartEditing)}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">{isChartEditing ? 'done' : 'edit'}</span>
        {isChartEditing ? (locale === 'zh' ? '完成编辑' : 'Done') : inactiveText}
      </button>
    </div>
  )
}

function RecordViewSwitch({
  locale,
  onViewModeChange,
  viewMode,
}: {
  locale: Locale
  onViewModeChange: (viewMode: RecordViewMode) => void
  viewMode: RecordViewMode
}) {
  const text = switchCopy[locale]
  const modes: RecordViewMode[] = ['dossier', 'table', 'gantt']
  const activeIndex = modes.indexOf(viewMode)
  const sliderStyle = {
    '--tab-switch-count': modes.length,
    '--tab-switch-index': activeIndex,
  } as CSSProperties

  return (
    <div
      aria-label={locale === 'zh' ? '病历详情视图切换' : 'Record detail view switch'}
      className="t-tab-switch t-tab-switch-slider inline-flex rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-1"
      data-active-page={viewMode}
      data-testid="record-view-switch"
      style={sliderStyle}
    >
      <span aria-hidden="true" className="t-tab-switch-thumb" />
      {modes.map((mode) => {
        const active = viewMode === mode

        return (
          <button
            aria-pressed={active}
            className={[
              'relative z-[1] h-10 rounded-[var(--ff-radius-md)] px-4 text-sm font-semibold tracking-normal',
              active ? 'text-white' : 'text-[var(--ff-text-secondary)]',
            ].join(' ')}
            key={mode}
            onClick={() => onViewModeChange(mode)}
            type="button"
          >
            {text[mode]}
          </button>
        )
      })}
    </div>
  )
}

export function RecordPageContent({
  activeRecordLoadState,
  clinicalAnalysisState = emptyClinicalAnalysisState,
  demoRecord,
  demoRoute,
  exportState,
  isChartEditing,
  locale,
  onChartEditingChange,
  onClinicalAnalyze,
  onCopyShareUrl,
  onCommitField,
  onCommitRange,
  onCreateShare,
  onExport,
  onRevokeShare,
  onViewModeChange,
  recordRef,
  saveState,
  sharePreviewNotice,
  shareState,
  theme,
  viewMode,
}: RecordPageContentProps) {
  const ganttRecord = getGanttRecord(demoRoute, activeRecordLoadState, demoRecord)
  const switchNode = ganttRecord ? <RecordViewSwitch locale={locale} onViewModeChange={onViewModeChange} viewMode={viewMode} /> : null
  const toolbarNode = ganttRecord ? (
    <RecordEditToolbar
      isChartEditing={isChartEditing}
      locale={locale}
      onChartEditingChange={onChartEditingChange}
      saveState={saveState}
    />
  ) : null
  const controlsNode = ganttRecord ? (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      {switchNode}
      {toolbarNode}
    </div>
  ) : null

  if (ganttRecord && viewMode === 'gantt') {
    return (
      <>
        {controlsNode}
        <div className="t-record-view" data-active-page="gantt">
          <TreatmentGanttView
            isEditable={isChartEditing}
            locale={locale}
            onCommitField={onCommitField}
            onCommitRange={onCommitRange}
            record={ganttRecord}
            supplementNotes={demoRoute ? demoTreatmentGanttSupplementNotes : undefined}
          />
        </div>
      </>
    )
  }

  if (ganttRecord && viewMode === 'table') {
    return (
      <>
        {controlsNode}
        <div className="t-record-view" data-active-page="table">
          <TimelineTable
            disabled={!isChartEditing}
            onCommitField={onCommitField}
            record={ganttRecord}
            theme={theme}
          />
        </div>
      </>
    )
  }

  if (demoRoute) {
    return (
      <>
        {controlsNode}
        {shareState && onCreateShare && onCopyShareUrl && onRevokeShare ? (
          <RecordSharePanel
            locale={locale}
            onCopyCreatedUrl={onCopyShareUrl}
            onCreateShare={onCreateShare}
            onRevokeShare={onRevokeShare}
            previewNotice={sharePreviewNotice}
            state={shareState}
          />
        ) : null}
        <div className="t-record-view" data-active-page="dossier">
          <RecordDossier
            clinicalAnalysisState={clinicalAnalysisState}
            exportError={exportState.error}
            exportFormat={exportState.format}
            isEditable={isChartEditing}
            isExportDisabled={false}
            isExporting={exportState.isExporting}
            locale={locale}
            onCommitField={onCommitField}
            onCommitRange={onCommitRange}
            onClinicalAnalyze={undefined}
            onExport={onExport}
            record={demoRecord}
            recordRef={recordRef}
          />
        </div>
      </>
    )
  }

  if (activeRecordLoadState.record) {
    return (
      <>
        {controlsNode}
        {shareState && onCreateShare && onCopyShareUrl && onRevokeShare ? (
          <RecordSharePanel
            locale={locale}
            onCopyCreatedUrl={onCopyShareUrl}
            onCreateShare={onCreateShare}
            onRevokeShare={onRevokeShare}
            previewNotice={sharePreviewNotice}
            state={shareState}
          />
        ) : null}
        <div className="t-record-view" data-active-page="dossier">
          <RecordDossier
            clinicalAnalysisState={clinicalAnalysisState}
            exportError={exportState.error}
            exportFormat={exportState.format}
            isEditable={isChartEditing}
            isExportDisabled={false}
            isExporting={exportState.isExporting}
            locale={locale}
            onCommitField={onCommitField}
            onCommitRange={onCommitRange}
            onClinicalAnalyze={onClinicalAnalyze}
            onExport={onExport}
            record={activeRecordLoadState.record}
            recordRef={recordRef}
          />
        </div>
      </>
    )
  }

  return (
    <div className="t-record-view" data-active-page="dossier">
      <RecordUnavailableDossier
        exportError={exportState.error}
        exportFormat={exportState.format}
        isExporting={exportState.isExporting}
        locale={locale}
        message={activeRecordLoadState.isLoading ? labels[locale].loadingRecord : activeRecordLoadState.error ?? labels[locale].missingRecord}
        onExport={onExport}
      />
    </div>
  )
}
