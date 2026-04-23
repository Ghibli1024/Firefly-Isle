/**
 * [INPUT]: 依赖 @/components/app-shell 的 DarkTopBar / LightMasthead，依赖 @/lib/privacy 的共享隐私条款真相源，依赖 @/lib/theme 的 useTheme。
 * [OUTPUT]: 对外提供 PrivacyPage 组件，对应 /privacy。
 * [POS]: routes 的独立隐私条款页，为部署后产品入口提供可访问的政策说明，并与隐私门控共享同一文案来源。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Link } from 'react-router-dom'

import { DarkTopBar, LightMasthead } from '@/components/app-shell'
import {
  PRIVACY_PAGE_HREF,
  PRIVACY_POLICY_ITEMS,
  PRIVACY_POLICY_SUMMARY,
} from '@/lib/privacy'
import { useTheme } from '@/lib/theme'

function DarkPrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--ff-surface-base)] font-['Inter'] text-[var(--ff-text-primary)]">
      <DarkTopBar />

      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-16 pt-28 md:px-10">
        <header className="border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-8 md:p-12">
          <div className="mb-4 inline-block border border-[var(--ff-border-default)] bg-[var(--ff-surface-accent)] px-3 py-1 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[var(--ff-accent-primary)]">
            Privacy Policy
          </div>
          <h1 className="font-['Inter_Tight'] text-[clamp(2.8rem,6vw,5rem)] font-black leading-[0.92] tracking-tighter">
            隐私条款与数据使用说明
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--ff-text-secondary)] md:text-lg">
            {PRIVACY_POLICY_SUMMARY}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 border-t border-[var(--ff-border-default)] pt-6">
            <Link
              className="inline-flex items-center justify-center bg-[var(--ff-accent-primary)] px-6 py-3 font-['Inter_Tight'] text-sm font-black uppercase tracking-[0.2em] text-[var(--ff-surface-base)] transition-colors hover:bg-[var(--ff-text-primary)] hover:text-[var(--ff-text-ink)]"
              to="/login"
            >
              返回登录
            </Link>
            <Link
              className="inline-flex items-center justify-center border border-[var(--ff-border-default)] px-6 py-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.24em] text-[var(--ff-text-secondary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)]"
              to={PRIVACY_PAGE_HREF}
            >
              当前页面链接
            </Link>
          </div>
        </header>

        <section aria-label="隐私条款明细" className="grid gap-px bg-[var(--ff-border-default)] md:grid-cols-3">
          {PRIVACY_POLICY_ITEMS.map((item, index) => (
            <article className="bg-[var(--ff-surface-base)] p-6 md:p-8" key={item.title}>
              <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-[var(--ff-accent-primary)]">
                0{index + 1}
              </div>
              <h2 className="mt-4 font-['Inter_Tight'] text-2xl font-black tracking-tight">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--ff-text-secondary)]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-8 md:p-10">
          <h2 className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.24em] text-[var(--ff-accent-primary)]">Accessibility & Scope</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--ff-text-secondary)]">
            <p>本页为独立可访问的产品入口隐私条款页面，便于用户在首次弹窗之外再次查阅。</p>
            <p>应用内首次进入时展示的隐私门控与本页共享同一份文案来源，避免页面与弹窗出现相互漂移的说明。</p>
            <p>当前文本仅作为 MVP 上线前占位版本，正式上线前仍需法务审核。</p>
          </div>
        </section>
      </main>
    </div>
  )
}

function LightPrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--ff-surface-base)] text-[var(--ff-text-primary)]">
      <LightMasthead />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 pb-16 pt-10 md:px-12">
        <section className="ff-light-ink-shadow border-2 border-[var(--ff-border-default)] bg-[var(--ff-surface-paper)] p-8 md:p-12">
          <div className="mb-5 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.35em] text-[var(--ff-text-muted)]">
            Privacy Notice
          </div>
          <h1 className="font-['Playfair_Display'] text-[clamp(3rem,6vw,5.5rem)] font-black leading-[0.92] tracking-tight">
            隐私条款与用途边界
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--ff-text-secondary)] md:text-lg">{PRIVACY_POLICY_SUMMARY}</p>
          <div className="mt-8 flex flex-wrap gap-4 border-t border-[var(--ff-border-default)] pt-6">
            <Link
              className="inline-flex items-center justify-center border-2 border-[var(--ff-border-default)] bg-[var(--ff-text-primary)] px-6 py-3 font-['Inter'] text-sm font-bold uppercase tracking-[0.2em] text-[var(--ff-surface-base)] transition-colors hover:bg-[var(--ff-surface-base)] hover:text-[var(--ff-text-primary)]"
              to="/login"
            >
              返回登录
            </Link>
            <Link
              className="inline-flex items-center justify-center border-2 border-[var(--ff-border-default)] px-6 py-3 font-['Inter'] text-sm font-bold uppercase tracking-[0.2em] text-[var(--ff-text-primary)] transition-colors hover:bg-[var(--ff-text-primary)] hover:text-[var(--ff-surface-base)]"
              to={PRIVACY_PAGE_HREF}
            >
              当前页面链接
            </Link>
          </div>
        </section>

        <section aria-label="隐私条款明细" className="grid gap-6 md:grid-cols-3">
          {PRIVACY_POLICY_ITEMS.map((item) => (
            <article className="ff-light-ink-shadow border-2 border-[var(--ff-border-default)] bg-[var(--ff-surface-paper)] p-6 md:p-8" key={item.title}>
              <h2 className="border-b border-[var(--ff-border-default)] pb-3 font-['Newsreader'] text-3xl font-bold tracking-tight">
                {item.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--ff-text-subtle)]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="border-2 border-[var(--ff-border-default)] bg-[var(--ff-surface-soft)] p-8 md:p-10">
          <h2 className="font-['Inter'] text-xs font-bold uppercase tracking-[0.2em]">Accessibility & Scope</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--ff-text-subtle)]">
            <p>本页是产品入口可直接访问的隐私条款页，不依赖首次启动弹窗才能看到全部说明。</p>
            <p>弹窗与本页共同依赖 `src/lib/privacy.ts` 的单一真相源，保证条款摘要与三条边界说明始终同步。</p>
            <p>当前版本仍为 MVP 占位文案，正式发布前需要替换为法务确认后的文本。</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export function PrivacyPage() {
  const { theme } = useTheme()

  return theme === 'dark' ? <DarkPrivacyPage /> : <LightPrivacyPage />
}
