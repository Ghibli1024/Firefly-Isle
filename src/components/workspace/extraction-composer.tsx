/**
 * [INPUT]: 依赖 @/components/system/surfaces 的 ActionSurface 与 PanelSurface，依赖 theme token 样式分发与外部传入的工作区提取状态。
 * [OUTPUT]: 对外提供 ExtractionComposer 组件，渲染文本输入、错误提示、重试入口、导出动作与轻主题说明侧栏。
 * [POS]: components/workspace 的输入与主操作区块，被 workspace-page 组合，用于让 route 保留状态机而不再拼装大段输入 JSX。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
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
  if (theme === 'dark') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-accent-primary)]">
            PATIENT_HISTORY_INPUT
          </label>
          <textarea
            className="h-48 w-full resize-none border-0 border-b border-[var(--ff-border-default)] bg-[var(--ff-surface-accent)] p-4 text-[var(--ff-text-primary)] outline-none placeholder:text-[var(--ff-text-muted)] focus:border-[var(--ff-accent-primary)] focus:border-b-2"
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="请描述患者的病情及治疗历程..."
            value={extractionInput}
          />
        </div>

        {error ? (
          <ActionSurface className="px-4 py-3 text-sm text-[var(--ff-accent-warning)]" theme="dark" tone="warning">
            {error}
          </ActionSurface>
        ) : null}
        {exportError ? (
          <ActionSurface className="px-4 py-3 text-sm text-[var(--ff-accent-warning)]" theme="dark" tone="warning">
            {exportError}
          </ActionSurface>
        ) : null}
        {isSaving ? (
          <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-[0.2em] text-[var(--ff-accent-primary)]">保存中…</div>
        ) : null}

        {retryMode ? (
          <button
            className="border border-[var(--ff-border-default)] px-4 py-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[var(--ff-text-secondary)] hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)]"
            onClick={onRetry}
            type="button"
          >
            {retryMode === 'follow-up' ? '重试这轮补充' : '重试提取'}
          </button>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <button
            className="group flex flex-col items-center justify-center border-2 border-dashed border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] py-10 transition-colors hover:border-[var(--ff-accent-primary)] md:col-span-2"
            onClick={onExtract}
            type="button"
          >
            <span className="material-symbols-outlined mb-2 text-4xl text-[var(--ff-text-muted)] group-hover:text-[var(--ff-accent-primary)]">
              auto_awesome
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[var(--ff-text-muted)] group-hover:text-[var(--ff-text-primary)]">
              {isExtracting ? '提取中…' : '开始结构化提取'}
            </span>
          </button>
          <button
            className="border border-[var(--ff-border-default)] px-4 py-6 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[var(--ff-text-primary)] disabled:cursor-not-allowed disabled:text-[var(--ff-text-muted)]"
            disabled={isExtracting || isSaving || isExporting}
            onClick={() => onExport('pdf')}
            type="button"
          >
            {isExporting && exportFormat === 'pdf' ? '导出 PDF 中…' : '导出 PDF'}
          </button>
          <button
            className="border border-[var(--ff-border-default)] px-4 py-6 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[var(--ff-text-primary)] disabled:cursor-not-allowed disabled:text-[var(--ff-text-muted)]"
            disabled={isExtracting || isSaving || isExporting}
            onClick={() => onExport('png')}
            type="button"
          >
            {isExporting && exportFormat === 'png' ? '导出 PNG 中…' : '导出 PNG'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className="grid grid-cols-12 gap-8">
      <div className="col-span-8 flex flex-col gap-6">
        <PanelSurface className="p-6" theme="light" tone="panel">
          <div className="mb-4 flex items-center justify-between">
            <label className="font-['Inter'] text-xs font-bold uppercase tracking-[0.2em] text-[var(--ff-text-primary)]">
              文字输入 / TEXT INPUT
            </label>
            <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[var(--ff-accent-warning)]">
              {isExtracting ? 'ANALYZING' : 'READY TO ANALYZE'}
            </span>
          </div>
          <textarea
            className="h-48 w-full resize-none border-0 bg-transparent text-xl leading-relaxed outline-none placeholder:text-[var(--ff-text-muted)]"
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="在此输入患者病史或临床表现描述..."
            value={extractionInput}
          />
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              className="border-2 border-[var(--ff-border-default)] bg-[var(--ff-text-primary)] px-6 py-3 font-['Inter'] text-xs font-bold uppercase tracking-[0.2em] text-[var(--ff-surface-base)]"
              onClick={onExtract}
              type="button"
            >
              {isExtracting ? '提取中…' : '开始提取'}
            </button>
            {error ? <span className="text-sm text-[var(--ff-accent-warning)]">{error}</span> : null}
            {exportError ? <span className="text-sm text-[var(--ff-accent-warning)]">{exportError}</span> : null}
            {isSaving ? (
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[var(--ff-accent-warning)]">保存中…</span>
            ) : null}
            {retryMode ? (
              <button
                className="border-2 border-[var(--ff-border-default)] px-6 py-3 font-['Inter'] text-xs font-bold uppercase tracking-[0.2em]"
                onClick={onRetry}
                type="button"
              >
                {retryMode === 'follow-up' ? '重试这轮补充' : '重试提取'}
              </button>
            ) : null}
          </div>
        </PanelSurface>

        <div className="grid grid-cols-4 gap-6">
          <button
            className="border-2 border-[var(--ff-border-default)] bg-[var(--ff-text-primary)] px-6 py-3 font-['Inter'] text-xs font-bold uppercase tracking-[0.2em] text-[var(--ff-surface-base)] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isExtracting || isSaving || isExporting}
            onClick={onExtract}
            type="button"
          >
            {isExtracting ? '提取中…' : '开始提取'}
          </button>
          <button
            className="border-2 border-[var(--ff-border-default)] px-6 py-3 font-['Inter'] text-xs font-bold uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isExtracting || isSaving || isExporting}
            onClick={() => onExport('pdf')}
            type="button"
          >
            {isExporting && exportFormat === 'pdf' ? '导出 PDF 中…' : '导出 PDF'}
          </button>
          <button
            className="border-2 border-[var(--ff-border-default)] px-6 py-3 font-['Inter'] text-xs font-bold uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isExtracting || isSaving || isExporting}
            onClick={() => onExport('png')}
            type="button"
          >
            {isExporting && exportFormat === 'png' ? '导出 PNG 中…' : '导出 PNG'}
          </button>
          <ActionSurface className="ff-light-hard-shadow flex cursor-pointer flex-col items-center justify-center p-6 text-white transition-all hover:-translate-y-1" theme="light" tone="warning">
            <span className="material-symbols-outlined mb-2 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              mic
            </span>
            <span className="font-['Inter'] text-xs font-bold uppercase tracking-widest">语音录入</span>
            <span className="mt-1 font-['JetBrains_Mono'] text-[10px] opacity-80">HOLD TO RECORD</span>
          </ActionSurface>
        </div>
      </div>

      <div className="col-span-4 flex flex-col gap-8 border-l-2 border-[var(--ff-border-default)] pl-8">
        <div>
          <h3 className="mb-4 border-b border-[var(--ff-border-default)] pb-2 font-['Playfair_Display'] text-2xl font-bold">
            Instructional
          </h3>
          <p className="ff-light-drop-cap text-sm italic leading-relaxed">
            先输入完整病史，再根据追问一次性补充缺失的临床关键字段。当前仅对肿瘤类型、分期与治疗方案触发追问。
          </p>
        </div>
        <ActionSurface className="p-6 text-[var(--ff-surface-base)]" theme="light" tone="base">
          <h4 className="mb-4 font-['Inter'] text-[10px] font-bold uppercase tracking-widest">Current Parameters</h4>
          <ul className="space-y-2 font-['JetBrains_Mono'] text-[11px] opacity-80">
            <li className="flex justify-between"><span>MODEL</span><span>GEMINI</span></li>
            <li className="flex justify-between"><span>FOLLOW UPS</span><span>MAX 3</span></li>
            <li className="flex justify-between"><span>MISSING</span><span>{remainingMissingCount}</span></li>
          </ul>
        </ActionSurface>
      </div>
    </section>
  )
}
