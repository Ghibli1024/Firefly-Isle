/**
 * [INPUT]: 依赖 @/components/system/surfaces 的 ActionSurface 与 PanelSurface，依赖外部传入的标题、条目与主题语义。
 * [OUTPUT]: 对外提供 RecordSideCard 组件，统一 record 页面侧栏信息卡结构。
 * [POS]: components/record 的信息卡基元，被 record-page 组合，用于承载 IHC、基因、protocol、风险等小块信息。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { ActionSurface, PanelSurface } from '@/components/system/surfaces'

type RecordSideCardItem = {
  accent?: boolean
  label: string
  value: string
}

type RecordSideCardProps = {
  body?: string
  className?: string
  items?: RecordSideCardItem[]
  subtitle?: string
  theme: 'dark' | 'light'
  title: string
  tone?: 'action' | 'panel'
}

export function RecordSideCard({
  body,
  className = '',
  items,
  subtitle,
  theme,
  title,
  tone = 'panel',
}: RecordSideCardProps) {
  const Surface = tone === 'action' ? ActionSurface : PanelSurface

  if (theme === 'dark') {
    return (
      <Surface className={`p-6 ${className}`.trim()} theme="dark" tone={tone === 'action' ? 'base' : 'panel'}>
        <div className="mb-4 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-accent-primary)]">{title}</div>
        {subtitle ? <div className="mb-3 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-muted)]">{subtitle}</div> : null}
        {body ? <div className="text-sm leading-relaxed text-[var(--ff-text-subtle)]">{body}</div> : null}
        {items ? (
          <ul className="space-y-3 font-['JetBrains_Mono'] text-xs">
            {items.map((item) => (
              <li className="flex justify-between border-b border-[color:color-mix(in_srgb,var(--ff-border-default)_50%,transparent)] pb-1" key={item.label}>
                <span className="text-[var(--ff-text-muted)]">{item.label}</span>
                <span className={item.accent ? 'font-bold text-[var(--ff-accent-primary)]' : 'font-bold'}>{item.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </Surface>
    )
  }

  return (
    <Surface className={`${className}`.trim()} theme="light" tone={tone === 'action' ? 'base' : 'panel'}>
      <div className={tone === 'panel' ? 'p-4' : 'p-4 text-[var(--ff-surface-base)]'}>
        <div className="mb-2 font-['Inter'] text-[10px] font-bold uppercase">{title}</div>
        {subtitle ? <p className="mt-1 font-['JetBrains_Mono'] text-[10px] opacity-70">{subtitle}</p> : null}
        {body ? <p className="text-sm font-bold leading-relaxed">{body}</p> : null}
        {items ? (
          <ul className="space-y-2 font-['JetBrains_Mono'] text-xs">
            {items.map((item) => (
              <li className="flex justify-between" key={item.label}>
                <span>{item.label}</span>
                <span className={item.accent ? 'font-bold text-[var(--ff-accent-warning)]' : ''}>{item.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Surface>
  )
}
