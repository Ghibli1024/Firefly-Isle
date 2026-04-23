/**
 * [INPUT]: 依赖 react 的表单事件类型，依赖 react-router-dom 的 Link，依赖 @/components/app-shell 的 DarkTopBar、LightMasthead 与报告占位素材，依赖 @/lib/privacy 的隐私页路由与摘要真相源，依赖 @/lib/theme/tokens 的顶部偏移合同，依赖登录页表单状态 props。
 * [OUTPUT]: 对外提供 LoginPageView 组件，以及 AuthMode / AuthFeedback / LoginPageViewProps 类型。
 * [POS]: components 的登录页展示层，承载无工作区导航的 Dark/Light 入口画布、认证表单、页面级主题切换与产品入口隐私页跳转，不负责 Supabase 认证状态机。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { DarkTopBar, LightMasthead, REPORT_PLACEHOLDER } from '@/components/app-shell'
import { LocaleToggle } from '@/components/locale-toggle'
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'
import { PRIVACY_PAGE_HREF, PRIVACY_POLICY_SUMMARY } from '@/lib/privacy'
import type { Theme } from '@/lib/theme'
import { topBarOffsetClass } from '@/lib/theme/tokens'

const WECHAT_ICON_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBENcjiU82jtpJo8cffyabcrVxd__Iz5VLI_StMAAMIuXtkQbq_w9NBtPmf3b_b3TtmA0QjwnWGc5un6mv619Cq1k6bo6nDHhij04dVA9asRSiI1gN0YrgOGUa11d1cc9YazDzK6nDXjqXqF4P-1xdrDXwrrDEzzK7B97qVWtxR3z0NhxxkLXJOOLdf_aVKd9tjnB28NflL6wQtnTbdIajZWK12XfTXDwJLvlAf-xaJzHpjpc0s6NidKZHAB34AlQnfSrC5DXc2YQja'

const GOOGLE_ICON_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDOmWE02XUxPbmd1ZekN9XjAMyJg_-Hd0J8-5_Zqv-d7GjQz6fP-WitTalM_YoIuCZ1M5VDPcDmofR10cNDnHxAKFNOcwcrG0lhf_jBSV7TdIw5jKCdEenY0wrsZV3I1s_BO6E6-kv2cc50dXiFBKRzmfpH0HHDW3avqihQy_xyzvj5Lcp_tpYzo3y1o-LuvtHgloXNi44_Y8uj4CG2UXli-KdQtOdM1uwOJZ2k7soVBhHTHr7pLTn1G9aL62JGYTzZpFu7dG3H3sVZ'

export type AuthMode = 'login' | 'sign-up'
export type FeedbackTone = 'error' | 'success' | 'neutral'

export type AuthFeedback = {
  tone: FeedbackTone
  message: string
}

export type LoginPageViewProps = {
  authError?: string | null
  email: string
  feedback: AuthFeedback | null
  isSubmitting: boolean
  mode: AuthMode
  onAnonymousLogin: () => void
  onEmailChange: (value: string) => void
  onModeChange: (mode: AuthMode) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onToggleTheme: () => void
  password: string
  theme: Theme
}

function WechatGlyph() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.218 7.652c1.971 0 3.506.967 3.506 2.158 0 1.191-1.535 2.158-3.506 2.158-1.971 0-3.506-.967-3.506-2.158 0-1.191 1.535-2.158 3.506-2.158zm7.404 1.902c1.588 0 2.827.778 2.827 1.737 0 .959-1.239 1.737-2.827 1.737-1.588 0-2.827-.778-2.827-1.737 0-.959 1.239-1.737 2.827-1.737zm6.378 1.956c0-4.56-4.32-8.258-9.643-8.258-5.322 0-9.643 3.698-9.643 8.258 0 4.14 3.551 7.587 8.358 8.163l-1.049 3.033 3.619-1.81c.883.254 1.821.393 2.715.393 5.323 0 9.643-3.722 9.643-8.258l-.001.479zm-13.061 5.36c-.461 0-.913-.035-1.354-.101l-1.808.904.524-1.516c-2.404-.288-4.181-2.009-4.181-4.08 0-2.28 2.378-4.128 5.312-4.128 2.934 0 5.312 1.848 5.312 4.128 0 2.28-2.378 4.128-5.312 4.128l.207-.835z" />
    </svg>
  )
}

function GoogleGlyph() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.747-.053-1.453-.16-2.053H12.48z" />
    </svg>
  )
}

function DarkAuthFeedback({ feedback }: { feedback: AuthFeedback | null }) {
  if (!feedback) {
    return null
  }

  const toneClass =
    feedback.tone === 'error'
      ? 'border-[var(--ff-border-strong)] text-[var(--ff-accent-warning)]'
      : feedback.tone === 'success'
        ? 'border-[var(--ff-accent-success)] text-[var(--ff-accent-success)]'
        : 'border-[var(--ff-border-default)] text-[var(--ff-text-secondary)]'

  return (
    <div className={`border px-4 py-3 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] ${toneClass}`}>
      {feedback.message}
    </div>
  )
}

function LightAuthFeedback({ feedback }: { feedback: AuthFeedback | null }) {
  if (!feedback) {
    return null
  }

  const toneClass =
    feedback.tone === 'error'
      ? 'border-[var(--ff-accent-warning)] text-[var(--ff-accent-warning)]'
      : feedback.tone === 'success'
        ? 'border-[var(--ff-accent-success)] text-[var(--ff-accent-success)]'
        : 'border-[var(--ff-border-default)] text-[var(--ff-text-muted)]'

  return (
    <div className={`border px-4 py-3 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] ${toneClass}`}>
      {feedback.message}
    </div>
  )
}

function DarkLoginView({
  authError,
  email,
  feedback,
  isSubmitting,
  mode,
  onAnonymousLogin,
  onEmailChange,
  onModeChange,
  onPasswordChange,
  onSubmit,
  onToggleTheme,
  password,
}: Omit<LoginPageViewProps, 'theme'>) {
  const { locale } = useLocale()
  const submitLabel =
    mode === 'login' ? getCopy(copy.login.auth.submitLogin, locale) : getCopy(copy.login.auth.submitSignup, locale)
  const dividerLabel =
    mode === 'login' ? getCopy(copy.login.auth.dividerLogin, locale) : getCopy(copy.login.auth.dividerSignup, locale)
  const privacySummary = locale === 'zh' ? PRIVACY_POLICY_SUMMARY : 'We respect your medical privacy and use your data only to provide secure clinical extraction services.'

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--ff-surface-base)] font-['Inter'] text-[var(--ff-text-primary)]">
      <DarkTopBar />

      <main className={`flex min-h-screen flex-col ${topBarOffsetClass} md:flex-row`}>
        <section className="relative flex w-full flex-col justify-center overflow-hidden border-b border-[var(--ff-border-default)] p-12 md:w-[65%] md:border-b-0 md:border-r md:p-24">
          <div className="absolute right-0 top-0 p-8 text-right font-['JetBrains_Mono'] text-[10px] uppercase leading-relaxed tracking-widest text-[var(--ff-text-muted)] opacity-30 select-none">
            FORENSIC_ARCHIVE_SYSTEM_V1.0
            <br />
            ENCRYPTION_LEVEL: TRIPLE_AES_256
            <br />
            DATA_EXTRACTION_PROTOCOL: ACTIVE
          </div>

          <div className="max-w-4xl space-y-8">
            <div className="mb-4 inline-block border border-[var(--ff-border-default)] bg-[var(--ff-surface-accent)] px-2 py-1 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[var(--ff-accent-primary)]">
              {getCopy(copy.login.hero.badge, locale)}
            </div>
            <h1 className="font-['Inter_Tight'] text-[clamp(3rem,8vw,6rem)] font-black leading-[0.9] tracking-tighter text-[var(--ff-text-primary)]">
              {getCopy(copy.login.hero.titleLine1, locale)}
              <br />
              {getCopy(copy.login.hero.titleLine2, locale)}
              <span className="text-[var(--ff-accent-primary)]">{getCopy(copy.login.hero.titleAccent, locale)}</span>
            </h1>
            <p className="max-w-2xl text-xl leading-relaxed text-[var(--ff-text-secondary)] md:text-2xl">
              {getCopy(copy.login.hero.subtitle, locale)}
            </p>
            <div className="flex items-center gap-4 pt-12 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] text-[var(--ff-text-muted)]">
              <div className="h-px w-24 bg-[var(--ff-border-default)]" />
              <span>{getCopy(copy.login.hero.ready, locale)}</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-px w-full bg-[var(--ff-border-default)]" />
        </section>

        <section className="relative flex w-full flex-col justify-center bg-[var(--ff-surface-base)] p-12 md:w-[35%] md:p-16">
          <div className="mx-auto w-full max-w-sm space-y-8">
            <header className="space-y-4">
              <div className="space-y-2">
                <h2 className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[var(--ff-accent-primary)]">{getCopy(copy.login.auth.authentication, locale)}</h2>
                <p className="text-lg font-bold tracking-tight">{getCopy(copy.login.auth.heading, locale)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 border border-[var(--ff-border-default)] p-1">
                <button
                  className={`px-3 py-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    mode === 'login'
                      ? 'bg-[var(--ff-accent-primary)] text-[var(--ff-surface-base)]'
                      : 'text-[var(--ff-text-secondary)] hover:text-[var(--ff-text-primary)]'
                  }`}
                  onClick={() => onModeChange('login')}
                  type="button"
                >
                  {getCopy(copy.login.auth.login, locale)}
                </button>
                <button
                  className={`px-3 py-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    mode === 'sign-up'
                      ? 'bg-[var(--ff-accent-primary)] text-[var(--ff-surface-base)]'
                      : 'text-[var(--ff-text-secondary)] hover:text-[var(--ff-text-primary)]'
                  }`}
                  onClick={() => onModeChange('sign-up')}
                  type="button"
                >
                  {getCopy(copy.login.auth.signup, locale)}
                </button>
              </div>
            </header>

            <div className="mb-8 space-y-4">
              <button
                className="flex w-full items-center justify-center gap-3 border border-[var(--ff-border-default)] py-4 font-['JetBrains_Mono'] text-[12px] text-[var(--ff-text-secondary)] opacity-70"
                disabled
                type="button"
              >
                <WechatGlyph />
                <span>{getCopy(copy.login.auth.wechat, locale)}</span>
              </button>
              <button
                className="flex w-full items-center justify-center gap-3 border border-[var(--ff-border-default)] py-4 font-['JetBrains_Mono'] text-[12px] text-[var(--ff-text-secondary)] opacity-70"
                disabled
                type="button"
              >
                <GoogleGlyph />
                <span>{getCopy(copy.login.auth.google, locale)}</span>
              </button>
              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-grow bg-[var(--ff-border-default)]" />
                <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest text-[var(--ff-text-muted)]">
                  {dividerLabel}
                </span>
                <div className="h-px flex-grow bg-[var(--ff-border-default)]" />
              </div>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <DarkAuthFeedback feedback={feedback ?? (authError ? { tone: 'error', message: authError } : null)} />

              <div className="group space-y-1">
                <label
                  className="block font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-muted)] transition-colors group-focus-within:text-[var(--ff-accent-primary)]"
                  htmlFor="dark-email"
                >
                  {getCopy(copy.login.auth.emailLabel, locale)}
                </label>
                <input
                  autoComplete="email"
                  className="w-full border-b border-[var(--ff-border-default)] border-l-0 border-r-0 border-t-0 bg-transparent py-3 text-[var(--ff-text-primary)] outline-none transition-all placeholder:text-sm placeholder:text-[var(--ff-text-muted)] focus:border-[var(--ff-accent-primary)] focus:border-b-2"
                  id="dark-email"
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder={getCopy(copy.login.auth.emailPlaceholder, locale)}
                  required
                  type="email"
                  value={email}
                />
              </div>
              <div className="group space-y-1">
                <label
                  className="block font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-muted)] transition-colors group-focus-within:text-[var(--ff-accent-primary)]"
                  htmlFor="dark-key"
                >
                  {getCopy(copy.login.auth.passwordLabel, locale)}
                </label>
                <input
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full border-b border-[var(--ff-border-default)] border-l-0 border-r-0 border-t-0 bg-transparent py-3 text-[var(--ff-text-primary)] outline-none transition-all placeholder:text-sm placeholder:text-[var(--ff-text-muted)] focus:border-[var(--ff-accent-primary)] focus:border-b-2"
                  id="dark-key"
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder={getCopy(copy.login.auth.passwordPlaceholder, locale)}
                  required
                  type="password"
                  value={password}
                />
              </div>

              <div className="space-y-3 pt-3">
                <button
                  className="flex w-full items-center justify-between bg-[var(--ff-accent-primary)] px-8 py-5 font-['Inter_Tight'] font-bold text-[var(--ff-surface-base)] transition-all hover:bg-[var(--ff-text-primary)] hover:text-[var(--ff-surface-base)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  <span className="tracking-widest">{isSubmitting ? getCopy(copy.workspace.composer.processing, locale) : submitLabel}</span>
                  <span className="material-symbols-outlined">arrow_forward_ios</span>
                </button>
                <button
                  className="w-full border border-[var(--ff-border-default)] px-6 py-4 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.24em] text-[var(--ff-text-secondary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  onClick={onAnonymousLogin}
                  type="button"
                >
                  {getCopy(copy.login.auth.anonymous, locale)}
                </button>
                <div className="text-center text-[11px] italic leading-relaxed text-[var(--ff-text-secondary)]">
                  <Link className="underline underline-offset-4" to={PRIVACY_PAGE_HREF}>
                    {getCopy(copy.login.footer.fullPrivacy, locale)}
                  </Link>
                  <div className="mt-2">{privacySummary}</div>
                </div>
              </div>
            </form>

            <footer className="flex flex-col space-y-6 pt-8">
              <div className="relative h-16 w-full overflow-hidden">
                <img alt="Clinical report texture" className="h-full w-full object-cover grayscale opacity-30 contrast-150" src={REPORT_PLACEHOLDER} />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ff-surface-base)] to-transparent" />
              </div>
            </footer>
          </div>

          <div className="absolute bottom-10 right-10 flex flex-col items-center gap-4">
            <div className="flex flex-col gap-3">
              <button
                className="group flex items-center justify-center border border-[var(--ff-border-default)] p-3 text-[var(--ff-text-primary)] transition-none hover:bg-[var(--ff-surface-accent)]"
                onClick={onToggleTheme}
                type="button"
              >
                <span className="material-symbols-outlined group-hover:text-[var(--ff-accent-primary)]">dark_mode</span>
              </button>
              <LocaleToggle />
            </div>
            <div className="h-12 w-px bg-[var(--ff-border-default)]" />
          </div>

        </section>
      </main>

      <footer
        className="fixed bottom-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-t border-[var(--ff-border-default)] bg-[var(--ff-surface-base)] px-6"
      >
        <div className="flex items-center gap-8 font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest text-[var(--ff-text-muted)]">
          <span>{getCopy(copy.login.footer.copyrightDark, locale)}</span>
          <span>Clinical_Control_V1.4.2</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse bg-[var(--ff-accent-primary)]" />
            <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest text-[var(--ff-accent-primary)]">
              {getCopy(copy.login.footer.secureLink, locale)}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LightLoginView({
  authError,
  email,
  feedback,
  isSubmitting,
  mode,
  onAnonymousLogin,
  onEmailChange,
  onModeChange,
  onPasswordChange,
  onSubmit,
  onToggleTheme,
  password,
}: Omit<LoginPageViewProps, 'theme'>) {
  const { locale } = useLocale()
  const submitLabel =
    mode === 'login' ? getCopy(copy.login.auth.submitLoginLight, locale) : getCopy(copy.login.auth.submitSignup, locale)
  const privacySummary =
    locale === 'zh'
      ? PRIVACY_POLICY_SUMMARY
      : 'We respect your medical privacy and use your data only to provide secure clinical extraction services.'

  return (
    <div className="min-h-screen bg-[var(--ff-surface-base)] font-['Noto_Serif'] text-[var(--ff-text-primary)]">
      <LightMasthead />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 py-12 md:flex-row md:px-12">
        <section className="flex w-full flex-col gap-8 md:w-7/12">
          <div className="relative overflow-hidden border-2 border-[var(--ff-border-default)] bg-[var(--ff-surface-base)] p-8">
            <div className="absolute right-0 top-0 h-16 w-16 border-b-2 border-l-2 border-[var(--ff-border-default)]" />
            <h2 className="mb-8 font-['Playfair_Display'] text-5xl leading-[0.95] tracking-tight text-[var(--ff-text-primary)] md:text-7xl">
              {getCopy(copy.login.lightHero.titleLine1, locale)}
              <br />
              {getCopy(copy.login.lightHero.titleLine2, locale)}
            </h2>
            <div className="mb-8 h-2 w-24 bg-[var(--ff-border-default)]" />
            <p className="ff-light-drop-cap mb-8 text-justify text-xl leading-relaxed text-[var(--ff-text-primary)] md:text-2xl">
              {getCopy(copy.login.lightHero.body, locale)}
            </p>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="border border-[var(--ff-border-default)] bg-[var(--ff-surface-subtle)] p-4">
                <span className="mb-2 block font-['JetBrains_Mono'] text-xs">{getCopy(copy.login.lightHero.precisionTag, locale)}</span>
                <h4 className="font-['Newsreader'] text-lg font-bold">{getCopy(copy.login.lightHero.precisionTitle, locale)}</h4>
                <p className="mt-1 text-sm text-[var(--ff-text-subtle)]">
                  {getCopy(copy.login.lightHero.precisionBody, locale)}
                </p>
              </div>
              <div className="border border-[var(--ff-border-default)] bg-[var(--ff-surface-subtle)] p-4">
                <span className="mb-2 block font-['JetBrains_Mono'] text-xs">{getCopy(copy.login.lightHero.intelligenceTag, locale)}</span>
                <h4 className="font-['Newsreader'] text-lg font-bold">{getCopy(copy.login.lightHero.intelligenceTitle, locale)}</h4>
                <p className="mt-1 text-sm text-[var(--ff-text-subtle)]">
                  {getCopy(copy.login.lightHero.intelligenceBody, locale)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 font-['JetBrains_Mono'] text-xs uppercase">
            <span className="material-symbols-outlined text-base">verified</span>
            <span>{getCopy(copy.login.lightHero.certification, locale)}</span>
          </div>
        </section>

        <section className="w-full md:w-5/12">
          <div className="ff-light-ink-shadow border-2 border-[var(--ff-border-default)] bg-[var(--ff-surface-base)] p-8">
            <div className="mb-8">
              <div>
                <h3 className="font-['Playfair_Display'] text-3xl font-bold leading-tight">{getCopy(copy.login.auth.heading, locale)}</h3>
                <p className="mt-1 font-['JetBrains_Mono'] text-[10px] uppercase tracking-tight">
                  {getCopy(copy.login.auth.secureGateway, locale)}
                </p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 border border-[var(--ff-border-default)] p-1">
              <button
                className={`px-3 py-2 font-['Inter'] text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  mode === 'login'
                    ? 'bg-[var(--ff-text-primary)] text-[var(--ff-surface-base)]'
                    : 'text-[var(--ff-text-secondary)] hover:text-[var(--ff-text-primary)]'
                }`}
                onClick={() => onModeChange('login')}
                type="button"
              >
                {getCopy(copy.login.auth.login, locale)}
              </button>
              <button
                className={`px-3 py-2 font-['Inter'] text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  mode === 'sign-up'
                    ? 'bg-[var(--ff-text-primary)] text-[var(--ff-surface-base)]'
                    : 'text-[var(--ff-text-secondary)] hover:text-[var(--ff-text-primary)]'
                }`}
                onClick={() => onModeChange('sign-up')}
                type="button"
              >
                {getCopy(copy.login.auth.signup, locale)}
              </button>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <LightAuthFeedback feedback={feedback ?? (authError ? { tone: 'error', message: authError } : null)} />

              <div className="group">
                <label className="mb-1 block font-['Inter'] text-[10px] font-bold uppercase tracking-widest">
                  {getCopy(copy.login.auth.emailLabelLight, locale)}
                </label>
                <input
                  autoComplete="email"
                  className="w-full border-b-2 border-l-0 border-r-0 border-t-0 border-[var(--ff-border-default)] bg-transparent px-0 py-3 text-[var(--ff-text-primary)] outline-none placeholder:text-[color:color-mix(in_srgb,var(--ff-text-primary)_30%,transparent)]"
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder={getCopy(copy.login.auth.emailPlaceholderLight, locale)}
                  required
                  type="email"
                  value={email}
                />
              </div>
              <div className="group">
                <label className="mb-1 block font-['Inter'] text-[10px] font-bold uppercase tracking-widest">
                  {getCopy(copy.login.auth.passwordLabelLight, locale)}
                </label>
                <input
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full border-b-2 border-l-0 border-r-0 border-t-0 border-[var(--ff-border-default)] bg-transparent px-0 py-3 font-['JetBrains_Mono'] text-[var(--ff-text-primary)] outline-none placeholder:text-[color:color-mix(in_srgb,var(--ff-text-primary)_30%,transparent)]"
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder={getCopy(copy.login.auth.passwordPlaceholderLight, locale)}
                  required
                  type="password"
                  value={password}
                />
              </div>

              <button
                className="mt-6 w-full border-2 border-[var(--ff-border-default)] bg-[var(--ff-text-primary)] py-4 font-['Inter'] text-sm font-bold uppercase tracking-widest text-[var(--ff-surface-base)] transition-all hover:bg-[var(--ff-surface-base)] hover:text-[var(--ff-text-primary)] active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? getCopy(copy.workspace.composer.processing, locale) : submitLabel}
              </button>
            </form>

            <div className="relative my-10 flex items-center">
              <div className="flex-grow border-t border-[var(--ff-border-muted)]" />
              <span className="mx-4 flex-shrink font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest">
                {getCopy(copy.login.auth.thirdPartyAuth, locale)}
              </span>
              <div className="flex-grow border-t border-[var(--ff-border-muted)]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="group flex items-center justify-center gap-2 border border-[var(--ff-border-default)] py-3 font-['Inter'] font-medium text-[var(--ff-text-secondary)]"
                disabled
                type="button"
              >
                <img alt="WeChat" className="h-4 w-4 grayscale" src={WECHAT_ICON_URL} />
                <span className="text-xs uppercase tracking-tight">{getCopy(copy.login.auth.wechat, locale)}</span>
              </button>
              <button
                className="group flex items-center justify-center gap-2 border border-[var(--ff-border-default)] py-3 font-['Inter'] font-medium text-[var(--ff-text-secondary)]"
                disabled
                type="button"
              >
                <img alt="Google" className="h-4 w-4 grayscale" src={GOOGLE_ICON_URL} />
                <span className="text-xs uppercase tracking-tight">{getCopy(copy.login.auth.google, locale)}</span>
              </button>
            </div>

            <button
              className="mt-4 w-full border-2 border-[var(--ff-border-default)] px-6 py-4 font-['Inter'] text-sm font-bold uppercase tracking-[0.18em] text-[var(--ff-text-primary)] transition-colors hover:bg-[var(--ff-text-primary)] hover:text-[var(--ff-surface-base)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              onClick={onAnonymousLogin}
              type="button"
            >
              {getCopy(copy.login.auth.anonymous, locale)}
            </button>

            <div className="mt-12 border-t border-[var(--ff-border-muted)] pt-8">
              <p className="text-center text-[11px] italic leading-relaxed text-[var(--ff-text-secondary)]">
                {privacySummary}
              </p>
              <div className="mt-4 text-center text-[11px] uppercase tracking-[0.2em]">
                <Link className="underline underline-offset-4" to={PRIVACY_PAGE_HREF}>
                  {getCopy(copy.login.footer.fullPrivacy, locale)}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-between bg-[var(--ff-text-primary)] p-4 text-[var(--ff-surface-base)]">
              <span className="font-['JetBrains_Mono'] text-[10px]">{getCopy(copy.login.stats.uptime, locale)}</span>
              <span className="font-['Playfair_Display'] text-2xl font-bold">99.9%</span>
            </div>
            <div className="flex flex-col justify-between border border-[var(--ff-border-default)] bg-[var(--ff-surface-soft)] p-4">
              <span className="font-['JetBrains_Mono'] text-[10px]">{getCopy(copy.login.stats.usersOnline, locale)}</span>
              <span className="font-['Playfair_Display'] text-2xl font-bold">1.2K+</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto w-full px-6 py-8 md:px-12">
        <div className="mb-1 h-1 w-full bg-[var(--ff-border-default)]" />
        <div className="mb-4 h-px w-full bg-[var(--ff-border-default)]" />
        <div className="flex flex-col items-center justify-between font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-secondary)] md:flex-row">
          <span>{getCopy(copy.login.footer.copyrightLight, locale)}</span>
          <div className="mt-4 flex gap-8 md:mt-0">
            <Link className="underline underline-offset-4" to={PRIVACY_PAGE_HREF}>
              {getCopy(copy.login.footer.privacyPolicy, locale)}
            </Link>
            <a className="underline underline-offset-4" href="#">
              {getCopy(copy.login.footer.systemStatus, locale)}
            </a>
            <a className="underline underline-offset-4" href="#">
              {getCopy(copy.login.footer.supportCluster, locale)}
            </a>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-10 right-10 z-50 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-3">
          <button
            className="group flex items-center justify-center border-2 border-[var(--ff-border-default)] bg-[var(--ff-surface-base)] p-3 text-[var(--ff-text-primary)] shadow-[6px_6px_0_var(--ff-border-default)] transition-colors hover:bg-[var(--ff-surface-soft)] hover:text-[var(--ff-accent-primary)]"
            onClick={onToggleTheme}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">contrast</span>
          </button>
          <LocaleToggle />
        </div>
        <div className="h-12 w-px bg-[var(--ff-border-default)]" />
      </div>
    </div>
  )
}

export function LoginPageView(props: LoginPageViewProps) {
  return props.theme === 'dark' ? <DarkLoginView {...props} /> : <LightLoginView {...props} />
}
