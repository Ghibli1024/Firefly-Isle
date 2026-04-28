/**
 * [INPUT]: 依赖 react 的表单事件类型，依赖 react-router-dom 的 Link，依赖 FireflyMark，依赖 @/lib/privacy 的隐私页路由与摘要真相源，依赖 public/login 的透明位图人体背景资产与夜航岛屿登录场景资产。
 * [OUTPUT]: 对外提供 LoginPageView 组件，以及 AuthMode / AuthFeedback / LoginPageViewProps 类型。
 * [POS]: components 的登录页展示层，保留 V3 全视口双面板品牌入口，只把右侧身份访问面板复刻为 D 夜航岛屿登录入口与单纯登录按钮，不触碰 Supabase 认证状态机。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { type FormEvent, type ReactNode } from 'react'
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

const nightIslandAuthScene = '/login/night-island-auth-scene.png'

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
    <div className={`rounded-[var(--ff-radius-md)] border bg-black/20 px-4 py-3 text-sm ${feedbackClass(feedback)}`}>
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

function AuthBeaconPreview({ locale }: { locale: 'zh' | 'en' }) {
  return (
    <div className="relative min-h-[335px] overflow-hidden rounded-t-[28px] bg-[#050b0e] md:min-h-[360px]">
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center opacity-95"
        draggable={false}
        src={nightIslandAuthScene}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_29%,rgba(244,240,232,0.12),transparent_18%),linear-gradient(180deg,rgba(5,9,11,0.72)_0%,rgba(5,9,11,0.08)_34%,rgba(5,9,11,0.12)_58%,rgba(5,9,11,0.94)_100%)]" />
      <div className="absolute inset-x-0 bottom-8 px-6 text-center md:bottom-10">
        <h2 className="text-[2.45rem] font-black leading-none tracking-normal text-[#f4f0e8] drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] md:text-[2.75rem]">
          {locale === 'zh' ? '身份访问' : 'Identity Access'}
        </h2>
        <p className="mt-4 text-sm font-semibold text-white/54">
          {locale === 'zh' ? '在安全的光下，开始您的旅程' : 'Begin under a secure clinical beacon'}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,rgba(5,11,14,0),#050b0e)]" />
    </div>
  )
}

function SocialButton({ icon, label, subLabel }: { icon: string; label: string; subLabel: string }) {
  return (
    <button
      className="flex h-[72px] min-w-0 flex-1 items-center justify-center gap-4 rounded-[10px] border border-[#353b3b] bg-[rgba(255,255,255,0.035)] text-base font-semibold text-[#d9d1c4] shadow-[inset_0_0_22px_rgba(255,255,255,0.018)] transition-colors hover:border-[#6c665c] hover:bg-white/[0.055] disabled:cursor-not-allowed"
      disabled
      type="button"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#b8ae9e] drop-shadow-[0_0_12px_rgba(184,174,158,0.16)]">
        {icon === 'wechat' ? <WechatWarmGlyph /> : <GoogleWarmGlyph />}
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="text-[17px] font-semibold text-[#d8d0c4]">{label}</span>
        <span className="mt-2 text-xs font-semibold text-[#8b867f]">{subLabel}</span>
      </span>
    </button>
  )
}

function WechatWarmGlyph() {
  return (
    <svg aria-hidden="true" className="h-9 w-9" fill="none" viewBox="0 0 36 36">
      <path
        d="M17.3 9.4c-6.3 0-11.4 3.9-11.4 8.8 0 2.8 1.7 5.3 4.3 6.9l-.9 3.5 4.2-1.9c1.2.3 2.5.4 3.8.4 6.3 0 11.4-3.9 11.4-8.9s-5.1-8.8-11.4-8.8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M20.5 25.9c1.1.5 2.5.7 3.9.7.9 0 1.8-.1 2.6-.3l3.6 1.6-.8-3c2.2-1.3 3.6-3.4 3.6-5.7 0-3.5-3.2-6.5-7.6-7.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <circle cx="13.5" cy="17.8" fill="currentColor" r="1.45" />
      <circle cx="18.8" cy="17.8" fill="currentColor" r="1.45" />
      <circle cx="24" cy="18.8" fill="currentColor" r="1.25" />
    </svg>
  )
}

function GoogleWarmGlyph() {
  return (
    <svg aria-hidden="true" className="h-9 w-9" viewBox="0 0 36 36">
      <text
        dominantBaseline="central"
        fill="currentColor"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="29"
        fontWeight="800"
        textAnchor="middle"
        x="18"
        y="18.8"
      >
        G
      </text>
    </svg>
  )
}

function CredentialField({
  children,
  icon,
  label,
  trailing,
}: {
  children: ReactNode
  icon: string
  label: string
  trailing?: ReactNode
}) {
  return (
    <label className="block rounded-[14px] border border-white/12 bg-black/16 px-4 py-3 transition-colors focus-within:border-[var(--ff-accent-primary)]/48">
      <span className="mb-2 block text-xs font-semibold text-white/48">{label}</span>
      <span className="flex min-h-10 items-center gap-4">
        <span className="material-symbols-outlined text-[20px] text-white/56">{icon}</span>
        {children}
        {trailing}
      </span>
    </label>
  )
}

function LoginSubmitButton({
  isSubmitting,
  label,
}: {
  isSubmitting: boolean
  label: string
}) {
  return (
    <button
      className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-[14px] bg-[var(--ff-accent-primary)] px-5 text-base font-bold text-white shadow-[0_16px_34px_rgba(232,93,42,0.22)] transition-colors hover:bg-[var(--ff-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      data-testid="login-submit-button"
      disabled={isSubmitting}
      type="submit"
    >
      <span>{label}</span>
    </button>
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
  const primaryActionLabel = mode === 'login' ? getCopy(copy.login.auth.login, locale) : submitLabel
  const loginButtonLabel = isSubmitting ? getCopy(copy.workspace.composer.processing, locale) : primaryActionLabel
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

        <section className="flex min-w-0 items-center justify-center p-0 md:px-6">
          <div className="mx-auto flex h-full w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] border border-white/14 bg-[#050b0e] text-[#f4f0e8] shadow-[0_26px_72px_rgba(0,0,0,0.42)]">
            <AuthBeaconPreview locale={locale} />
            <div className="px-6 pb-6 pt-4 md:px-7 md:pb-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold text-white/48">{locale === 'zh' ? '一键登录' : 'One-tap sign in'}</p>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <button
                    className={mode === 'login' ? 'text-[var(--ff-accent-primary)]' : 'text-white/40 hover:text-white/72'}
                    onClick={() => onModeChange('login')}
                    type="button"
                  >
                    {getCopy(copy.login.auth.login, locale)}
                  </button>
                  <span className="h-3 w-px bg-white/14" />
                  <button
                    className={mode === 'sign-up' ? 'text-[var(--ff-accent-primary)]' : 'text-white/40 hover:text-white/72'}
                    onClick={() => onModeChange('sign-up')}
                    type="button"
                  >
                    {getCopy(copy.login.auth.signup, locale)}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex gap-3">
                <SocialButton
                  icon="wechat"
                  label={getCopy(copy.login.auth.wechat, locale)}
                  subLabel={locale === 'zh' ? '快捷登录' : 'Quick sign in'}
                />
                <SocialButton
                  icon="google"
                  label={getCopy(copy.login.auth.google, locale)}
                  subLabel={locale === 'zh' ? '快捷登录' : 'Quick sign in'}
                />
              </div>

              <form className="mt-3 space-y-4" onSubmit={onSubmit}>
                <AuthFeedbackBlock feedback={currentFeedback} />

                <CredentialField icon="mail" label={locale === 'zh' ? '邮箱' : 'Email'}>
                  <span className="sr-only">{getCopy(copy.login.auth.emailLabelLight, locale)}</span>
                  <input
                    autoComplete="email"
                    className="min-w-0 flex-1 bg-transparent text-sm text-[#f4f0e8] outline-none placeholder:text-white/40"
                    id="login-email"
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder={getCopy(copy.login.auth.emailPlaceholderLight, locale)}
                    required
                    type="email"
                    value={email}
                  />
                </CredentialField>

                <CredentialField
                  icon="key"
                  label={locale === 'zh' ? '密码' : 'Password'}
                  trailing={<span className="material-symbols-outlined text-[20px] text-white/56">visibility</span>}
                >
                  <span className="sr-only">{locale === 'zh' ? '密码 / 加密密钥' : 'Password / Encryption Key'}</span>
                  <input
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="min-w-0 flex-1 bg-transparent text-sm text-[#f4f0e8] outline-none placeholder:text-white/40"
                    id="login-password"
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder={locale === 'zh' ? '访问密钥（256 位加密）' : 'Access key (256-bit encrypted)'}
                    required
                    type="password"
                    value={password}
                  />
                </CredentialField>

                <LoginSubmitButton isSubmitting={isSubmitting} label={loginButtonLabel} />

                <button
                  className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.035] text-sm font-semibold text-white/70 transition-colors hover:border-white/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  onClick={onAnonymousLogin}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">lock_open</span>
                  <span>{locale === 'zh' ? '匿名会话' : 'Anonymous session'}</span>
                  <span className="text-xs font-medium text-white/40">{locale === 'zh' ? '无需登录，直接使用' : 'Use directly without login'}</span>
                </button>
              </form>

              <p className="mt-4 rounded-[var(--ff-radius-full)] bg-white/[0.045] px-4 py-3 text-center text-xs leading-6 text-white/52">
                <span className="material-symbols-outlined mr-2 inline text-base align-[-3px]">verified_user</span>
                {privacySummary}
                {' '}
                <Link className="text-white/78 underline underline-offset-4" to={PRIVACY_PAGE_HREF}>
                  {getCopy(copy.login.footer.fullPrivacy, locale)}
                </Link>
              </p>

              <div className="mt-3 flex items-center justify-center gap-3 text-xs text-white/44">
                <button className="inline-flex items-center gap-1.5 hover:text-white/72" onClick={onToggleTheme} type="button">
                  <span className="material-symbols-outlined text-base">{isDark ? 'dark_mode' : 'light_mode'}</span>
                  {isDark ? getCopy(copy.themeToggle.dark, locale) : getCopy(copy.themeToggle.light, locale)}
                </button>
                <span className="h-3 w-px bg-white/14" />
                <button className="inline-flex items-center gap-1.5 hover:text-white/72" onClick={toggleLocale} type="button">
                  <span className="material-symbols-outlined text-base">language</span>
                  {getCopy(copy.localeToggle[locale], locale)}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export function LoginPageView(props: LoginPageViewProps) {
  return <V3LoginView {...props} />
}
