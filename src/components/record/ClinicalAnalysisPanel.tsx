/**
 * [INPUT]: 依赖 @/lib/clinical-analysis 的 ClinicalAnalysisResult，依赖 @/lib/locale 的 Locale。
 * [OUTPUT]: 对外提供 ClinicalAnalysisPanel 组件，渲染 AI 辅助分析入口、加载态、失败态、结果分区与非诊断免责声明。
 * [POS]: components/record 的 AI 分析展示层，由 record-page.view 注入状态和动作，不直接调用 LLM 或读取 Supabase。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { ClinicalAnalysisResult } from '@/lib/clinical-analysis'
import type { Locale } from '@/lib/locale'

export type ClinicalAnalysisPanelState = {
  error: string | null
  isLoading: boolean
  result: ClinicalAnalysisResult | null
}

function AnalysisList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm leading-7 text-[var(--ff-text-muted)]">暂无可展示内容</p>
  }

  return (
    <ul className="space-y-2 text-sm leading-7 text-[var(--ff-text-secondary)]">
      {items.map((item) => (
        <li className="flex gap-2" key={item}>
          <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-primary)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function AnalysisBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] p-4">
      <h4 className="mb-3 text-sm font-bold text-[var(--ff-text-primary)]">{title}</h4>
      <AnalysisList items={items} />
    </section>
  )
}

export function ClinicalAnalysisPanel({
  disabled,
  locale,
  onAnalyze,
  state,
}: {
  disabled?: boolean
  locale: Locale
  onAnalyze?: () => void
  state: ClinicalAnalysisPanelState
}) {
  const copy = locale === 'zh'
    ? {
        action: '生成 AI 辅助分析',
        attention: '复核关注点',
        disclaimerFallback: '仅作病历整理和随访沟通参考，不构成诊断、疾病进展判断、用药建议或治疗指令。',
        followUp: '就诊前可补充问题',
        lab: '指标趋势摘要',
        loading: '分析中...',
        title: 'AI 辅助分析',
        treatment: '治疗线摘要',
        unavailable: '演示或未授权记录暂不生成真实 AI 分析。',
      }
    : {
        action: 'Generate AI analysis',
        attention: 'Review focus',
        disclaimerFallback: 'For record organization and follow-up communication only. Not diagnosis or treatment advice.',
        followUp: 'Questions to prepare',
        lab: 'Lab trend summary',
        loading: 'Analyzing...',
        title: 'AI Assisted Analysis',
        treatment: 'Treatment summary',
        unavailable: 'Demo or unauthorized records cannot generate real AI analysis.',
      }
  const result = state.result

  return (
    <section className="mt-8 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold">{copy.title}</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ff-text-secondary)]">
            {result?.disclaimer ?? copy.disclaimerFallback}
          </p>
        </div>
        <button
          className="t-control-press inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || state.isLoading || !onAnalyze}
          onClick={onAnalyze}
          type="button"
        >
          <span className="material-symbols-outlined text-lg">psychology_alt</span>
          {state.isLoading ? copy.loading : copy.action}
        </button>
      </div>

      {!onAnalyze ? (
        <div className="mt-4 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-muted)] bg-[var(--ff-surface-inset)] px-4 py-3 text-sm font-semibold text-[var(--ff-text-secondary)]">
          {copy.unavailable}
        </div>
      ) : null}

      {state.error ? (
        <div className="mt-4 rounded-[var(--ff-radius-md)] border border-[var(--ff-accent-primary)] bg-[var(--ff-surface-warning)] px-4 py-3 text-sm font-semibold text-[var(--ff-accent-primary)]" role="alert">
          {state.error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <AnalysisBlock items={result.treatmentSummary} title={copy.treatment} />
          <AnalysisBlock items={result.labTrendSummary} title={copy.lab} />
          <AnalysisBlock items={result.attentionPoints} title={copy.attention} />
          <AnalysisBlock items={result.followUpQuestions} title={copy.followUp} />
        </div>
      ) : null}
    </section>
  )
}
