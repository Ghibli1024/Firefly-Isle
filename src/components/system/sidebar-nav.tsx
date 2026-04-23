/**
 * [INPUT]: 依赖 react-router-dom 的 Link/useLocation，依赖 @/components/system/surfaces 的 SidebarShell，依赖 @/lib/theme 的 useTheme，依赖 @/lib/theme/tokens 的 sidebarWidthClass 与过渡类。
 * [OUTPUT]: 对外提供 ArchiveSideNav 组件、ArchiveSideNavProps 类型与 AVATAR_PLACEHOLDER 常量。
 * [POS]: src/components/system 的共享侧栏导航组件，统一 dark/light 的侧栏几何、导航、主题切换与会话出口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Link, useLocation } from 'react-router-dom'

import { SidebarShell } from '@/components/system/surfaces'
import { useTheme } from '@/lib/theme'
import { sidebarWidthClass, themeTransitionClass } from '@/lib/theme/tokens'
import { cn } from '@/lib/utils'

export const AVATAR_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBkHYctOEhI9aqSSxbv-d8PP9dV4BClO1EwGd1OO2l69w9lThnnTLBoPBO8-Sp8GPx2ofiKOO9Rz4nJnWoYww9EvtQG4C_rkiLkEWq7mNrJA_kORudcZdPtTopsy8pz_pftXyqmsyYtOis4v5ZX7Kr6gaaWBVJvDrIoF6lQjiiiZTh8-p0cqSHkt-xkOoxKbgYH3PdgjKekdaoxQ0aBX7vgNmykPGaT4I8qqoehbA7cEzWKbIAt8uypCq6CEkAWaxaePc4BZA0Se3Ej'

const darkNavItems = [
  { label: '提取', icon: 'content_paste_search', href: '/app' },
  { label: '病历', icon: 'folder_managed', href: '/record/demo' },
  { label: '统计', icon: 'analytics', href: '/login' },
]

const lightNavItems = [
  { label: '提取', icon: 'clinical_notes', href: '/app' },
  { label: '病历', icon: 'description', href: '/record/demo' },
  { label: '统计', icon: 'analytics', href: '/login' },
]

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
  const { toggleTheme } = useTheme()
  const navItems = dark ? darkNavItems : lightNavItems
  const resolvedUserLabel = userLabel ?? (dark ? 'ACCESS_PENDING' : 'Visitor Session')

  return (
    <SidebarShell
      className={dark
        ? `fixed left-0 top-0 z-40 flex h-full ${sidebarWidthClass} flex-col px-6 pb-8 pt-20`
        : `sticky top-0 flex h-screen ${sidebarWidthClass} flex-col justify-between overflow-y-auto p-6`}
      theme={dark ? 'dark' : 'light'}
    >
      <div className={dark ? 'mb-8' : 'space-y-8'}>
        <div className={dark ? 'mb-8' : 'flex flex-col gap-1'}>
          <div
            className={dark
              ? "font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[var(--ff-text-secondary)]"
              : "text-2xl font-['Newsreader'] font-bold uppercase tracking-tighter text-[var(--ff-text-primary)]"}
          >
            {dark ? 'FORENSIC_ARCHIVE_V1' : '一页萤岛'}
          </div>
          <div
            className={dark
              ? "font-['JetBrains_Mono'] text-[14px] font-bold text-[var(--ff-accent-primary)]"
              : "text-[10px] font-['Inter'] uppercase tracking-[0.2em] text-[var(--ff-text-muted)]"}
          >
            {dark ? '临床 AI 控制台' : 'Clinical AI Workspace'}
          </div>
        </div>

        {!dark ? (
          <button className="w-full bg-[var(--ff-text-primary)] py-3 font-['Inter'] text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ff-surface-base)] transition-opacity hover:opacity-90">
            New Extraction
          </button>
        ) : null}

        <nav className={dark ? 'flex flex-1 flex-col' : "flex flex-col gap-4 font-['Newsreader'] tracking-tight"}>
          {navItems.map((item) => {
            const active = isActive(location.pathname, item.href)

            return (
              <Link
                className={dark
                  ? cn(
                      "flex items-center gap-3 px-6 py-4 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest",
                      themeTransitionClass,
                      active
                        ? 'border-r-2 border-[var(--ff-accent-primary)] bg-[var(--ff-surface-panel)] font-bold text-[var(--ff-accent-primary)]'
                        : 'text-[var(--ff-text-secondary)] hover:text-[var(--ff-accent-primary)]',
                    )
                  : cn(
                      'flex items-center gap-3 p-2',
                      themeTransitionClass,
                      active
                        ? 'translate-x-1 border-b-4 border-[var(--ff-border-default)] font-bold text-[var(--ff-text-primary)]'
                        : 'text-[var(--ff-text-secondary)] hover:bg-[var(--ff-text-primary)] hover:text-[var(--ff-surface-base)]',
                    )}
                key={item.href}
                to={item.href}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className={dark ? 'mt-auto flex flex-col gap-4' : 'space-y-4'}>
        <button
          className={dark
            ? "flex items-center gap-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[var(--ff-text-secondary)] transition-colors hover:text-[var(--ff-accent-primary)]"
            : "flex items-center gap-3 p-2 font-['Newsreader'] text-[var(--ff-text-secondary)] transition-colors hover:bg-[var(--ff-text-primary)] hover:text-[var(--ff-surface-base)]"}
          onClick={toggleTheme}
          type="button"
        >
          <span className="material-symbols-outlined text-lg">{dark ? 'dark_mode' : 'contrast'}</span>
          <span>{dark ? '切换主题' : 'Theme Toggle'}</span>
        </button>

        {dark ? (
          <>
            <div className="flex items-center gap-3 border-t border-[var(--ff-border-default)] pt-4 transition-[border-color] duration-200 ease-out">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden border border-[var(--ff-border-muted)] bg-[var(--ff-surface-soft)]">
                <img alt="用户头像" src={AVATAR_PLACEHOLDER} />
              </div>
              <div className="overflow-hidden font-['JetBrains_Mono'] text-[10px] uppercase">
                <div className="truncate text-[var(--ff-text-primary)]">{resolvedUserLabel}</div>
              </div>
            </div>
            {onSignOut ? (
              <button
                className="flex items-center justify-between border border-[var(--ff-border-default)] px-4 py-3 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.25em] text-[var(--ff-text-secondary)] transition-[background-color,color,border-color] duration-200 ease-out hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSigningOut}
                onClick={onSignOut}
                type="button"
              >
                <span>{isSigningOut ? '会话结束中' : '退出登录'}</span>
                <span className="material-symbols-outlined text-base">logout</span>
              </button>
            ) : null}
          </>
        ) : (
          <>
            <div className="border-t border-[var(--ff-border-muted)] pt-4">
              <div className="px-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.18em] text-[var(--ff-text-muted)]">
                {resolvedUserLabel}
              </div>
            </div>
            {onSignOut ? (
              <button
                className="flex items-center gap-3 p-2 font-['Newsreader'] text-[var(--ff-text-secondary)] transition-colors hover:bg-[var(--ff-text-primary)] hover:text-[var(--ff-surface-base)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSigningOut}
                onClick={onSignOut}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                <span>{isSigningOut ? 'Ending Session' : 'Sign Out'}</span>
              </button>
            ) : (
              <button className="flex items-center gap-3 p-2 font-['Newsreader'] text-[var(--ff-text-secondary)] transition-colors hover:bg-[var(--ff-text-primary)] hover:text-[var(--ff-surface-base)]" type="button">
                <span className="material-symbols-outlined text-lg">account_circle</span>
                <span>User Profile</span>
              </button>
            )}
          </>
        )}
      </div>
    </SidebarShell>
  )
}
