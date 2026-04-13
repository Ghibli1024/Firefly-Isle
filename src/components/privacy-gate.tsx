/**
 * [INPUT]: 依赖 react 的 PropsWithChildren、useEffect、useState，依赖 react-router-dom 的 Link、useLocation，依赖 @/lib/privacy 的隐私文案、独立隐私页路由与 localStorage key，依赖 @/lib/theme 的 useTheme。
 * [OUTPUT]: 对外提供 PrivacyGate 组件。
 * [POS]: components 的全局隐私门控层，在用户本地确认前阻塞整个应用入口，并为独立隐私页放行访问。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { type PropsWithChildren, useEffect, useState } from 'react'

import { Link, useLocation } from 'react-router-dom'
import {
  PRIVACY_ACCEPTED_STORAGE_KEY,
  PRIVACY_PAGE_HREF,
  PRIVACY_POLICY_ITEMS,
  PRIVACY_POLICY_SUMMARY,
} from '@/lib/privacy'
import { useTheme } from '@/lib/theme'

function readPrivacyAccepted() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(PRIVACY_ACCEPTED_STORAGE_KEY) === 'true'
}

function DarkPrivacyOverlay({ onAccept, onStayBlocked }: { onAccept: () => void; onStayBlocked: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] flex min-h-screen items-center justify-center bg-[#050505]/96 p-6 text-[#FAFAFA] backdrop-blur-sm">
      <div className="w-full max-w-3xl border border-[#262626] bg-[#0A0A0A] p-8 md:p-12">
        <div className="mb-4 inline-block border border-[#262626] bg-[#1A1A1A] px-3 py-1 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[#FF3D00]">
          Privacy Gate
        </div>
        <h2 className="font-['Inter_Tight'] text-[clamp(2rem,5vw,4rem)] font-black leading-[0.92] tracking-tighter">
          在进入系统前，
          <br />
          请先确认数据使用说明
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[#FAFAFA]/70 md:text-lg">
          {PRIVACY_POLICY_SUMMARY}
        </p>

        <div className="mt-8 grid gap-px bg-[#262626] md:grid-cols-3">
          {PRIVACY_POLICY_ITEMS.map((item, index) => (
            <div className="bg-[#0A0A0A] p-5" key={item.title}>
              <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-[#FF3D00]">
                0{index + 1}
              </div>
              <div className="mt-3 text-lg font-bold tracking-tight">{item.title}</div>
              <p className="mt-2 text-sm leading-6 text-[#FAFAFA]/60">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[#262626] pt-6 md:flex-row">
          <button
            className="flex-1 bg-[#FF3D00] px-6 py-4 font-['Inter_Tight'] text-sm font-black uppercase tracking-[0.2em] text-[#0A0A0A] transition-colors hover:bg-[#FAFAFA]"
            onClick={onAccept}
            type="button"
          >
            我已了解并继续
          </button>
          <Link
            className="flex flex-1 items-center justify-center border border-[#262626] px-6 py-4 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.25em] text-[#FAFAFA]/70 transition-colors hover:border-[#FF3D00] hover:text-[#FF3D00]"
            to={PRIVACY_PAGE_HREF}
          >
            查看完整隐私条款
          </Link>
          <button
            className="flex-1 border border-[#262626] px-6 py-4 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.25em] text-[#FAFAFA]/70 transition-colors hover:border-[#FF3D00] hover:text-[#FF3D00]"
            onClick={onStayBlocked}
            type="button"
          >
            暂不继续
          </button>
        </div>
      </div>
    </div>
  )
}

function LightPrivacyOverlay({ onAccept, onStayBlocked }: { onAccept: () => void; onStayBlocked: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] flex min-h-screen items-center justify-center bg-[#f2f0ea]/96 p-6 text-[#111111] backdrop-blur-sm">
      <div className="ff-light-ink-shadow w-full max-w-3xl border-2 border-[#111111] bg-[#F9F9F7] p-8 md:p-12">
        <div className="mb-5 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.35em] text-[#5d5f5b]">
          Privacy Notice / 入场须知
        </div>
        <h2 className="font-['Playfair_Display'] text-[clamp(2.25rem,5vw,4.5rem)] font-black leading-[0.92] tracking-tight">
          在开始之前，
          <br />
          请确认隐私与用途边界
        </h2>
        <p className="mt-6 text-base leading-7 text-[#111111]/75 md:text-lg">{PRIVACY_POLICY_SUMMARY}</p>

        <div className="mt-8 space-y-4 border-y border-[#111111] py-5">
          {PRIVACY_POLICY_ITEMS.map((item) => (
            <div className="flex items-start gap-3" key={item.title}>
              <span className="mt-1 h-2 w-2 shrink-0 bg-[#111111]" />
              <div>
                <p className="font-['Inter'] text-[10px] font-bold uppercase tracking-[0.14em] text-[#5d5f5b]">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#111111]/80">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <button
            className="border-2 border-[#111111] bg-[#111111] px-6 py-4 font-['Inter'] text-sm font-bold uppercase tracking-[0.2em] text-[#F9F9F7] transition-colors hover:bg-[#F9F9F7] hover:text-[#111111]"
            onClick={onAccept}
            type="button"
          >
            同意并继续
          </button>
          <Link
            className="flex items-center justify-center border-2 border-[#111111] px-6 py-4 font-['Inter'] text-sm font-bold uppercase tracking-[0.2em] text-[#111111] transition-colors hover:bg-[#111111] hover:text-[#F9F9F7]"
            to={PRIVACY_PAGE_HREF}
          >
            查看完整隐私条款
          </Link>
          <button
            className="border-2 border-[#111111] px-6 py-4 font-['Inter'] text-sm font-bold uppercase tracking-[0.2em] text-[#111111] transition-colors hover:bg-[#111111] hover:text-[#F9F9F7]"
            onClick={onStayBlocked}
            type="button"
          >
            暂不进入
          </button>
        </div>
      </div>
    </div>
  )
}

export function PrivacyGate({ children }: PropsWithChildren) {
  const { pathname } = useLocation()
  const { theme } = useTheme()
  const [accepted, setAccepted] = useState(readPrivacyAccepted)
  const shouldBypassGate = pathname === PRIVACY_PAGE_HREF

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const previousOverflow = document.body.style.overflow

    if (!accepted && !shouldBypassGate) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [accepted, shouldBypassGate])

  const acceptPrivacy = () => {
    window.localStorage.setItem(PRIVACY_ACCEPTED_STORAGE_KEY, 'true')
    setAccepted(true)
  }

  const stayBlocked = () => {
    window.localStorage.removeItem(PRIVACY_ACCEPTED_STORAGE_KEY)
    setAccepted(false)
  }

  return (
    <>
      {children}
      {accepted || shouldBypassGate ? null : theme === 'dark' ? (
        <DarkPrivacyOverlay onAccept={acceptPrivacy} onStayBlocked={stayBlocked} />
      ) : (
        <LightPrivacyOverlay onAccept={acceptPrivacy} onStayBlocked={stayBlocked} />
      )}
    </>
  )
}
