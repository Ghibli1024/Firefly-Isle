/**
 * [INPUT]: 依赖 @/components/system/surfaces 的 ActionSurface 与 PanelSurface，依赖 @/lib/copy 的工作区文案真相源与外部传入的工作区提取状态。
 * [OUTPUT]: 对外提供 ExtractionComposer 组件，渲染同构文本输入、错误提示、重试入口、导出动作与唯一主提取动作。
 * [POS]: components/workspace 的 V3 输入与主操作区块，被 workspace-page 组合，负责清除旧 light 分支的重复按钮和废弃控制块。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'

import { ActionSurface, PanelSurface } from '@/components/system/surfaces'

type ExtractionComposerProps = {
  error: string | null
  exportError: string | null
  exportFormat: 'pdf' | 'png' | null
  extractionInput: string
  isExporting: boolean
  isExtracting: boolean
  isSaving: boolean
  onExport: (format: 'pdf' | 'png') => void
  onExtract: () => void
  onInputChange: (value: string) => void
  onRetry: () => void
  remainingMissingCount: number
  retryMode: 'initial' | 'follow-up' | null
  theme: 'dark' | 'light'
}

export function ExtractionComposer({
  error,
  exportError,
  exportFormat,
  extractionInput,
  isExporting,
  isExtracting,
  isSaving,
  onExport,
  onExtract,
  onInputChange,
  onRetry,
  remainingMissingCount,
  retryMode,
  theme,
}: ExtractionComposerProps) {
  const { locale } = useLocale()
  const disabled = isExtracting || isSaving || isExporting
  const statusLabel = isExtracting
    ? getCopy(copy.workspace.composer.analyzing, locale)
    : remainingMissingCount > 0
      ? `${locale === 'zh' ? '待补充' : 'Missing'} ${remainingMissingCount}`
      : getCopy(copy.workspace.composer.ready, locale)

  return (
    <PanelSurface className="p-4 sm:p-6" theme={theme} tone="panel">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-[var(--ff-text-primary)]">clinical_notes</span>
          <label className="font-['Inter'] text-2xl font-bold tracking-tight text-[var(--ff-text-primary)]" htmlFor="patient-history-input">
            {getCopy(copy.workspace.composer.inputLabel, locale)}
          </label>
        </div>
        <span className="sr-only">{statusLabel}</span>
      </div>

      <div className="relative">
        <textarea
          className="h-36 w-full resize-none rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-4 pr-24 text-base leading-7 text-[var(--ff-text-primary)] outline-none placeholder:text-[var(--ff-text-muted)] focus:border-[var(--ff-accent-primary)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--ff-accent-primary)_18%,transparent)] sm:h-40"
          id="patient-history-input"
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={getCopy(copy.workspace.composer.inputPlaceholder, locale)}
          value={extractionInput}
        />
        <span className="absolute bottom-4 right-4 font-['JetBrains_Mono'] text-[11px] text-[var(--ff-text-muted)]">
          {extractionInput.length} / 8000
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex h-12 items-center justify-center gap-3 rounded-[var(--ff-radius-md)] bg-[var(--ff-accent-primary)] px-6 font-['Inter'] text-sm font-bold text-white transition-colors hover:bg-[var(--ff-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={onExtract}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">my_location</span>
          {isExtracting
            ? getCopy(copy.workspace.composer.extracting, locale)
            : getCopy(copy.workspace.composer.extract, locale)}
        </button>
        <button
          className="inline-flex h-12 items-center justify-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] px-5 font-['Inter'] text-sm font-semibold text-[var(--ff-text-primary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={() => onExport('pdf')}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">description</span>
          {isExporting && exportFormat === 'pdf'
            ? getCopy(copy.workspace.composer.exportPdfLoading, locale)
            : getCopy(copy.workspace.composer.exportPdf, locale)}
        </button>
        <button
          className="inline-flex h-12 items-center justify-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] px-5 font-['Inter'] text-sm font-semibold text-[var(--ff-text-primary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={() => onExport('png')}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">image</span>
          {isExporting && exportFormat === 'png'
            ? getCopy(copy.workspace.composer.exportPngLoading, locale)
            : getCopy(copy.workspace.composer.exportPng, locale)}
        </button>

        {retryMode ? (
          <button
            className="inline-flex h-12 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] px-5 font-['Inter'] text-sm font-semibold text-[var(--ff-text-secondary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)]"
            onClick={onRetry}
            type="button"
          >
            {retryMode === 'follow-up'
              ? getCopy(copy.workspace.composer.retryFollowUp, locale)
              : getCopy(copy.workspace.composer.retryInitial, locale)}
          </button>
        ) : null}
      </div>

      {error || exportError || isSaving ? (
        <div className="mt-4 grid gap-3">
          {error ? (
            <ActionSurface className="px-4 py-3 text-sm text-[var(--ff-accent-warning)]" theme={theme} tone="warning">
              {error}
            </ActionSurface>
          ) : null}
          {exportError ? (
            <ActionSurface className="px-4 py-3 text-sm text-[var(--ff-accent-warning)]" theme={theme} tone="warning">
              {exportError}
            </ActionSurface>
          ) : null}
          {isSaving ? (
            <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[var(--ff-accent-primary)]">
              {getCopy(copy.workspace.composer.saving, locale)}
            </div>
          ) : null}
        </div>
      ) : null}
    </PanelSurface>
  )
}
