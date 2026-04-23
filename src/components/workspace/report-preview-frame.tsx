/**
 * [INPUT]: 依赖 @/components/system/surfaces 的 ActionSurface，依赖 @/components/timeline/TimelineTable 的正式表格渲染器，依赖 @/components/app-shell 的 QR 占位图与外部传入的导出/保存状态。
 * [OUTPUT]: 对外提供 ReportPreviewFrame 组件，统一 dark/light 报告预览框架与 TimelineTable 包裹结构。
 * [POS]: components/workspace 的报告预览区块，被 workspace-page 组合，用于让 TimelineTable 直接成为主表面，并把补充信息压到表格之后。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { QR_PLACEHOLDER } from '@/components/app-shell'
import { ActionSurface } from '@/components/system/surfaces'
import { TimelineTable } from '@/components/timeline/TimelineTable'
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'
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

  if (theme === 'dark') {
    return (
      <div ref={setReportRef}>
        <TimelineTable disabled={isExtracting || isSaving} onCommitField={onCommitField} record={record} theme="dark" />

        <div className="mt-12 flex items-center justify-between border-t-2 border-[var(--ff-border-default)] pt-4">
          <div className="max-w-[400px] font-['JetBrains_Mono'] text-[9px] text-[var(--ff-text-secondary)]">
            {getCopy(copy.workspace.report.disclaimer, locale)}
          </div>
          <div className="flex flex-col items-center border border-[var(--ff-border-default)] p-2">
            <div className="flex h-16 w-16 items-center justify-center bg-[var(--ff-surface-soft)]">
              <img alt={getCopy(copy.workspace.report.verifyQr, locale)} src={QR_PLACEHOLDER} />
            </div>
            <span className="mt-1 text-[8px] text-[var(--ff-text-secondary)]">{getCopy(copy.workspace.report.verifyQr, locale)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={setReportRef}>
      <TimelineTable disabled={isExtracting || isSaving} onCommitField={onCommitField} record={record} theme="light" />

      <div className="mt-12 grid grid-cols-2 gap-12 border-t border-[var(--ff-border-muted)] pt-8">
        <div>
          <h5 className="mb-4 font-['Inter'] text-[10px] font-bold uppercase tracking-widest">{getCopy(copy.workspace.report.clinicalNotes, locale)}</h5>
          <p className="text-xs italic text-[var(--ff-text-secondary)]">
            {remainingMissing.length > 0
              ? `${getCopy(copy.workspace.report.missingFields, locale)}${remainingMissing.join(locale === 'zh' ? '、' : ', ')}`
              : getCopy(copy.workspace.report.completed, locale)}
          </p>
        </div>
        <div className="flex flex-col justify-end">
          <ActionSurface className="flex items-center justify-between p-4" theme="light" tone="soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-[var(--ff-text-primary)] font-['Playfair_Display'] text-xl font-black text-[var(--ff-surface-base)]">
                AI
              </div>
              <div>
                <p className="font-['Inter'] text-[10px] font-bold uppercase leading-none">{getCopy(copy.workspace.report.verifiedBy, locale)}</p>
                <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--ff-text-secondary)]">
                  {getCopy(copy.workspace.report.followUpsUsed, locale)}{followUpCount}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[var(--ff-accent-warning)]">verified</span>
          </ActionSurface>
        </div>
      </div>
    </div>
  )
}
