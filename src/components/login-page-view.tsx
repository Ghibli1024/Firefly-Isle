/**
 * [INPUT]: 依赖 react 的表单事件类型，依赖 react-router-dom 的 Link，依赖 FireflyMark，依赖 @/lib/privacy 的隐私页路由与摘要真相源，依赖 public/login 的透明位图人体背景资产。
 * [OUTPUT]: 对外提供 LoginPageView 组件，以及 AuthMode / AuthFeedback / LoginPageViewProps 类型。
 * [POS]: components 的登录页展示层，按 V3 全视口双面板复刻品牌入口、位图人体背景与身份访问控制台，不触碰 Supabase 认证状态机。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { FireflyMark } from '@/components/system/firefly-mark'
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'
import { PRIVACY_PAGE_HREF, PRIVACY_POLICY_SUMMARY } from '@/lib/privacy'
import type { Theme } from '@/lib/theme'

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

type V3LoginProps = Omit<LoginPageViewProps, 'theme'> & {
  theme: Theme
}

type Capability = {
  body: string
  icon: string
  title: string
}

const loginAnatomyAssets: Record<Theme, string> = {
  dark: '/login/anatomy-dark.png',
  light: '/login/anatomy-light.png',
}

function getCapabilities(locale: 'zh' | 'en'): Capability[] {
  if (locale === 'en') {
    return [
      {
        body: 'Extract critical clinical facts from unstructured history and generate normalized medical data.',
        icon: 'layers',
        title: 'Structured Extraction',
      },
      {
        body: 'Detect therapy stages and event order to build a clear treatment timeline.',
        icon: 'timeline',
        title: 'Timeline Reasoning',
      },
      {
        body: 'End-to-end encryption and tiered access control protect sensitive records in transit and at rest.',
        icon: 'enhanced_encryption',
        title: 'Clinical Data Guard',
      },
      {
        body: 'Preserve extraction history and field changes for auditable clinical review.',
        icon: 'assignment_turned_in',
        title: 'Auditable Trace',
      },
    ]
  }

  return [
    {
      body: '利用先进的语义理解与临床知识，从非结构化文本中提取关键临床信息，生成标准化数据。',
      icon: 'layers',
      title: '结构化提取',
    },
    {
      body: '自动识别治疗阶段与事件顺序，构建清晰的治疗时间线，支持多线治疗与疗效评估。',
      icon: 'timeline',
      title: '时间线推理',
    },
    {
      body: '端到端加密与分级权限控制，确保敏感医疗数据在采集、传输与存储全链路安全。',
      icon: 'enhanced_encryption',
      title: '临床数据保护',
    },
    {
      body: '完整记录提取过程与变更历史，支持可追溯的审计与合规要求，满足临床研究与监管需求。',
      icon: 'assignment_turned_in',
      title: '可审计追溯',
    },
  ]
}

function feedbackClass(feedback: AuthFeedback) {
  if (feedback.tone === 'error') {
    return 'border-[var(--ff-accent-primary)] text-[var(--ff-accent-primary)]'
  }

  if (feedback.tone === 'success') {
    return 'border-[var(--ff-accent-success)] text-[var(--ff-accent-success)]'
  }

  return 'border-[var(--ff-border-default)] text-[var(--ff-text-secondary)]'
}

function AuthFeedbackBlock({ feedback }: { feedback: AuthFeedback | null }) {
  if (!feedback) {
    return null
  }

  return (
    <div className={`rounded-[var(--ff-radius-md)] border px-4 py-3 text-sm ${feedbackClass(feedback)}`}>
      {feedback.message}
    </div>
  )
}

function CapabilityCard({ body, icon, title }: Capability) {
  return (
    <article className="min-h-[170px] rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[color:color-mix(in_srgb,var(--ff-surface-panel)_76%,transparent)] p-6">
      <span className="material-symbols-outlined mb-5 text-[42px] text-[var(--ff-accent-primary)]">{icon}</span>
      <h3 className="text-xl font-bold text-[var(--ff-text-primary)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--ff-text-secondary)]">{body}</p>
    </article>
  )
}

function LoginAnatomyBackdrop({ dark }: { dark: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute z-0 hidden max-w-none select-none xl:block',
        'right-[clamp(1.5rem,4vw,5.5rem)] top-[clamp(5rem,11vh,7rem)] w-[clamp(180px,17vw,370px)]',
        dark
          ? 'opacity-[0.58]'
          : 'opacity-[0.52]',
      ].join(' ')}
    >
      <img
        alt=""
        className="h-auto w-full max-w-none object-contain"
        data-testid="login-anatomy-backdrop"
        draggable={false}
        src={loginAnatomyAssets[dark ? 'dark' : 'light']}
      />
    </div>
  )
}

function WechatGlyph() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" viewBox="0 0 32 32">
      <circle cx="13" cy="13" fill="var(--ff-accent-success)" r="9" />
      <circle cx="20" cy="19" fill="var(--ff-accent-success)" r="8" opacity="0.92" />
      <circle cx="10" cy="11" fill="white" r="1.3" />
      <circle cx="15" cy="11" fill="white" r="1.3" />
      <circle cx="18" cy="17" fill="white" r="1.1" />
      <circle cx="22" cy="17" fill="white" r="1.1" />
      <path d="M8.5 20.8 7 24l4-1.9" fill="var(--ff-accent-success)" />
      <path d="M24.1 24.3 25.7 28l-4.3-2" fill="var(--ff-accent-success)" opacity="0.92" />
    </svg>
  )
}

function GoogleGlyph() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" viewBox="0 0 32 32">
      <path d="M28.8 16.3c0-1-.1-1.8-.3-2.6H16.3v5h7c-.3 1.6-1.2 3-2.6 3.9v3.2h4.2c2.4-2.3 3.9-5.6 3.9-9.5Z" fill="#4285F4" />
      <path d="M16.3 29c3.5 0 6.4-1.1 8.6-3.2l-4.2-3.2c-1.2.8-2.6 1.2-4.4 1.2-3.4 0-6.2-2.3-7.2-5.4H4.8v3.3C6.9 26 11.2 29 16.3 29Z" fill="#34A853" />
      <path d="M9.1 18.4a8.1 8.1 0 0 1 0-5.1V10H4.8a13 13 0 0 0 0 11.7l4.3-3.3Z" fill="#FBBC05" />
      <path d="M16.3 8c1.9 0 3.6.7 4.9 2l3.8-3.7A12.7 12.7 0 0 0 16.3 3C11.2 3 6.9 6 4.8 10l4.3 3.3c1-3 3.8-5.3 7.2-5.3Z" fill="#EA4335" />
    </svg>
  )
}

function SocialButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      className="flex h-[61px] w-full items-center justify-center gap-4 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] text-lg font-semibold text-[var(--ff-text-primary)] opacity-90"
      disabled
      type="button"
    >
      <span className="flex w-8 shrink-0 items-center justify-center">{icon === 'wechat' ? <WechatGlyph /> : <GoogleGlyph />}</span>
      <span className="min-w-[8em] text-left leading-none">{label}</span>
    </button>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-[var(--ff-border-default)]" />
      <span className="text-sm text-[var(--ff-text-muted)]">{label}</span>
      <div className="h-px flex-1 bg-[var(--ff-border-default)]" />
    </div>
  )
}

function V3LoginView({
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
  theme,
}: V3LoginProps) {
  const { locale, toggleLocale } = useLocale()
  const isDark = theme === 'dark'
  const capabilities = getCapabilities(locale)
  const submitLabel =
    mode === 'login' ? getCopy(copy.login.auth.submitLoginLight, locale) : getCopy(copy.login.auth.submitSignup, locale)
  const dividerLabel =
    mode === 'login' ? getCopy(copy.login.auth.dividerLogin, locale) : getCopy(copy.login.auth.dividerSignup, locale)
  const currentFeedback = feedback ?? (authError ? { message: authError, tone: 'error' as const } : null)
  const privacySummary =
    locale === 'zh'
      ? PRIVACY_POLICY_SUMMARY
      : 'By continuing, you agree to the privacy policy. Clinical text is used only for structured processing.'

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[var(--ff-surface-base)] px-4 py-4 font-['Inter'] text-[var(--ff-text-primary)] md:px-6 md:py-6">
      <main className="grid min-h-[calc(100dvh-32px)] w-full gap-5 md:min-h-[calc(100dvh-48px)] xl:grid-cols-[minmax(0,1fr)_minmax(420px,680px)]">
        <section className="relative min-w-0 overflow-hidden rounded-[var(--ff-radius-lg)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-8 md:p-12">
          <LoginAnatomyBackdrop dark={isDark} />
          <div className="relative z-10 flex min-h-full flex-col">
            <div className="flex flex-col justify-between gap-6 md:flex-row">
              <div className="flex min-w-0 items-center gap-5">
                <FireflyMark />
                <div className="min-w-0">
                  <div className="text-4xl font-bold tracking-normal md:text-5xl">{getCopy(copy.shell.brand.lightTitle, locale)}</div>
                  <div className="mt-2 text-xl text-[var(--ff-text-secondary)]">{getCopy(copy.shell.brand.lightSubtitle, locale)}</div>
                </div>
              </div>
            </div>

            <div className="mt-16 max-w-4xl md:mt-24">
              <h1 className="max-w-4xl break-words text-[2.125rem] font-bold leading-[1.06] tracking-normal md:text-[4rem]">
                {locale === 'zh' ? (
                  <>
                    <span className="md:hidden">
                      临床治疗
                      <br />
                      时间线工作台
                    </span>
                    <span className="hidden md:inline">临床治疗时间线工作台</span>
                  </>
                ) : (
                  'Clinical Treatment Timeline Workspace'
                )}
              </h1>
              <div className="mt-8 h-1 w-16 bg-[var(--ff-accent-primary)]" />
              <p className="mt-7 max-w-3xl text-xl leading-9 text-[var(--ff-text-secondary)]">
                {locale === 'zh'
                  ? '把复杂治疗史整理为可追溯的结构化病历。'
                  : 'Transform complex treatment history into an auditable structured clinical record.'}
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {capabilities.map((capability) => (
                <CapabilityCard key={capability.title} {...capability} />
              ))}
            </div>

            <div className="mt-auto pt-10">
              <div className="flex min-h-24 flex-col gap-4 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <span className="text-base text-[var(--ff-text-secondary)]">{locale === 'zh' ? '系统运行状态' : 'System Runtime Status'}</span>
                <div className="hidden h-12 w-px bg-[var(--ff-border-default)] lg:block" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:gap-5">
                  <div className="flex items-center gap-4 whitespace-nowrap font-['JetBrains_Mono'] text-xl tracking-[0.08em] text-[var(--ff-accent-success)]">
                    <span className="h-4 w-4 rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-success)]" />
                    OPERATIONAL
                  </div>
                  <div className="flex items-center gap-3 whitespace-nowrap text-base text-[var(--ff-text-secondary)]">
                    <span className="material-symbols-outlined text-[var(--ff-accent-success)]">verified_user</span>
                    {locale === 'zh' ? '安全通道已建立' : 'Secure channel established'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-[var(--ff-radius-lg)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-panel)] p-8 md:p-10">
          <div className="mx-auto flex h-full max-w-[520px] flex-col justify-center">
            <h2 className="text-4xl font-bold tracking-normal md:text-5xl">{getCopy(copy.login.auth.heading, locale)}</h2>

            <div className="mt-8 grid grid-cols-2 border border-[var(--ff-border-default)]">
              <button
                className={[
                  'h-14 text-lg font-semibold transition-colors',
                  mode === 'login'
                    ? 'border-b-2 border-[var(--ff-accent-primary)] text-[var(--ff-accent-primary)]'
                    : 'text-[var(--ff-text-secondary)] hover:text-[var(--ff-text-primary)]',
                ].join(' ')}
                onClick={() => onModeChange('login')}
                type="button"
              >
                {getCopy(copy.login.auth.login, locale)}
              </button>
              <button
                className={[
                  'h-14 text-lg font-semibold transition-colors',
                  mode === 'sign-up'
                    ? 'border-b-2 border-[var(--ff-accent-primary)] text-[var(--ff-accent-primary)]'
                    : 'text-[var(--ff-text-secondary)] hover:text-[var(--ff-text-primary)]',
                ].join(' ')}
                onClick={() => onModeChange('sign-up')}
                type="button"
              >
                {getCopy(copy.login.auth.signup, locale)}
              </button>
            </div>

            <div className="mt-7 space-y-4">
              <SocialButton icon="wechat" label={getCopy(copy.login.auth.wechat, locale)} />
              <SocialButton icon="google" label={getCopy(copy.login.auth.google, locale)} />
            </div>

            <div className="my-8">
              <Divider label={dividerLabel} />
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <AuthFeedbackBlock feedback={currentFeedback} />

              <div>
                <label className="mb-3 block text-base text-[var(--ff-text-primary)]" htmlFor="login-email">
                  {getCopy(copy.login.auth.emailLabelLight, locale)}
                </label>
                <input
                  autoComplete="email"
                  className="h-14 w-full rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 text-base text-[var(--ff-text-primary)] outline-none placeholder:text-[var(--ff-text-muted)] focus:border-[var(--ff-accent-primary)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--ff-accent-primary)_16%,transparent)]"
                  id="login-email"
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder={getCopy(copy.login.auth.emailPlaceholderLight, locale)}
                  required
                  type="email"
                  value={email}
                />
              </div>

              <div>
                <label className="mb-3 block text-base text-[var(--ff-text-primary)]" htmlFor="login-password">
                  {locale === 'zh' ? '密码 / 加密密钥' : 'Password / Encryption Key'}
                </label>
                <div className="relative">
                  <input
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="h-14 w-full rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] px-5 pr-14 text-base text-[var(--ff-text-primary)] outline-none placeholder:text-[var(--ff-text-muted)] focus:border-[var(--ff-accent-primary)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--ff-accent-primary)_16%,transparent)]"
                    id="login-password"
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder={getCopy(copy.login.auth.passwordPlaceholder, locale)}
                    required
                    type="password"
                    value={password}
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ff-text-muted)]">
                    visibility
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-3 text-[var(--ff-text-primary)]">
                  <input className="h-5 w-5 accent-[var(--ff-accent-primary)]" type="checkbox" />
                  {locale === 'zh' ? '记住我' : 'Remember me'}
                </label>
                <a className="text-[var(--ff-accent-primary)]" href="#">
                  {locale === 'zh' ? '忘记密码?' : 'Forgot password?'}
                </a>
              </div>

              <button
                className="flex h-16 w-full items-center justify-center gap-4 rounded-[var(--ff-radius-md)] bg-[var(--ff-accent-primary)] text-xl font-bold text-white transition-colors hover:bg-[var(--ff-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                <span className="material-symbols-outlined">my_location</span>
                {isSubmitting ? getCopy(copy.workspace.composer.processing, locale) : submitLabel}
              </button>

              <button
                className="flex h-16 w-full items-center justify-center gap-4 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] text-lg font-semibold text-[var(--ff-text-primary)] transition-colors hover:border-[var(--ff-accent-primary)] hover:text-[var(--ff-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                onClick={onAnonymousLogin}
                type="button"
              >
                <span className="material-symbols-outlined">person_add</span>
                {getCopy(copy.login.auth.anonymous, locale)}
              </button>
            </form>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                className="flex h-14 items-center justify-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] text-base"
                onClick={onToggleTheme}
                type="button"
              >
                <span className="material-symbols-outlined">{isDark ? 'dark_mode' : 'light_mode'}</span>
                {isDark ? getCopy(copy.themeToggle.dark, locale) : getCopy(copy.themeToggle.light, locale)}
              </button>
              <button
                className="flex h-14 items-center justify-center gap-3 rounded-[var(--ff-radius-md)] border border-[var(--ff-border-default)] bg-[var(--ff-surface-inset)] text-base"
                onClick={toggleLocale}
                type="button"
              >
                <span className="material-symbols-outlined">language</span>
                {getCopy(copy.localeToggle[locale], locale)}
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </button>
            </div>

            <p className="mt-6 text-center text-sm leading-7 text-[var(--ff-text-muted)]">
              <span className="material-symbols-outlined mr-2 inline text-base align-[-3px]">security</span>
              {privacySummary}
              {' '}
              <Link className="underline underline-offset-4" to={PRIVACY_PAGE_HREF}>
                {getCopy(copy.login.footer.fullPrivacy, locale)}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export function LoginPageView(props: LoginPageViewProps) {
  return <V3LoginView {...props} />
}
