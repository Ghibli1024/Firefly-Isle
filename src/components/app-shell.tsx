/**
 * [INPUT]: 依赖 react-router-dom 的 Link、useLocation，依赖 @/lib/theme 的 useTheme。
 * [OUTPUT]: 对外提供 DarkTopBar、ArchiveSideNav、LightMasthead 与设计复刻所需的占位图常量。
 * [POS]: components 的设计复刻壳层基元，为 dark/light 登录页、工作区与详情页提供同构导航、主题切换与认证出口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Link, useLocation } from 'react-router-dom'

import { useTheme } from '@/lib/theme'

export const AVATAR_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBkHYctOEhI9aqSSxbv-d8PP9dV4BClO1EwGd1OO2l69w9lThnnTLBoPBO8-Sp8GPx2ofiKOO9Rz4nJnWoYww9EvtQG4C_rkiLkEWq7mNrJA_kORudcZdPtTopsy8pz_pftXyqmsyYtOis4v5ZX7Kr6gaaWBVJvDrIoF6lQjiiiZTh8-p0cqSHkt-xkOoxKbgYH3PdgjKekdaoxQ0aBX7vgNmykPGaT4I8qqoehbA7cEzWKbIAt8uypCq6CEkAWaxaePc4BZA0Se3Ej'

export const QR_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCodMwGgWvuwF5LOmg917ngq1oe0WPAGBvhZreAMsUlKJvYTRJWEVO4reEpFvrks9HRlph4tMYP8n0cUIH1tr0G1iY4h8ejtcyA9YbsVggEGH8XpAXsiVtqDp_iUEs4YkP7ZBbbfvVG8Smlndbs3Pep1M4IC4QyLH2XKQ6__VO4hEqXYrsZyIviesrCk1LwAv-73YdRfFeRkZAR_YYQdbAXSNUwkXW5lO17y6apkHeyptmFTiCLefqtyyFjUSMkduWUunUTiDnmQsBc'

export const REPORT_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8egfpCbDKutF3Pj8yUX771rGTYNwb_Yr_nkSbp9YjObJgp5NyZ0tpUpWqt8wfssDZt9eVyaSPT0crzG3BZtKLq8CsdKamZzlaUf8FjNbBo5vF0aS2EbyfHd9musVqkWQMbO2U2INWo3g3Xd_P9_jwjyBvyuNexTF8A7wkvb3iV2bl-XSJ9C8FTEbodtoJN80B-ZwSfSgkCgVCYx7NNrtn1W4lx9CpL0avpzD3r0-y9CE3CsHsFo4nnHulDkfVwE78wG3nyoPHViia'

export const SCAN_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBIwAaPORS3qiXqWxIzVwSRQz5zsHUdSDHZ65CVNm52sSYNPegfX4Ji6IvrRm1NgX7aLyPq5gYNfMecx0iBJzeA-ntwTRfmbkWpFuGPrSNvkd5wHt_LIWP_17YcmA-dL_OUvcpN_wp-jyn8wXiRyjF42FblzEL_6wnJCJP6GzPycv0fRjWSjwS1_xNVxzD4936hCCGE1e5cMUG1fZkc_6OiNMEcVuqgtqcGBh2RnPwBYsL21g_vcuQgUhHTWT7Q_4gojBwKUhyTIo6w'

export const PATHOLOGY_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBOSPocHG_hrOiExe-cxT7ts-cfaH_51_OTMT3yC1yKKwz-uL9Hlo3LJiu3nw0VuEJJXmNompcIJJFyHs9k2mSDK1mXX89s0MWZufAzpQB9eSIA5NtNgz01GtD4Q8Jamod0sDj8rSbKgc3oj_TEpC6mpybF45zjJHv1mjaCi4lx9tKbgE61EG40E0ASllr-yboGCP_9DGRcrbVi7UjKTprA4xICHdDIq-tUiLYOovfAQyJ6aE1uNpix0vR1IspbLgNUIWYShgJ9pWSj'

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

type ArchiveSideNavProps = {
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

export function DarkTopBar() {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-6 text-[#FAFAFA]">
      <div className="border-l-2 border-[#FF3D00] pl-4 font-['Inter_Tight'] text-xl font-black uppercase tracking-tight">
        一页萤岛
      </div>
      <div className="flex items-center gap-6 text-[24px]">
        <span className="material-symbols-outlined cursor-pointer p-1 transition-none hover:bg-[#FF3D00] hover:text-[#0A0A0A]">
          help
        </span>
        <span className="material-symbols-outlined cursor-pointer p-1 transition-none hover:bg-[#FF3D00] hover:text-[#0A0A0A]">
          settings
        </span>
      </div>
    </header>
  )
}

export function ArchiveSideNav({ dark, isSigningOut = false, onSignOut, userLabel }: ArchiveSideNavProps) {
  const location = useLocation()
  const { toggleTheme } = useTheme()
  const navItems = dark ? darkNavItems : lightNavItems
  const resolvedUserLabel = userLabel ?? (dark ? 'ACCESS_PENDING' : 'Visitor Session')

  return (
    <aside
      className={dark
        ? 'fixed left-0 top-0 z-40 flex h-full w-[15%] min-w-[220px] flex-col border-r border-[#262626] bg-[#000000] px-6 pb-8 pt-20 text-[#FAFAFA]'
        : 'sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto border-r-2 border-[#111111] bg-[#F9F9F7] p-6 text-[#111111]'}
    >
      <div className={dark ? 'mb-8' : 'space-y-8'}>
        <div className={dark ? 'mb-8' : 'flex flex-col gap-1'}>
          <div
            className={dark
              ? "font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[#FAFAFA] opacity-60"
              : "text-2xl font-['Newsreader'] font-bold uppercase tracking-tighter"}
          >
            {dark ? 'FORENSIC_ARCHIVE_V1' : '一页萤岛'}
          </div>
          <div
            className={dark
              ? "font-['JetBrains_Mono'] text-[14px] font-bold text-[#FF3D00]"
              : "text-[10px] font-['Inter'] uppercase tracking-[0.2em] text-[#111111]/60"}
          >
            {dark ? '临床 AI 控制台' : 'Clinical AI Workspace'}
          </div>
        </div>

        {!dark ? (
          <button className="w-full bg-[#111111] py-3 font-['Inter'] text-[11px] font-bold uppercase tracking-[0.18em] text-[#F9F9F7] transition-opacity hover:opacity-90">
            New Extraction
          </button>
        ) : null}

        <nav className={dark ? 'flex flex-1 flex-col' : "flex flex-col gap-4 font-['Newsreader'] tracking-tight"}>
          {navItems.map((item) => {
            const active = isActive(location.pathname, item.href)

            return (
              <Link
                key={item.href}
                className={dark
                  ? `flex items-center gap-3 px-6 py-4 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest ${
                      active
                        ? 'border-r-2 border-[#FF3D00] bg-[#131313] font-bold text-[#FF3D00]'
                        : 'text-[#FAFAFA] opacity-60 transition-colors hover:text-[#FF3D00]'
                    }`
                  : `flex items-center gap-3 p-2 ${
                      active
                        ? 'translate-x-1 border-b-4 border-[#111111] font-bold text-[#111111]'
                        : 'text-[#111111]/60 transition-colors duration-75 hover:bg-[#111111] hover:text-[#F9F9F7]'
                    }`}
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
            ? "flex items-center gap-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[#FAFAFA] opacity-60 transition-colors hover:text-[#FF3D00]"
            : "flex items-center gap-3 p-2 font-['Newsreader'] text-[#111111]/60 transition-colors hover:bg-[#111111] hover:text-[#F9F9F7]"}
          onClick={toggleTheme}
          type="button"
        >
          <span className="material-symbols-outlined text-lg">{dark ? 'dark_mode' : 'contrast'}</span>
          <span>{dark ? '切换主题' : 'Theme Toggle'}</span>
        </button>

        {dark ? (
          <>
            <div className="flex items-center gap-3 border-t border-[#262626] pt-4">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden border border-[#353534] bg-[#262626]">
                <img alt="用户头像" src={AVATAR_PLACEHOLDER} />
              </div>
              <div className="overflow-hidden font-['JetBrains_Mono'] text-[10px] uppercase">
                <div className="truncate text-[#FAFAFA]">{resolvedUserLabel}</div>
              </div>
            </div>
            {onSignOut ? (
              <button
                className="flex items-center justify-between border border-[#262626] px-4 py-3 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.25em] text-[#FAFAFA]/75 transition-colors hover:border-[#FF3D00] hover:text-[#FF3D00] disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="border-t border-[#111111]/10 pt-4">
              <div className="px-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.18em] text-[#111111]/50">
                {resolvedUserLabel}
              </div>
            </div>
            {onSignOut ? (
              <button
                className="flex items-center gap-3 p-2 font-['Newsreader'] text-[#111111]/60 transition-colors hover:bg-[#111111] hover:text-[#F9F9F7] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSigningOut}
                onClick={onSignOut}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                <span>{isSigningOut ? 'Ending Session' : 'Sign Out'}</span>
              </button>
            ) : (
              <button className="flex items-center gap-3 p-2 font-['Newsreader'] text-[#111111]/60 transition-colors hover:bg-[#111111] hover:text-[#F9F9F7]" type="button">
                <span className="material-symbols-outlined text-lg">account_circle</span>
                <span>User Profile</span>
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

export function LightMasthead() {
  return (
    <header className="w-full bg-[#F9F9F7] px-6 pb-4 pt-8 md:px-12">
      <div className="flex flex-col items-center">
        <h1 className="font-['Playfair_Display'] text-6xl font-black uppercase tracking-tighter text-[#111111] md:text-8xl">
          一页萤岛
        </h1>
        <div className="mt-4 h-1 w-full bg-[#111111]" />
        <div className="mt-1 h-px w-full bg-[#111111]" />
        <div className="flex w-full items-center justify-between py-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#111111]">
          <span>VOL. 01 — NO. 52</span>
          <span>Clinical AI Workspace</span>
          <span>EST. 2024</span>
        </div>
        <div className="h-px w-full bg-[#111111]" />
      </div>
    </header>
  )
}
