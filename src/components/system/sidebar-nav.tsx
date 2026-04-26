/**
 * [INPUT]: 依赖 react 的状态、ref 与 pointer/keyboard 事件，依赖 react-router-dom 的 Link/useLocation，依赖 FireflyMark 与 SidebarShell，依赖 @/lib/theme、locale 与紧凑可拖拽侧栏 token。
 * [OUTPUT]: 对外提供 ArchiveSideNav 组件、ArchiveSideNavProps 类型与 AVATAR_PLACEHOLDER 常量。
 * [POS]: src/components/system 的共享侧栏导航组件，统一 dark/light 的紧凑桌面默认展开、移动端默认收起、独立品牌 mark/标题、边线胶囊折叠、窄恢复胶囊、左缘渐进拉出、拖拽缩放到隐藏、阈值 icon-only、active 图标与文字同色、Google Translate 与临床笔记图标、无下拉误导的偏好控制与会话出口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { FireflyMark } from '@/components/system/firefly-mark'
import { SidebarShell } from '@/components/system/surfaces'
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'
import { useTheme } from '@/lib/theme'
import {
  sidebarDefaultWidth,
  sidebarLabelHideWidth,
  sidebarMaxWidth,
  sidebarMinWidth,
  sidebarWidthClass,
  themeTransitionClass,
} from '@/lib/theme/tokens'
import { cn } from '@/lib/utils'

export const AVATAR_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBkHYctOEhI9aqSSxbv-d8PP9dV4BClO1EwGd1OO2l69w9lThnnTLBoPBO8-Sp8GPx2ofiKOO9Rz4nJnWoYww9EvtQG4C_rkiLkEWq7mNrJA_kORudcZdPtTopsy8pz_pftXyqmsyYtOis4v5ZX7Kr6gaaWBVJvDrIoF6lQjiiiZTh8-p0cqSHkt-xkOoxKbgYH3PdgjKekdaoxQ0aBX7vgNmykPGaT4I8qqoehbA7cEzWKbIAt8uypCq6CEkAWaxaePc4BZA0Se3Ej'

const navItems = [
  { icon: 'my_location', href: '/app', labelKey: 'extract' },
  { icon: 'clinical_notes', href: '/record/demo', labelKey: 'record' },
  { icon: 'bar_chart', href: '/login', labelKey: 'analytics' },
] as const

const SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY = 'firefly-sidebar-expanded-width-v5'
const POINTER_DRAG_THRESHOLD = 4
const HIDDEN_EDGE_HIT_WIDTH = 40
const HIDDEN_SWIPE_VERTICAL_TOLERANCE = 44
const MOBILE_SIDEBAR_QUERY = '(max-width: 767px)'
type HiddenRevealId = number | 'mouse'
type HiddenRevealDrag = {
  didReveal: boolean
  id: HiddenRevealId
  width: number
  x: number
  y: number
}

function clampSidebarWidth(width: number) {
  return Math.min(sidebarMaxWidth, Math.max(sidebarMinWidth, Math.round(width)))
}

function normalizeExpandedWidth(width: number) {
  const clampedWidth = clampSidebarWidth(width)

  return clampedWidth >= sidebarDefaultWidth ? clampedWidth : sidebarDefaultWidth
}

function readStoredExpandedWidth() {
  if (typeof window === 'undefined') {
    return sidebarDefaultWidth
  }

  const stored = Number(window.localStorage.getItem(SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY))

  return Number.isFinite(stored) ? normalizeExpandedWidth(stored) : sidebarDefaultWidth
}

function writeStoredExpandedWidth(width: number) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY, String(width))
}

function shouldStartHidden() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia(MOBILE_SIDEBAR_QUERY).matches
}

export type ArchiveSideNavProps = {
  dark: boolean
  isSigningOut?: boolean
  onSignOut?: () => void
  userLabel?: string
}

function isActive(pathname: string, href: string) {
  if (href === '/record/demo') {
    return pathname.startsWith('/record')
  }

  return pathname === href
}

export function ArchiveSideNav({ dark, isSigningOut = false, onSignOut, userLabel }: ArchiveSideNavProps) {
  const location = useLocation()
  const { locale, toggleLocale } = useLocale()
  const { toggleTheme } = useTheme()
  const [expandedWidth, setExpandedWidth] = useState(readStoredExpandedWidth)
  const [hidden, setHidden] = useState(shouldStartHidden)
  const [width, setWidth] = useState(readStoredExpandedWidth)
  const dragMovedRef = useRef(false)
  const hiddenRevealDragRef = useRef<HiddenRevealDrag | null>(null)
  const resolvedUserLabel = userLabel ?? getCopy(copy.shell.nav.pendingAccess, locale)
  const themeName = dark ? 'dark' : 'light'
  const compact = width <= sidebarLabelHideWidth
  const sidebarStyle = useMemo(() => ({ width: `${width}px` }), [width])

  useEffect(() => {
    document.documentElement.style.setProperty('--ff-sidebar-width', `${width}px`)
    document.documentElement.style.setProperty('--ff-sidebar-offset', hidden ? '0px' : `${width}px`)
  }, [hidden, width])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const media = window.matchMedia(MOBILE_SIDEBAR_QUERY)
    const hideOnMobile = (matches: boolean) => {
      if (matches) {
        setHidden(true)
      }
    }
    const handleChange = (event: MediaQueryListEvent) => hideOnMobile(event.matches)

    hideOnMobile(media.matches)
    media.addEventListener('change', handleChange)

    return () => {
      media.removeEventListener('change', handleChange)
    }
  }, [])

  const rememberExpandedWidth = (nextWidth: number) => {
    if (nextWidth >= sidebarDefaultWidth) {
      const normalizedWidth = normalizeExpandedWidth(nextWidth)

      setExpandedWidth(normalizedWidth)
      writeStoredExpandedWidth(normalizedWidth)
    }
  }

  const restoreSidebar = () => {
    const nextWidth = normalizeExpandedWidth(expandedWidth)

    setHidden(false)
    setWidth(nextWidth)
    setExpandedWidth(nextWidth)
  }

  const startHiddenReveal = (id: HiddenRevealId, clientX: number, clientY: number) => {
    hiddenRevealDragRef.current = {
      didReveal: false,
      id,
      width: sidebarMinWidth,
      x: clientX,
      y: clientY,
    }
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }

  const clearHiddenReveal = () => {
    hiddenRevealDragRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const finishHiddenReveal = (id: HiddenRevealId) => {
    const dragState = hiddenRevealDragRef.current

    if (!dragState || dragState.id !== id) {
      return
    }

    clearHiddenReveal()

    if (!dragState.didReveal) {
      return
    }

    const nextWidth = clampSidebarWidth(dragState.width)

    setHidden(false)
    setWidth(nextWidth)

    if (nextWidth >= sidebarDefaultWidth) {
      const normalizedWidth = normalizeExpandedWidth(nextWidth)

      setExpandedWidth(normalizedWidth)
      writeStoredExpandedWidth(normalizedWidth)
    }
  }

  const trackHiddenReveal = (clientX: number, clientY: number, id: HiddenRevealId) => {
    const dragState = hiddenRevealDragRef.current

    if (!dragState || dragState.id !== id) {
      return false
    }

    const deltaX = clientX - dragState.x
    const deltaY = clientY - dragState.y

    if (!dragState.didReveal && Math.abs(deltaY) > HIDDEN_SWIPE_VERTICAL_TOLERANCE && Math.abs(deltaY) > Math.abs(deltaX)) {
      clearHiddenReveal()
      return true
    }

    if (deltaX <= POINTER_DRAG_THRESHOLD) {
      return false
    }

    const nextWidth = clampSidebarWidth(Math.max(sidebarMinWidth, deltaX))

    dragState.didReveal = true
    dragState.width = nextWidth
    setHidden(false)
    setWidth(nextWidth)

    if (nextWidth >= sidebarDefaultWidth) {
      setExpandedWidth(nextWidth)
    }

    return true
  }

  const startHiddenSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (!hidden || (event.pointerType === 'mouse' && event.button !== 0)) {
      return
    }

    const pointerId = event.pointerId

    startHiddenReveal(pointerId, event.clientX, event.clientY)

    const trackPointerReveal = (moveEvent: globalThis.PointerEvent) => {
      trackHiddenReveal(moveEvent.clientX, moveEvent.clientY, pointerId)
    }
    const stopPointerReveal = () => {
      window.removeEventListener('pointermove', trackPointerReveal)
      window.removeEventListener('pointerup', stopPointerReveal)
      window.removeEventListener('pointercancel', stopPointerReveal)
      finishHiddenReveal(pointerId)
    }

    window.addEventListener('pointermove', trackPointerReveal)
    window.addEventListener('pointerup', stopPointerReveal)
    window.addEventListener('pointercancel', stopPointerReveal)
  }

  const startHiddenMouseSwipe = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!hidden || event.button !== 0) {
      return
    }

    startHiddenReveal('mouse', event.clientX, event.clientY)

    const stopMouseSwipe = () => {
      window.removeEventListener('mousemove', trackMouseSwipe)
      window.removeEventListener('mouseup', stopMouseSwipe)
      finishHiddenReveal('mouse')
    }
    const trackMouseSwipe = (moveEvent: globalThis.MouseEvent) => {
      if (!hiddenRevealDragRef.current) {
        stopMouseSwipe()
        return
      }

      trackHiddenReveal(moveEvent.clientX, moveEvent.clientY, 'mouse')
    }

    window.addEventListener('mousemove', trackMouseSwipe)
    window.addEventListener('mouseup', stopMouseSwipe)
  }

  const cycleSidebar = () => {
    if (hidden) {
      restoreSidebar()
      return
    }

    if (compact) {
      setHidden(true)
      return
    }

    rememberExpandedWidth(width)
    setWidth(sidebarMinWidth)
  }

  const startResize = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = width
    dragMovedRef.current = false

    const resize = (moveEvent: globalThis.PointerEvent) => {
      const delta = moveEvent.clientX - startX
      const rawWidth = Math.round(startWidth + delta)
      const nextWidth = clampSidebarWidth(rawWidth)

      if (Math.abs(delta) > POINTER_DRAG_THRESHOLD) {
        dragMovedRef.current = true
      }

      if (rawWidth <= HIDDEN_EDGE_HIT_WIDTH) {
        setHidden(true)
        setWidth(sidebarMinWidth)
        return
      }

      setHidden(false)
      setWidth(nextWidth)
      rememberExpandedWidth(nextWidth)
    }

    const stopResize = (upEvent: globalThis.PointerEvent) => {
      window.removeEventListener('pointermove', resize)
      window.removeEventListener('pointerup', stopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      if (!dragMovedRef.current && Math.abs(upEvent.clientX - startX) <= POINTER_DRAG_THRESHOLD) {
        cycleSidebar()
        return
      }

      if (Math.round(startWidth + upEvent.clientX - startX) <= HIDDEN_EDGE_HIT_WIDTH) {
        setHidden(true)
        setWidth(sidebarMinWidth)
      }
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', resize)
    window.addEventListener('pointerup', stopResize)
  }

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      cycleSidebar()
      return
    }

    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return
    }

    event.preventDefault()
    const direction = event.key === 'ArrowLeft' ? -16 : 16
    const nextWidth = clampSidebarWidth(width + direction)

    setHidden(false)
    setWidth(nextWidth)
    rememberExpandedWidth(nextWidth)
  }

  const renderLabel = (label: string, className?: string) => (compact ? null : <span className={cn('truncate', className)}>{label}</span>)
  const renderBrandTitle = () =>
    compact ? null : (
      <span className="min-w-0 pl-1" data-brand-wordmark="true">
        <span className="block truncate text-[21px] font-bold leading-none tracking-normal text-[var(--ff-text-primary)]">
          {getCopy(copy.shell.brand.lightTitle, locale)}
        </span>
      </span>
    )

  const iconOnlyTooltip = (label: string) =>
    compact ? (
      <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 rounded-[var(--ff-radius-sm)] bg-[var(--ff-text-primary)] px-2 py-1 font-['JetBrains_Mono'] text-[10px] text-[var(--ff-surface-base)] shadow-sm group-hover:block">
        {label}
      </span>
    ) : null

  return (
    <>
      {hidden ? (
        <div
          className="fixed left-0 top-0 z-[60] h-screen w-10 touch-none"
          onPointerDown={startHiddenSwipe}
          onMouseDown={startHiddenMouseSwipe}
        >
          <button
            aria-label={locale === 'zh' ? '显示侧边栏' : 'Show sidebar'}
            className="absolute left-0 top-1/2 flex h-20 w-[14px] -translate-y-1/2 items-center justify-center rounded-r-[var(--ff-radius-md)] border border-l-0 border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] text-[var(--ff-accent-primary)] shadow-[0_0_22px_rgba(0,0,0,0.32)] transition-[width,border-color,background-color] duration-200 hover:w-[18px] hover:border-[var(--ff-accent-primary)]"
            onClick={restoreSidebar}
            title={locale === 'zh' ? '显示侧边栏，或从左向右滑出' : 'Show sidebar, or swipe right from the left edge'}
            type="button"
          >
            <span className="h-10 w-[3px] rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-primary)]" />
          </button>
        </div>
      ) : null}

      {hidden ? null : (
        <SidebarShell
          className={cn(
            'fixed left-0 top-0 z-50 flex h-screen flex-col justify-between overflow-visible py-4 transition-[width,background-color,border-color] duration-200 ease-out',
            sidebarWidthClass,
            compact ? 'items-center px-2' : 'px-5',
          )}
          style={sidebarStyle}
          theme={themeName}
        >
          <div className={cn('flex w-full flex-col gap-5', compact ? 'items-center' : 'items-stretch')}>
            <div className={cn('flex w-full items-center', compact ? 'justify-center' : 'justify-start')}>
              <Link
                aria-label={getCopy(copy.shell.brand.lightTitle, locale)}
                className={cn(
                  'group flex min-w-0 items-center rounded-[var(--ff-radius-md)] text-[var(--ff-text-primary)] outline-none transition-[color] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--ff-accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-surface-sidebar)]',
                  compact ? 'justify-center' : 'justify-start gap-2',
                )}
                to="/app"
              >
                <FireflyMark className={compact ? undefined : '-my-2 -ml-2 h-[72px] w-[72px]'} size={compact ? 'rail' : 'large'} />
                {renderBrandTitle()}
              </Link>
            </div>

            <nav className={cn('flex w-full flex-col gap-2', compact ? 'items-center' : 'items-stretch')}>
              {navItems.map((item) => {
                const active = isActive(location.pathname, item.href)
                const label = getCopy(copy.shell.nav[item.labelKey], locale)

                return (
                  <Link
                    aria-label={label}
                    className={cn(
                      'group relative flex h-[58px] min-w-0 items-center rounded-[var(--ff-radius-sm)] border text-[var(--ff-text-secondary)]',
                      themeTransitionClass,
                      compact ? 'w-12 justify-center' : 'w-full justify-start gap-4 px-5',
                      active
                        ? 'border-transparent text-[var(--ff-accent-primary)]'
                        : 'border-transparent hover:border-[var(--ff-border-default)] hover:bg-[var(--ff-surface-panel)] hover:text-[var(--ff-text-primary)]',
                    )}
                    key={item.href}
                    title={label}
                    to={item.href}
                  >
                    <span className={cn('material-symbols-outlined shrink-0 text-[26px]', active ? 'text-[var(--ff-accent-primary)]' : '')}>
                      {item.icon}
                    </span>
                    {renderLabel(label, cn('text-base font-semibold', active ? 'text-[var(--ff-accent-primary)]' : ''))}
                    {iconOnlyTooltip(label)}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className={cn('flex w-full flex-col border-t border-[var(--ff-border-default)] pt-4', compact ? 'items-center gap-2' : 'items-stretch gap-2')}>
            <button
              aria-label={getCopy(copy.shell.nav.themeToggle, locale)}
              className={cn(
                'group relative flex h-11 min-w-0 items-center rounded-[var(--ff-radius-sm)] text-[var(--ff-text-secondary)] transition-colors hover:bg-[var(--ff-surface-panel)] hover:text-[var(--ff-accent-primary)]',
                compact ? 'w-11 justify-center' : 'w-full gap-4 px-5',
              )}
              onClick={toggleTheme}
              title={getCopy(copy.shell.nav.themeToggle, locale)}
              type="button"
            >
              <span className="material-symbols-outlined shrink-0 text-[24px]">{dark ? 'light_mode' : 'dark_mode'}</span>
              {renderLabel(locale === 'zh' ? '切换主题' : 'Toggle theme', 'text-sm font-medium')}
              {iconOnlyTooltip(getCopy(copy.shell.nav.themeToggle, locale))}
            </button>

            <button
              aria-label={getCopy(copy.localeToggle[locale === 'zh' ? 'en' : 'zh'], locale)}
              className={cn(
                'group relative flex h-11 min-w-0 items-center rounded-[var(--ff-radius-sm)] text-[var(--ff-text-secondary)] transition-colors hover:bg-[var(--ff-surface-panel)] hover:text-[var(--ff-accent-primary)]',
                compact ? 'w-11 justify-center' : 'w-full gap-4 px-5',
              )}
              onClick={toggleLocale}
              title={getCopy(copy.localeToggle[locale === 'zh' ? 'en' : 'zh'], locale)}
              type="button"
            >
              <span className="material-symbols-outlined shrink-0 text-[24px]">g_translate</span>
              {renderLabel(getCopy(copy.localeToggle[locale], locale), 'text-sm font-medium')}
              {iconOnlyTooltip(getCopy(copy.localeToggle[locale], locale))}
            </button>

            <div
              aria-label={resolvedUserLabel}
              className={cn(
                'group relative flex h-11 min-w-0 items-center rounded-[var(--ff-radius-sm)] text-[var(--ff-text-secondary)]',
                compact ? 'w-11 justify-center' : 'w-full gap-4 px-5',
              )}
              title={resolvedUserLabel}
            >
              <span className="material-symbols-outlined shrink-0 text-[24px]">theater_comedy</span>
              {renderLabel(resolvedUserLabel, 'text-sm font-medium')}
              {iconOnlyTooltip(resolvedUserLabel)}
            </div>

            {onSignOut ? (
              <button
                aria-label={isSigningOut ? getCopy(copy.shell.nav.signingOut, locale) : getCopy(copy.shell.nav.signOut, locale)}
                className={cn(
                  'group relative flex h-11 min-w-0 items-center rounded-[var(--ff-radius-sm)] text-[var(--ff-text-secondary)] transition-colors hover:bg-[var(--ff-surface-panel)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50',
                  compact ? 'w-11 justify-center' : 'w-full gap-4 px-5',
                )}
                disabled={isSigningOut}
                onClick={onSignOut}
                title={isSigningOut ? getCopy(copy.shell.nav.signingOut, locale) : getCopy(copy.shell.nav.signOut, locale)}
                type="button"
              >
                <span className="material-symbols-outlined shrink-0 text-[24px]">logout</span>
                {renderLabel(isSigningOut ? getCopy(copy.shell.nav.signingOut, locale) : getCopy(copy.shell.nav.signOut, locale), 'text-sm font-medium')}
                {iconOnlyTooltip(isSigningOut ? getCopy(copy.shell.nav.signingOut, locale) : getCopy(copy.shell.nav.signOut, locale))}
              </button>
            ) : null}
          </div>

          <div
            aria-label={
              locale === 'zh'
                ? compact
                  ? '点击隐藏侧边栏，拖拽调整宽度'
                  : '点击收起到图标侧边栏，拖拽调整宽度'
                : compact
                  ? 'Click to hide sidebar, drag to resize'
                  : 'Click to collapse to icon sidebar, drag to resize'
            }
            aria-orientation="vertical"
            aria-valuemax={sidebarMaxWidth}
            aria-valuemin={sidebarMinWidth}
            aria-valuenow={width}
            className="group absolute right-[-7px] top-0 z-[70] h-full w-[14px] cursor-col-resize touch-none outline-none"
            onKeyDown={resizeWithKeyboard}
            onPointerDown={startResize}
            role="separator"
            tabIndex={0}
            title={
              locale === 'zh'
                ? compact
                  ? '点击隐藏，拖拽调整'
                  : '点击收起，拖拽调整'
                : compact
                  ? 'Click to hide, drag to resize'
                  : 'Click to collapse, drag to resize'
            }
          >
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--ff-border-default)] transition-colors group-hover:bg-[var(--ff-accent-primary)] group-focus-visible:bg-[var(--ff-accent-primary)]" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-[9px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[var(--ff-radius-full)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-shell)] shadow-[0_0_18px_rgba(0,0,0,0.32)] transition-[border-color,box-shadow] group-hover:border-[var(--ff-accent-primary)] group-hover:shadow-[0_0_22px_color-mix(in_srgb,var(--ff-accent-primary)_32%,transparent)] group-focus-visible:border-[var(--ff-accent-primary)]">
              <span className="h-8 w-[3px] rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-primary)] opacity-80" />
            </span>
          </div>
        </SidebarShell>
      )}
    </>
  )
}
