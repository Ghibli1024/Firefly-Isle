/**
 * [INPUT]: 依赖 react 的 ReactNode，依赖外部传入的章节元信息与主题语义。
 * [OUTPUT]: 对外提供 RecordSectionFrame 组件，统一 record 页面章节序号、标题、副标题、badge 与正文容器骨架。
 * [POS]: components/record 的章节框架，被 record-page 组合，用于去掉 route 内重复的 section scaffold。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { ReactNode } from 'react'

type RecordSectionFrameProps = {
  badge?: { label: string; variant?: 'filled' | 'outline' | 'warning' }
  body: ReactNode
  className?: string
  index: string
  subtitle?: string
  theme: 'dark' | 'light'
  timeframe?: string
  title: string
}

export function RecordSectionFrame({
  badge,
  body,
  className = '',
  index,
  subtitle,
  theme,
  timeframe,
  title,
}: RecordSectionFrameProps) {
  const badgeVariant = badge?.variant ?? 'filled'

  if (theme === 'dark') {
    const badgeClassName =
      badgeVariant === 'outline'
        ? "border border-[var(--ff-accent-primary)] px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-bold uppercase text-[var(--ff-accent-primary)]"
        : badgeVariant === 'warning'
          ? "bg-[var(--ff-accent-warning)] px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-bold uppercase text-white"
          : "bg-[var(--ff-accent-primary)] px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-bold uppercase text-[var(--ff-surface-base)]"

    return (
      <section className={className}>
        <div className="mb-10 flex items-baseline gap-4">
          <span className="font-['JetBrains_Mono'] text-4xl font-black text-[var(--ff-accent-primary)]">{index}</span>
          <h2 className="font-['Inter_Tight'] text-5xl font-black uppercase tracking-tight text-[var(--ff-text-primary)]">
            {title}
            {subtitle ? (
              <span className="ml-2 font-['JetBrains_Mono'] text-lg font-normal text-[var(--ff-text-muted)]">/ {subtitle}</span>
            ) : null}
          </h2>
        </div>
        {badge || timeframe ? (
          <div className="mb-6 flex items-center gap-4">
            {badge ? <span className={badgeClassName}>{badge.label}</span> : null}
            {timeframe ? <span className="font-['JetBrains_Mono'] text-sm text-[var(--ff-text-muted)]">{timeframe}</span> : null}
          </div>
        ) : null}
        {body}
      </section>
    )
  }

  const lightBadgeClassName =
    badgeVariant === 'warning'
      ? "ml-auto bg-[var(--ff-accent-warning)] px-2 font-['JetBrains_Mono'] text-sm text-white"
      : "ml-auto bg-[var(--ff-text-primary)] px-2 font-['JetBrains_Mono'] text-sm text-[var(--ff-surface-base)]"

  return (
    <article className={className}>
      <div className="mb-6 flex items-baseline gap-4">
        <span className="font-['Playfair_Display'] text-6xl font-black text-[color:color-mix(in_srgb,var(--ff-text-primary)_10%,transparent)]">
          {index}
        </span>
        <h2 className="border-b-2 border-[var(--ff-border-default)] pb-2 pr-8 font-['Newsreader'] text-4xl font-bold">
          {title}
        </h2>
        {timeframe ? <span className={lightBadgeClassName}>{timeframe}</span> : null}
      </div>
      {badge && !timeframe ? <div className="mb-4"><span className={lightBadgeClassName.replace('ml-auto ', '')}>{badge.label}</span></div> : null}
      {body}
    </article>
  )
}
