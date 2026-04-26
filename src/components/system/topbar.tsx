/**
 * [INPUT]: 依赖 @/components/system/surfaces 的 TopBarShell，依赖 @/lib/theme/tokens 的可变侧栏偏移与高度合同。
 * [OUTPUT]: 对外提供 ClinicalTopBar 与 DarkTopBar 组件。
 * [POS]: src/components/system 的共享顶部状态条，统一 dark/light 页面名、系统状态、帮助与设置入口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'

import { TopBarShell } from '@/components/system/surfaces'
import { shellViewportOffsetClass, topBarHeightClass } from '@/lib/theme/tokens'
import { cn } from '@/lib/utils'

type ClinicalTopBarProps = {
  theme: 'dark' | 'light'
  title?: string
  withRail?: boolean
}

export function ClinicalTopBar({ theme, title, withRail = false }: ClinicalTopBarProps) {
  const { locale } = useLocale()
  const resolvedTitle = title ?? getCopy(copy.shell.brand.darkSubtitle, locale)
  const railOffset = withRail ? shellViewportOffsetClass : 'left-0 w-full'

  return (
    <TopBarShell
      className={cn('fixed top-0 z-40 flex items-center justify-between px-5 md:px-8', topBarHeightClass, railOffset)}
      theme={theme}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="h-7 w-[2px] shrink-0 bg-[var(--ff-accent-primary)]" />
        <div>
          <div className="font-['Inter'] text-lg font-bold tracking-tight text-[var(--ff-text-primary)] md:text-2xl">
            {resolvedTitle}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] px-4 py-2 font-['JetBrains_Mono'] text-[11px] text-[var(--ff-text-primary)] md:flex">
          <span className="h-2.5 w-2.5 rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-success)]" />
          <span>{locale === 'zh' ? '系统状态：就绪' : 'System Ready'}</span>
        </div>
        <button
          aria-label={locale === 'zh' ? '帮助' : 'Help'}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] text-[var(--ff-text-primary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)]"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">
          help
          </span>
        </button>
        <button
          aria-label={locale === 'zh' ? '设置' : 'Settings'}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] text-[var(--ff-text-primary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)]"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">
          settings
          </span>
        </button>
      </div>
    </TopBarShell>
  )
}

export function DarkTopBar() {
  const { locale } = useLocale()

  return <ClinicalTopBar theme="dark" title={getCopy(copy.shell.brand.darkTitle, locale)} />
}
