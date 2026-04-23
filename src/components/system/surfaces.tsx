/**
 * [INPUT]: 依赖 react 的 PropsWithChildren，依赖 @/lib/theme/tokens 的过渡类与侧栏宽度合同。
 * [OUTPUT]: 对外提供 SidebarShell、TopBarShell、MainShell、PanelSurface、SectionSurface、ActionSurface 与 SurfaceTone 类型。
 * [POS]: src/components/system 的壳层与表面基元文件，为页面与 app-shell 提供统一结构与 surface contract。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { PropsWithChildren } from 'react'

import { themeTransitionClass } from '@/lib/theme/tokens'
import { cn } from '@/lib/utils'
import type { Theme } from '@/lib/theme'

type SurfaceTone = 'accent' | 'base' | 'inset' | 'panel' | 'soft' | 'warning'

type ThemedProps = PropsWithChildren<{
  className?: string
  theme: Theme
}>

function sidebarSurface(theme: Theme) {
  return cn(
    'bg-[var(--ff-surface-sidebar)] border-[var(--ff-border-default)] text-[var(--ff-text-primary)]',
    theme === 'dark' ? 'border-r' : 'border-r-2',
  )
}

function panelSurface(theme: Theme, tone: SurfaceTone) {
  const borderWidth = theme === 'dark' ? 'border' : 'border-2'

  const surfaceByTone: Record<SurfaceTone, string> = {
    accent: 'bg-[var(--ff-surface-accent)]',
    base: 'bg-[var(--ff-surface-base)]',
    inset: 'bg-[var(--ff-surface-inset)]',
    panel: 'bg-[var(--ff-surface-panel)]',
    soft: 'bg-[var(--ff-surface-soft)]',
    warning: 'bg-[var(--ff-surface-warning)]',
  }

  return cn(borderWidth, 'border-[var(--ff-border-default)] text-[var(--ff-text-primary)]', surfaceByTone[tone])
}

export function SidebarShell({ children, className, theme }: ThemedProps) {
  return <aside className={cn('shrink-0', themeTransitionClass, sidebarSurface(theme), className)}>{children}</aside>
}

export function TopBarShell({ children, className }: ThemedProps) {
  return (
    <header className={cn(themeTransitionClass, 'bg-[var(--ff-surface-shell)] text-[var(--ff-text-primary)]', className)}>
      {children}
    </header>
  )
}

export function MainShell({ children, className, theme }: ThemedProps) {
  return (
    <main
      className={cn(
        themeTransitionClass,
        theme === 'dark' ? 'bg-[var(--ff-surface-shell)] text-[var(--ff-text-primary)]' : 'bg-[var(--ff-surface-base)] text-[var(--ff-text-primary)]',
        className,
      )}
    >
      {children}
    </main>
  )
}

export function PanelSurface({ children, className, theme, tone = 'panel' }: ThemedProps & { tone?: SurfaceTone }) {
  return <div className={cn(themeTransitionClass, panelSurface(theme, tone), className)}>{children}</div>
}

export function SectionSurface({ children, className, theme, tone = 'panel' }: ThemedProps & { tone?: SurfaceTone }) {
  return <section className={cn(themeTransitionClass, panelSurface(theme, tone), className)}>{children}</section>
}

export function ActionSurface({ children, className, theme, tone = 'panel' }: ThemedProps & { tone?: SurfaceTone }) {
  return <div className={cn(themeTransitionClass, panelSurface(theme, tone), className)}>{children}</div>
}

export type { SurfaceTone }
