/**
 * [INPUT]: 依赖 react 的单一顶栏弹层状态与按钮 anchor，依赖 @/components/background-music-toggle 的共享背景音乐开关，依赖 @/components/system/origin-story/origin-story-paper 的创作初衷纸页，依赖 @/components/system/surfaces 的 TopBarShell，依赖 @/lib/theme/tokens 的可变侧栏边缘钉住、标题截断与高度合同。
 * [OUTPUT]: 对外提供 ClinicalTopBar 与 DarkTopBar 组件。
 * [POS]: src/components/system 的共享顶部状态条，统一 dark/light 页面名、系统状态、背景音乐短侧舱、创作初衷入口与邮件联系入口，并通过单一 overlay 状态避免弹层互相叠加。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useRef, useState } from 'react'

import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'

import { BackgroundMusicToggle } from '@/components/background-music-toggle'
import { OriginStoryPaper } from '@/components/system/origin-story/origin-story-paper'
import { TopBarShell } from '@/components/system/surfaces'
import { shellViewportOffsetClass, topBarHeightClass } from '@/lib/theme/tokens'
import { cn } from '@/lib/utils'

type ClinicalTopBarProps = {
  theme: 'dark' | 'light'
  title?: string
  withRail?: boolean
}

type TopbarOverlay = 'contact' | 'origin-story' | null

export function ClinicalTopBar({ theme, title, withRail = false }: ClinicalTopBarProps) {
  const { locale } = useLocale()
  const [openOverlay, setOpenOverlay] = useState<TopbarOverlay>(null)
  const helpButtonRef = useRef<HTMLButtonElement>(null)
  const resolvedTitle = title ?? getCopy(copy.shell.brand.darkSubtitle, locale)
  const railOffset = withRail ? shellViewportOffsetClass : 'left-0 w-full'
  const contactLabel = locale === 'zh' ? '联系我' : 'Contact'
  const contactTitle = locale === 'zh' ? '联系方式' : 'Contact'
  const contactPanelId = 'topbar-contact-card'
  const contactOpen = openOverlay === 'contact'
  const originStoryOpen = openOverlay === 'origin-story'

  return (
    <TopBarShell
      className={cn(
        'fixed top-0 z-40 flex min-w-0 items-center justify-start gap-2 px-3 sm:justify-between sm:gap-0 sm:px-5 md:px-8',
        topBarHeightClass,
        railOffset,
      )}
      theme={theme}
    >
      <div className="flex min-w-0 items-center gap-2 pr-1 sm:flex-1 sm:gap-4 sm:pr-3">
        <div className="h-7 w-[2px] shrink-0 bg-[var(--ff-accent-primary)]" />
        <div className="min-w-0">
          <div className="truncate whitespace-nowrap font-[var(--ff-font-display)] text-base font-black leading-tight tracking-normal text-[var(--ff-text-primary)] max-[360px]:sr-only sm:text-lg md:text-2xl">
            {resolvedTitle}
          </div>
        </div>
      </div>

      <div className="relative flex shrink-0 items-center gap-1 sm:gap-3">
        <div className="hidden items-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] px-4 py-2 font-[var(--ff-font-mono)] text-[11px] text-[var(--ff-text-primary)] md:flex">
          <span className="h-2.5 w-2.5 rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-success)]" />
          <span>{locale === 'zh' ? '系统状态：就绪' : 'System Ready'}</span>
        </div>
        <BackgroundMusicToggle
          className="t-control-press h-10 w-10 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] text-[var(--ff-text-primary)] hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] sm:h-11 sm:w-11"
          layout="short-dock"
        />
        <button
          aria-controls="origin-story-paper"
          aria-expanded={originStoryOpen}
          aria-label={locale === 'zh' ? '为什么做一页萤屿' : 'Why Firefly Isle'}
          className="t-control-press flex h-10 w-10 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] text-[var(--ff-text-primary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] sm:h-11 sm:w-11"
          data-topbar-action="origin-story"
          onClick={() => setOpenOverlay((current) => (current === 'origin-story' ? null : 'origin-story'))}
          ref={helpButtonRef}
          title={locale === 'zh' ? '为什么做一页萤屿' : 'Why Firefly Isle'}
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">
          help
          </span>
        </button>
        <button
          aria-controls={contactPanelId}
          aria-expanded={contactOpen}
          aria-label={contactLabel}
          className="t-control-press flex h-10 w-10 items-center justify-center rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] text-[var(--ff-text-primary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] sm:h-11 sm:w-11"
          data-topbar-action="contact"
          onClick={() => setOpenOverlay((current) => (current === 'contact' ? null : 'contact'))}
          title={contactTitle}
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">
          mail
          </span>
        </button>
        {contactOpen ? (
          <div
            aria-live="polite"
            className="t-popover fixed right-4 top-[calc(var(--ff-topbar-height)+0.75rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-4 text-sm font-semibold leading-6 text-[var(--ff-text-primary)] shadow-[0_18px_42px_rgba(0,0,0,0.28)]"
            data-testid="topbar-contact-card"
            id={contactPanelId}
            role="status"
          >
            小生才疏学浅，有任何问题都可以通过{' '}
            <strong className="font-black text-[var(--ff-accent-primary)]">ghibli1024@gmail.com</strong>
            {' '}联系我
          </div>
        ) : null}
      </div>
      <OriginStoryPaper anchorRef={helpButtonRef} onClose={() => setOpenOverlay(null)} open={originStoryOpen} theme={theme} />
    </TopBarShell>
  )
}

export function DarkTopBar() {
  const { locale } = useLocale()

  return <ClinicalTopBar theme="dark" title={getCopy(copy.shell.brand.darkTitle, locale)} />
}
