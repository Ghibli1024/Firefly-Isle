/**
 * [INPUT]: 依赖 react 的 RefObject，依赖 @/components/record 的 dossier 展示、demo-record 的默认病例、record-copy 的 labels、@/components/timeline 的 TreatmentGanttView、./record-page.logic 的 RecordLoadState 与 transitions-dev.css 的 tab/record view 动效合同。
 * [OUTPUT]: 对外提供 RecordPageContent、RecordViewMode 与 RecordExportState，并统一档案/Gantt 切换动效锚点。
 * [POS]: routes 的档案详情内容组合层，隔离 dossier/gantt 视图切换与 crossfade 入场，让 record-page.tsx 保持路由与副作用编排。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { RefObject } from 'react'

import { demoPatientRecord, demoTreatmentGanttSupplementNotes } from '@/components/record/demo-record'
import { labels } from '@/components/record/record-copy'
import { RecordDossier, RecordUnavailableDossier } from '@/components/record/record-dossier'
import type { ExportFormat } from '@/components/record/types'
import { TreatmentGanttView } from '@/components/timeline/TreatmentGanttView'
import type { Locale } from '@/lib/locale'
import type { PatientRecord } from '@/types/patient'

import type { RecordLoadState } from './record-page.logic'

export type RecordViewMode = 'dossier' | 'gantt'

export type RecordExportState = {
  error: string | null
  format: ExportFormat | null
  isExporting: boolean
}

type RecordPageContentProps = {
  activeRecordLoadState: RecordLoadState
  demoRoute: boolean
  exportState: RecordExportState
  locale: Locale
  onExport: (format: ExportFormat) => void
  onViewModeChange: (viewMode: RecordViewMode) => void
  recordRef: RefObject<HTMLDivElement>
  viewMode: RecordViewMode
}

const switchCopy = {
  en: {
    dossier: 'Dossier view',
    gantt: 'Gantt view',
  },
  zh: {
    dossier: '档案视图',
    gantt: '甘特图视图',
  },
} satisfies Record<Locale, Record<RecordViewMode, string>>

function getGanttRecord(demoRoute: boolean, activeRecordLoadState: RecordLoadState): PatientRecord | null {
  return demoRoute ? demoPatientRecord : activeRecordLoadState.record
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
  const modes: RecordViewMode[] = ['dossier', 'gantt']

  return (
    <div
      aria-label={locale === 'zh' ? '病历详情视图切换' : 'Record detail view switch'}
      className="t-tab-switch mb-4 inline-flex rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-1"
      data-active-page={viewMode}
      data-testid="record-view-switch"
    >
      {modes.map((mode) => {
        const active = viewMode === mode

        return (
          <button
            aria-pressed={active}
            className={[
              'h-10 rounded-[var(--ff-radius-md)] px-4 text-sm font-semibold tracking-normal',
              active ? 'bg-[var(--ff-accent-primary)] text-white' : 'text-[var(--ff-text-secondary)]',
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
  demoRoute,
  exportState,
  locale,
  onExport,
  onViewModeChange,
  recordRef,
  viewMode,
}: RecordPageContentProps) {
  const ganttRecord = getGanttRecord(demoRoute, activeRecordLoadState)
  const switchNode = ganttRecord ? <RecordViewSwitch locale={locale} onViewModeChange={onViewModeChange} viewMode={viewMode} /> : null

  if (ganttRecord && viewMode === 'gantt') {
    return (
      <>
        {switchNode}
        <div className="t-record-view" data-active-page="gantt">
          <TreatmentGanttView locale={locale} record={ganttRecord} supplementNotes={demoRoute ? demoTreatmentGanttSupplementNotes : undefined} />
        </div>
      </>
    )
  }

  if (demoRoute) {
    return (
      <>
        {switchNode}
        <div className="t-record-view" data-active-page="dossier">
          <RecordDossier
            exportError={exportState.error}
            exportFormat={exportState.format}
            isExportDisabled
            isExporting={exportState.isExporting}
            locale={locale}
            onExport={onExport}
            recordRef={recordRef}
          />
        </div>
      </>
    )
  }

  if (activeRecordLoadState.record) {
    return (
      <>
        {switchNode}
        <div className="t-record-view" data-active-page="dossier">
          <RecordDossier
            exportError={exportState.error}
            exportFormat={exportState.format}
            isExportDisabled={false}
            isExporting={exportState.isExporting}
            locale={locale}
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
