/**
 * [INPUT]: 依赖 react 的 Effect 与本地文字切换状态，依赖 @/components/system/surfaces 的 ActionSurface 与 PanelSurface，依赖 @/lib/copy 的工作区文案真相源与外部传入的工作区提取状态，依赖 transitions-dev.css 的 .t-icon-swap 与 .t-text-swap 动效合同。
 * [OUTPUT]: 对外提供 ExtractionComposer 组件，渲染同构文本输入、文件/语音输入工具、错误提示、重试入口与唯一主提取动作。
 * [POS]: components/workspace 的输入与主操作区块，被 workspace-page 组合，负责把 /app 收敛为病史输入与结构化提取工作台。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState } from 'react'

import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'

import { ActionSurface, PanelSurface } from '@/components/system/surfaces'

type ExtractionComposerProps = {
  error: string | null
  extractionInput: string
  isExtracting: boolean
  isSaving: boolean
  onExtract: () => void
  onInputChange: (value: string) => void
  onRetry: () => void
  remainingMissingCount: number
  retryMode: 'initial' | 'follow-up' | null
  theme: 'dark' | 'light'
}

const MAX_EXTRACTION_INPUT_LENGTH = 8000

function getUnavailableTitle(feature: string, locale: 'zh' | 'en') {
  return locale === 'zh' ? `${feature}暂未开放` : `${feature} is not available yet`
}

export function ExtractionComposer({
  error,
  extractionInput,
  isExtracting,
  isSaving,
  onExtract,
  onInputChange,
  onRetry,
  remainingMissingCount,
  retryMode,
  theme,
}: ExtractionComposerProps) {
  const { locale } = useLocale()
  const disabled = isExtracting || isSaving
  const statusLabel = isExtracting
    ? getCopy(copy.workspace.composer.analyzing, locale)
    : remainingMissingCount > 0
      ? `${locale === 'zh' ? '待补充' : 'Missing'} ${remainingMissingCount}`
      : getCopy(copy.workspace.composer.ready, locale)
  const extractLabel = isExtracting
    ? getCopy(copy.workspace.composer.extracting, locale)
    : getCopy(copy.workspace.composer.extract, locale)
  const [visibleExtractLabel, setVisibleExtractLabel] = useState(extractLabel)
  const [textSwapState, setTextSwapState] = useState('')
  const [toolMessage, setToolMessage] = useState<string | null>(null)
  const inputTooLong = extractionInput.length > MAX_EXTRACTION_INPUT_LENGTH
  const importUnavailableTitle = getUnavailableTitle(getCopy(copy.workspace.composer.importRecordFile, locale), locale)
  const voiceUnavailableTitle = getUnavailableTitle(getCopy(copy.workspace.composer.voiceInput, locale), locale)

  useEffect(() => {
    if (extractLabel === visibleExtractLabel) {
      return undefined
    }

    let exitFrame: number | null = null
    let timer: number | null = null

    exitFrame = window.requestAnimationFrame(() => {
      setTextSwapState('is-exit')
      timer = window.setTimeout(() => {
        setVisibleExtractLabel(extractLabel)
        setTextSwapState('')
      }, 200)
    })

    return () => {
      if (exitFrame !== null) {
        window.cancelAnimationFrame(exitFrame)
      }
      if (timer !== null) {
        window.clearTimeout(timer)
      }
    }
  }, [extractLabel, visibleExtractLabel])

  return (
    <PanelSurface className="p-4 sm:p-6" theme={theme} tone="panel">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-[var(--ff-text-primary)]">clinical_notes</span>
          <label className="font-[var(--ff-font-display)] text-2xl font-black leading-tight tracking-normal text-[var(--ff-text-primary)]" htmlFor="patient-history-input">
            {getCopy(copy.workspace.composer.inputLabel, locale)}
          </label>
        </div>
        <span className="sr-only">{statusLabel}</span>
      </div>

      <div className="relative">
        <textarea
          className="h-44 w-full resize-none rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-4 pb-16 text-base leading-7 text-[var(--ff-text-primary)] outline-none placeholder:text-[var(--ff-text-muted)] focus:border-[var(--ff-accent-primary)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--ff-accent-primary)_18%,transparent)] sm:h-48"
          id="patient-history-input"
          maxLength={MAX_EXTRACTION_INPUT_LENGTH}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={getCopy(copy.workspace.composer.inputPlaceholder, locale)}
          value={extractionInput}
        />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
          <button
            aria-label={getCopy(copy.workspace.composer.importRecordFile, locale)}
            className="pointer-events-auto inline-flex h-10 items-center justify-center gap-2 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] px-3 font-[var(--ff-font-ui)] text-xs font-semibold text-[var(--ff-text-secondary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            data-input-tool="import-record-file"
            disabled={disabled}
            onClick={() => setToolMessage(importUnavailableTitle)}
            title={importUnavailableTitle}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">upload_file</span>
            {getCopy(copy.workspace.composer.importRecordFile, locale)}
          </button>
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              aria-label={getCopy(copy.workspace.composer.voiceInput, locale)}
              className="flex h-10 w-10 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] text-[var(--ff-text-secondary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
              data-input-tool="voice-input"
              disabled={disabled}
              onClick={() => setToolMessage(voiceUnavailableTitle)}
              title={voiceUnavailableTitle}
              type="button"
            >
              <span className="material-symbols-outlined text-xl">mic</span>
            </button>
            <span className={`font-[var(--ff-font-mono)] text-[11px] ${inputTooLong ? 'text-[var(--ff-accent-warning)]' : 'text-[var(--ff-text-muted)]'}`}>
              {extractionInput.length} / {MAX_EXTRACTION_INPUT_LENGTH}
            </span>
          </div>
        </div>
      </div>

      {toolMessage ? (
        <div className="mt-3 text-sm font-semibold text-[var(--ff-text-secondary)]" role="status">
          {toolMessage}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {retryMode ? (
          <button
            className="inline-flex h-12 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] px-5 font-[var(--ff-font-ui)] text-sm font-semibold text-[var(--ff-text-secondary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)]"
            onClick={onRetry}
            type="button"
          >
            {retryMode === 'follow-up'
              ? getCopy(copy.workspace.composer.retryFollowUp, locale)
              : getCopy(copy.workspace.composer.retryInitial, locale)}
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <button
          className="inline-flex h-12 items-center justify-center gap-3 rounded-[var(--ff-radius-md)] bg-[var(--ff-accent-primary)] px-6 font-[var(--ff-font-ui)] text-sm font-bold text-white transition-colors hover:bg-[var(--ff-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || inputTooLong}
          onClick={onExtract}
          type="button"
        >
          <span className="t-icon-swap" data-state={isExtracting ? 'b' : 'a'}>
            <span className="material-symbols-outlined t-icon text-xl" data-icon="a">my_location</span>
            <span className="material-symbols-outlined t-icon text-xl" data-icon="b">progress_activity</span>
          </span>
          <span className={`t-text-swap ${textSwapState}`}>{visibleExtractLabel}</span>
        </button>
      </div>

      {error || isSaving ? (
        <div className="mt-4 grid gap-3">
          {error ? (
            <ActionSurface className="px-4 py-3 text-sm text-[var(--ff-accent-warning)]" theme={theme} tone="warning">
              {error}
            </ActionSurface>
          ) : null}
          {isSaving ? (
            <div className="font-[var(--ff-font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--ff-accent-primary)]">
              {getCopy(copy.workspace.composer.saving, locale)}
            </div>
          ) : null}
        </div>
      ) : null}
    </PanelSurface>
  )
}
