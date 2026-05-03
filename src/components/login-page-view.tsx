/**
 * [INPUT]: 依赖 react 的表单事件类型、Effect、Ref 与本地弹层状态，依赖 react-router-dom 的 Link，依赖 BackgroundMusicToggle、FireflyMark、LoginTraceMap，依赖 @/lib/privacy 的隐私页路由与摘要真相源，依赖 public/login 的双主题 intro 背景、亮色花路灯塔卡片背景与夜航灯塔路径登录卡场景资产，依赖 transitions-dev.css 的 .t-modal 动效合同。
 * [OUTPUT]: 对外提供 LoginPageView 组件，以及 AuthMode / AuthFeedback / LoginPageViewProps 类型。
 * [POS]: components 的登录页展示层，负责明暗主题全屏 intro、右下角主题/语言/音乐工具区、CTA 驱动的统一登录弹层、邮箱表单、手机/微信敬请期待占位、Google/匿名入口，不触碰 Supabase 认证状态机。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { type FormEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { BackgroundMusicToggle } from '@/components/background-music-toggle'
import { LoginTraceMap } from '@/components/login-trace-map'
import { FireflyMark } from '@/components/system/firefly-mark'
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'
import { PRIVACY_PAGE_HREF, PRIVACY_POLICY_SUMMARY } from '@/lib/privacy'
import type { Theme } from '@/lib/theme'

export type AuthMode = 'login' | 'sign-up' | 'password-reset'
export type AuthMethod = 'email' | 'phone'
export type FeedbackTone = 'error' | 'success' | 'neutral'

export type AuthFeedback = {
  tone: FeedbackTone
  message: string
}

export type LoginPageViewProps = {
  authMethod: AuthMethod
  authError?: string | null
  defaultAuthOpen?: boolean
  email: string
  feedback: AuthFeedback | null
  isSubmitting: boolean
  mode: AuthMode
  onAnonymousLogin: () => void
  onAuthMethodChange: (method: AuthMethod) => void
  onEmailChange: (value: string) => void
  onGoogleLogin: () => void
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

const nightIslandAuthScene = '/login/night-island-auth-scene.png'
const lightAuthScene = '/login/light-auth-flower-path.png'

type LoginThemeSkin = {
  bodyCopy: string
  brandSubtitle: string
  brandTitle: string
  heading: string
  root: string
  section: string
  security: string
  utilityButton: string
  utilityDivider: string
  utilityShell: string
}

const loginThemeSkins: Record<Theme, LoginThemeSkin> = {
  dark: {
    bodyCopy: 'text-white/62',
    brandSubtitle: 'text-white/58',
    brandTitle: 'text-[#f4f0e8] drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]',
    heading: 'text-[#f4f0e8] drop-shadow-[0_5px_22px_rgba(0,0,0,0.68)]',
    root: 'bg-[#02080a] text-[#f4f0e8]',
    section: 'bg-[#03090b]',
    security: 'text-white/58',
    utilityButton: 'hover:text-[#f4f0e8]',
    utilityDivider: 'bg-white/12',
    utilityShell: 'border-white/10 bg-white/[0.055] text-white/62 shadow-[inset_0_0_24px_rgba(255,255,255,0.035)]',
  },
  light: {
    bodyCopy: 'text-[#455c58]',
    brandSubtitle: 'text-[#516461]',
    brandTitle: 'text-[#172522] drop-shadow-[0_2px_16px_rgba(255,255,255,0.78)]',
    heading: 'text-[#172522] drop-shadow-[0_2px_18px_rgba(255,255,255,0.82)]',
    root: 'bg-[#f7fbfb] text-[#15201f]',
    section: 'bg-[#f7fbfb]',
    security: 'text-[#425754]/72',
    utilityButton: 'hover:text-[#142421]',
    utilityDivider: 'bg-[#8eaeb2]/32',
    utilityShell: 'border-[#a9c3c5]/50 bg-white/72 text-[#4a5f5c] shadow-[0_16px_42px_rgba(107,132,137,0.16)]',
  },
}

type AuthCardSkin = {
  anonymousButton: string
  anonymousSubLabel: string
  body: string
  card: string
  closeButton: string
  divider: string
  dividerText: string
  field: string
  fieldIcon: string
  fieldInput: string
  fieldLabel: string
  feedbackNeutral: string
  feedbackSurface: string
  forgotLink: string
  hero: string
  heroGradient: string
  heroImage: string
  heroSubtitle: string
  heroTitle: string
  modeButton: string
  modeHint: string
  privacy: string
  privacyLink: string
  socialButton: string
  socialIcon: string
  socialLabel: string
  surface: string
  trailingIcon: string
}

const authCardSkins: Record<Theme, AuthCardSkin> = {
  dark: {
    anonymousButton: 'border-white/10 bg-white/[0.035] text-white/70 hover:border-white/18 hover:text-white',
    anonymousSubLabel: 'text-white/40',
    body: 'bg-[linear-gradient(180deg,rgba(8,13,15,0.92),rgba(6,10,12,0.96))]',
    card: 'border-white/14 bg-[#050b0e]/90 text-[#f4f0e8] shadow-[0_30px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl',
    closeButton: 'border-white/12 bg-black/24 text-white/66 hover:text-white',
    divider: 'bg-white/14',
    dividerText: 'text-white/44',
    feedbackNeutral: 'border-[var(--ff-border-default)] text-[var(--ff-text-secondary)]',
    feedbackSurface: 'bg-black/20',
    field: 'border-white/12 bg-[rgba(255,255,255,0.045)] focus-within:border-[var(--ff-accent-primary)]/52 focus-within:bg-[rgba(255,255,255,0.065)]',
    fieldIcon: 'text-white/56',
    fieldInput: 'text-[#f4f0e8] placeholder:text-white/40',
    fieldLabel: 'text-white/48',
    forgotLink: 'text-white/70 hover:text-white',
    hero: 'bg-[#050b0e]',
    heroGradient: 'bg-[radial-gradient(circle_at_68%_22%,rgba(255,169,77,0.16),transparent_20%),linear-gradient(180deg,rgba(5,9,11,0.30)_0%,rgba(5,9,11,0.02)_38%,rgba(5,9,11,0.35)_68%,rgba(5,9,11,0.96)_100%)]',
    heroImage: 'opacity-95',
    heroSubtitle: 'text-white/54',
    heroTitle: 'text-[#f4f0e8] drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)]',
    modeButton: 'text-white/76 hover:text-white',
    modeHint: 'text-white/42',
    privacy: 'bg-white/[0.045] text-white/52',
    privacyLink: 'text-white/78',
    socialButton: 'border-[#353b3b] bg-[rgba(255,255,255,0.035)] text-[#d9d1c4] shadow-[inset_0_0_22px_rgba(255,255,255,0.018)] hover:border-[#6c665c] hover:bg-white/[0.055]',
    socialIcon: 'bg-white shadow-[0_0_18px_rgba(255,255,255,0.08)]',
    socialLabel: 'text-[#d8d0c4]',
    surface: 'bg-[linear-gradient(180deg,rgba(5,11,14,0),#050b0e)]',
    trailingIcon: 'text-white/56',
  },
  light: {
    anonymousButton: 'border-[#ccdadd] bg-white/76 text-[#4e625f] hover:border-[var(--ff-accent-primary)]/38 hover:text-[#172522]',
    anonymousSubLabel: 'text-[#81908d]',
    body: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.98))]',
    card: 'border-[#cbdcde] bg-white/92 text-[#172522] shadow-[0_30px_72px_rgba(98,124,129,0.22)]',
    closeButton: 'border-[#b6cacc]/70 bg-white/82 text-[#536865] shadow-[0_12px_26px_rgba(98,124,129,0.16)] hover:text-[#172522]',
    divider: 'bg-[#c8d8da]',
    dividerText: 'text-[#839592]',
    feedbackNeutral: 'border-[#cbdcde] text-[#526866]',
    feedbackSurface: 'bg-[#f7fbfb]',
    field: 'border-[#d5e2e3] bg-[#f8fbfb] focus-within:border-[var(--ff-accent-primary)]/52',
    fieldIcon: 'text-[#657b78]',
    fieldInput: 'text-[#172522] placeholder:text-[#8b9d9a]',
    fieldLabel: 'text-[#647a77]',
    forgotLink: 'text-[#516864] hover:text-[#172522]',
    hero: 'bg-[#eef7f7]',
    heroGradient: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.06)_42%,rgba(255,255,255,0.56)_70%,rgba(255,255,255,0.98)_100%)]',
    heroImage: 'opacity-82',
    heroSubtitle: 'text-[#647a77]',
    heroTitle: 'text-[#172522] drop-shadow-[0_2px_18px_rgba(255,255,255,0.86)]',
    modeButton: 'text-[#304a45] hover:text-[#172522]',
    modeHint: 'text-[#7b8f8c]',
    privacy: 'bg-[#f2f8f8] text-[#5d7471]',
    privacyLink: 'text-[#172522]',
    socialButton: 'border-[#d1dfe0] bg-white/82 text-[#334844] shadow-[0_12px_24px_rgba(98,124,129,0.08)] hover:border-[var(--ff-accent-primary)]/35 hover:bg-[#fffaf7]',
    socialIcon: 'bg-white shadow-[0_8px_18px_rgba(98,124,129,0.12)]',
    socialLabel: 'text-[#223530]',
    surface: 'bg-[linear-gradient(180deg,rgba(255,255,255,0),#ffffff)]',
    trailingIcon: 'text-[#657b78]',
  },
}

function feedbackClass(feedback: AuthFeedback, theme: Theme) {
  if (feedback.tone === 'error') {
    return 'border-[var(--ff-accent-primary)] text-[var(--ff-accent-primary)]'
  }

  if (feedback.tone === 'success') {
    return 'border-[var(--ff-accent-success)] text-[var(--ff-accent-success)]'
  }

  return authCardSkins[theme].feedbackNeutral
}

function AuthFeedbackBlock({ feedback, theme }: { feedback: AuthFeedback | null; theme: Theme }) {
  if (!feedback) {
    return null
  }

  return (
    <div className={`rounded-[var(--ff-radius-md)] border px-4 py-3 text-sm ${authCardSkins[theme].feedbackSurface} ${feedbackClass(feedback, theme)}`}>
      {feedback.message}
    </div>
  )
}

function LoginCtaGlyph() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M10 7 15 12l-5 5M15 12H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M13 4h5a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-5" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  )
}

function IntroAccessCta({
  isOpen,
  locale,
  onOpen,
}: {
  isOpen: boolean
  locale: 'zh' | 'en'
  onOpen: () => void
}) {
  return (
    <button
      aria-controls="login-auth-card"
      aria-expanded={isOpen}
      className="inline-flex min-h-[52px] min-w-[156px] items-center justify-center gap-2.5 rounded-[12px] bg-[var(--ff-accent-primary)] px-6 text-base font-bold text-white shadow-[0_10px_18px_rgba(5,9,11,0.22)] transition-colors hover:bg-[var(--ff-accent-strong)]"
      data-testid="login-auth-cta"
      onClick={onOpen}
      type="button"
    >
      <LoginCtaGlyph />
      <span className="whitespace-nowrap">
        {locale === 'zh' ? '登录' : 'Login'}
      </span>
    </button>
  )
}

function LoginPageUtilityControls({
  locale,
  onToggleTheme,
  theme,
  toggleLocale,
}: {
  locale: 'zh' | 'en'
  onToggleTheme: () => void
  theme: Theme
  toggleLocale: () => void
}) {
  const isDark = theme === 'dark'
  const skin = loginThemeSkins[theme]

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-[60] flex w-auto max-w-[calc(100vw-2rem)] flex-wrap items-center justify-center gap-2 rounded-[14px] border px-3 py-3 text-sm font-semibold backdrop-blur-md sm:bottom-6 sm:left-auto sm:right-6 sm:w-fit sm:flex-nowrap sm:justify-start sm:gap-5 sm:px-6 sm:text-base ${skin.utilityShell}`}
      data-testid="login-page-utility-controls"
    >
      <button className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap sm:gap-2 ${skin.utilityButton}`} onClick={onToggleTheme} type="button">
        <span className="material-symbols-outlined shrink-0 text-[24px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
        {getCopy(copy.shell.nav.themeToggle, locale)}
      </button>
      <span className={`h-5 w-px ${skin.utilityDivider}`} />
      <button className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap sm:gap-2 ${skin.utilityButton}`} onClick={toggleLocale} type="button">
        <span className="material-symbols-outlined shrink-0 text-[24px]">g_translate</span>
        {getCopy(copy.shell.nav.languageToggle, locale)}
      </button>
      <span className={`h-5 w-px ${skin.utilityDivider}`} />
      <BackgroundMusicToggle
        className={`gap-1.5 whitespace-nowrap sm:gap-2 ${skin.utilityButton}`}
        showLabel
      />
    </div>
  )
}

function LoginSecurityStatus({ locale, theme }: { locale: 'zh' | 'en'; theme: Theme }) {
  const skin = loginThemeSkins[theme]

  return (
    <div
      className={`inline-flex min-h-[46px] items-center gap-3 rounded-[14px] border px-4 text-sm font-bold backdrop-blur-md ${theme === 'dark' ? 'border-white/10 bg-white/[0.045]' : 'border-[#a9c3c5]/42 bg-white/62'} ${skin.security}`}
      data-testid="login-security-status"
    >
      <span className="h-2 w-2 rounded-[var(--ff-radius-full)] bg-[var(--ff-accent-success)] shadow-[0_0_12px_rgba(90,169,116,0.44)]" />
      <span>{locale === 'zh' ? '安全访问路径已加密' : 'Secure access path encrypted'}</span>
    </div>
  )
}

type AuthModeCopy = {
  dialogLabel: string
  footerAction: string
  footerMode: AuthMode
  footerPrompt: string
  forgotPassword: string
  passwordPlaceholder: string
  submitLabel: string
  subtitle: string
  title: string
}

function getAuthModeCopy(mode: AuthMode, locale: 'zh' | 'en', authMethod: AuthMethod = 'email'): AuthModeCopy {
  if (authMethod === 'phone' && mode !== 'password-reset') {
    return {
      dialogLabel: locale === 'zh' ? '手机登录' : 'Phone login',
      footerAction: getCopy(copy.login.auth.login, locale),
      footerMode: 'login',
      footerPrompt: '',
      forgotPassword: locale === 'zh' ? '忘记密码？' : 'Forgot password?',
      passwordPlaceholder: locale === 'zh' ? '短信验证码' : 'SMS code',
      submitLabel: locale === 'zh' ? '进入工作区' : 'Enter workspace',
      subtitle: locale === 'zh' ? '手机号入口准备中，当前请使用 Google 或邮箱。' : 'Phone access is being prepared. Use Google or email for now.',
      title: locale === 'zh' ? '手机登录' : 'Phone login',
    }
  }

  if (mode === 'password-reset') {
    return {
      dialogLabel: locale === 'zh' ? '重置密码' : 'Reset password',
      footerAction: getCopy(copy.login.auth.login, locale),
      footerMode: 'login',
      footerPrompt: locale === 'zh' ? '想起来了？' : 'Remembered it?',
      forgotPassword: locale === 'zh' ? '忘记密码？' : 'Forgot password?',
      passwordPlaceholder: locale === 'zh' ? '访问密钥（区分大小写）' : 'Access key (case sensitive)',
      submitLabel: locale === 'zh' ? '发送重置邮件' : 'Send reset email',
      subtitle: locale === 'zh' ? '输入注册邮箱，我们会发送密码重置邮件。' : 'Enter your account email and we will send a reset link.',
      title: locale === 'zh' ? '重置密码' : 'Reset password',
    }
  }

  if (mode === 'sign-up') {
    return {
      dialogLabel: getCopy(copy.login.auth.signup, locale),
      footerAction: getCopy(copy.login.auth.login, locale),
      footerMode: 'login',
      footerPrompt: locale === 'zh' ? '已有账户？' : 'Already have an account?',
      forgotPassword: locale === 'zh' ? '忘记密码？' : 'Forgot password?',
      passwordPlaceholder: locale === 'zh' ? '创建访问密钥' : 'Create an access key',
      submitLabel: getCopy(copy.login.auth.submitSignup, locale),
      subtitle: locale === 'zh' ? '创建账户后直接进入工作区。' : 'Create an account and enter the workspace directly.',
      title: getCopy(copy.login.auth.signup, locale),
    }
  }

  return {
    dialogLabel: getCopy(copy.login.auth.login, locale),
    footerAction: getCopy(copy.login.auth.signup, locale),
    footerMode: 'sign-up',
    footerPrompt: locale === 'zh' ? '还没有账户？' : 'No account yet?',
    forgotPassword: locale === 'zh' ? '忘记密码？' : 'Forgot password?',
    passwordPlaceholder: locale === 'zh' ? '访问密钥（区分大小写）' : 'Access key (case sensitive)',
    submitLabel: getCopy(copy.login.auth.login, locale),
    subtitle: locale === 'zh' ? '此程虽艰，您永不踽踽独行。' : 'The road may be hard, but you never walk alone.',
    title: getCopy(copy.login.auth.login, locale),
  }
}

function AuthBeaconPreview({ subtitle, theme, title }: { subtitle: string; theme: Theme; title: string }) {
  const skin = authCardSkins[theme]

  return (
    <div className={`relative h-[clamp(176px,28vh,304px)] overflow-hidden rounded-t-[28px] ${skin.hero}`}>
      <img
        alt=""
        className={`absolute inset-0 h-full w-full object-cover object-center ${skin.heroImage}`}
        draggable={false}
        src={theme === 'dark' ? nightIslandAuthScene : lightAuthScene}
      />
      <div className={`absolute inset-0 ${skin.heroGradient}`} />
      <div className="absolute bottom-7 left-0 right-0 px-6 text-left md:bottom-8">
        <h2 className={`text-[1.95rem] font-black leading-none tracking-normal md:text-[2.25rem] ${skin.heroTitle}`} data-testid="login-auth-card-title">
          {title}
        </h2>
        <p className={`mt-2.5 text-sm font-semibold ${skin.heroSubtitle}`}>
          {subtitle}
        </p>
      </div>
      <div className={`absolute inset-x-0 bottom-0 h-16 ${skin.surface}`} />
    </div>
  )
}

function SocialButton({
  disabled,
  icon,
  label,
  onClick,
  theme,
}: {
  disabled: boolean
  icon: ReactNode
  label: string
  onClick: () => void
  theme: Theme
}) {
  const skin = authCardSkins[theme]

  return (
    <button
      aria-label={label}
      className={`flex h-12 min-w-0 flex-1 items-center justify-center gap-2.5 rounded-[10px] border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${skin.socialButton}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${skin.socialIcon}`}>
        {icon}
      </span>
      <span className={`text-sm font-semibold leading-none ${skin.socialLabel}`}>{label}</span>
    </button>
  )
}

function WeChatComingSoonPanel({ locale, theme }: { locale: 'zh' | 'en'; theme: Theme }) {
  const skin = authCardSkins[theme]
  const shellClass =
    theme === 'dark'
      ? 'border-[#353b3b] bg-[rgba(255,255,255,0.025)] text-[#d9d1c4]/74 shadow-[inset_0_0_18px_rgba(255,255,255,0.012)]'
      : 'border-[#d1dfe0] bg-white/58 text-[#334844]/72 shadow-[0_10px_20px_rgba(98,124,129,0.06)]'
  const comingSoonClass = theme === 'dark' ? 'text-white/44' : 'text-[#7b8f8c]'

  return (
    <div
      aria-label={locale === 'zh' ? '微信敬请期待' : 'WeChat coming soon'}
      className={`flex h-12 min-w-0 flex-1 cursor-default items-center justify-center gap-2.5 rounded-[10px] border px-3 text-sm font-semibold ${shellClass}`}
      data-testid="login-wechat-coming-soon"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        <WeChatGlyph />
      </span>
      <span className="flex min-w-0 items-baseline gap-1.5 leading-none">
        <span className={`text-sm font-semibold ${skin.socialLabel}`}>{getCopy(copy.login.auth.wechat, locale)}</span>
        <span className={`text-[11px] font-bold ${comingSoonClass}`}>
          {locale === 'zh' ? '敬请期待' : 'Coming soon'}
        </span>
      </span>
    </div>
  )
}

function GoogleBrandGlyph() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.96 20.53 7.68 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.15A10.97 10.97 0 0 0 1 12c0 1.77.42 3.44 1.15 4.94l3.69-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.37c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.68 1 3.96 3.47 2.15 7.06l3.69 2.84C6.71 7.3 9.14 5.37 12 5.37z"
        fill="#EA4335"
      />
    </svg>
  )
}

function WeChatGlyph() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24">
      <circle cx="12" cy="12" fill="#07C160" r="11" />
      <path
        d="M9.1 8.1c-2.45 0-4.43 1.55-4.43 3.46 0 1.1.66 2.07 1.68 2.7l-.39 1.16 1.42-.69c.53.18 1.12.29 1.72.29 2.45 0 4.43-1.55 4.43-3.46S11.55 8.1 9.1 8.1Zm-1.46 2.77a.47.47 0 1 1 0-.94.47.47 0 0 1 0 .94Zm2.9 0a.47.47 0 1 1 0-.94.47.47 0 0 1 0 .94Z"
        fill="#fff"
      />
      <path
        d="M15.17 11.26c2.1 0 3.8 1.33 3.8 2.96 0 .94-.56 1.77-1.43 2.31l.34 1-1.22-.59c-.46.16-.96.24-1.49.24-2.1 0-3.8-1.33-3.8-2.96 0-1.64 1.7-2.96 3.8-2.96Zm-1.25 2.37a.4.4 0 1 0 0-.8.4.4 0 0 0 0 .8Zm2.49 0a.4.4 0 1 0 0-.8.4.4 0 0 0 0 .8Z"
        fill="#fff"
      />
    </svg>
  )
}

function AuthMethodTabs({
  authMethod,
  locale,
  onAuthMethodChange,
  theme,
}: {
  authMethod: AuthMethod
  locale: 'zh' | 'en'
  onAuthMethodChange: (method: AuthMethod) => void
  theme: Theme
}) {
  const options: Array<{ label: string; method: AuthMethod }> = [
    { label: locale === 'zh' ? '邮箱' : 'Email', method: 'email' },
    { label: locale === 'zh' ? '手机' : 'Phone', method: 'phone' },
  ]
  const shellClass = theme === 'dark' ? 'border-white/10 bg-white/[0.035]' : 'border-[#d5e2e3] bg-[#eef6f6]'
  const activeClass = theme === 'dark' ? 'bg-white/10 text-white' : 'bg-white text-[#172522] shadow-[0_6px_18px_rgba(98,124,129,0.12)]'
  const inactiveClass = theme === 'dark' ? 'text-white/50 hover:text-white/82' : 'text-[#6b7d7a] hover:text-[#172522]'

  return (
    <div className={`grid grid-cols-2 rounded-[12px] border p-1 ${shellClass}`} data-testid="login-auth-method-tabs">
      {options.map((option) => (
        <button
          aria-pressed={authMethod === option.method}
          className={`min-h-[38px] rounded-[9px] text-sm font-bold transition-colors ${authMethod === option.method ? activeClass : inactiveClass}`}
          key={option.method}
          onClick={() => onAuthMethodChange(option.method)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function CredentialField({
  children,
  fieldId,
  icon,
  label,
  theme,
  trailing,
}: {
  children: ReactNode
  fieldId: string
  icon: string
  label: string
  theme: Theme
  trailing?: ReactNode
}) {
  const skin = authCardSkins[theme]

  return (
    <div className="space-y-1.5">
      <label className={`block text-xs font-semibold ${skin.fieldLabel}`} htmlFor={fieldId}>
        {label}
      </label>
      <div className={`flex min-h-[50px] items-center gap-3 rounded-[10px] border px-4 transition-colors ${skin.field}`}>
        <span className={`material-symbols-outlined text-[20px] ${skin.fieldIcon}`}>{icon}</span>
        {children}
        {trailing}
      </div>
    </div>
  )
}

function PhoneComingSoonPanel({ locale, theme }: { locale: 'zh' | 'en'; theme: Theme }) {
  const skin = authCardSkins[theme]

  return (
    <div
      className={`rounded-[14px] border px-4 py-5 text-center ${theme === 'dark' ? 'border-white/10 bg-white/[0.035]' : 'border-[#d5e2e3] bg-[#f8fbfb]'}`}
      data-testid="login-phone-coming-soon"
    >
      <div className={`text-lg font-black ${skin.socialLabel}`}>
        {locale === 'zh' ? '敬请期待' : 'Coming soon'}
      </div>
      <p className={`mt-2 text-sm font-semibold leading-6 ${skin.modeHint}`}>
        {locale === 'zh'
          ? '手机验证码会在完成短信服务与防刷策略后开放。现在请先使用 Google 或邮箱。'
          : 'Phone codes will open after SMS delivery and abuse protection are configured. Use Google or email for now.'}
      </p>
    </div>
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
      className="flex min-h-[54px] w-full items-center justify-center gap-3 rounded-[14px] bg-[var(--ff-accent-primary)] px-5 text-base font-bold text-white shadow-[0_16px_34px_rgba(232,93,42,0.22)] transition-colors hover:bg-[var(--ff-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      data-testid="login-submit-button"
      disabled={isSubmitting}
      type="submit"
    >
      <span>{label}</span>
    </button>
  )
}

type AuthCardProps = Pick<
  V3LoginProps,
  | 'email'
  | 'authMethod'
  | 'isSubmitting'
  | 'mode'
  | 'onAnonymousLogin'
  | 'onAuthMethodChange'
  | 'onEmailChange'
  | 'onGoogleLogin'
  | 'onModeChange'
  | 'onPasswordChange'
  | 'onSubmit'
  | 'password'
> & {
  currentFeedback: AuthFeedback | null
  id?: string
  locale: 'zh' | 'en'
  privacySummary: string
  theme: Theme
}

function AuthCard({
  authMethod,
  currentFeedback,
  email,
  id,
  isSubmitting,
  locale,
  mode,
  onAnonymousLogin,
  onAuthMethodChange,
  onEmailChange,
  onGoogleLogin,
  onModeChange,
  onPasswordChange,
  onSubmit,
  password,
  privacySummary,
  theme,
}: AuthCardProps) {
  const fieldIdPrefix = id ?? 'login-auth-card'
  const emailFieldId = `${fieldIdPrefix}-email`
  const passwordFieldId = `${fieldIdPrefix}-password`
  const skin = authCardSkins[theme]
  const activeAuthMethod = mode === 'password-reset' ? 'email' : authMethod
  const isPhoneAuth = activeAuthMethod === 'phone'
  const modeCopy = getAuthModeCopy(mode, locale, activeAuthMethod)
  const showPasswordField = !isPhoneAuth && mode !== 'password-reset'
  const showEmailField = !isPhoneAuth
  const showSessionAlternatives = mode !== 'password-reset'
  const showModeSwitch = !isPhoneAuth
  const submitLabel = isSubmitting ? getCopy(copy.workspace.composer.processing, locale) : modeCopy.submitLabel

  return (
    <div
      className={`mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-[568px] flex-col overflow-x-hidden overflow-y-auto rounded-[28px] border ${skin.card}`}
      data-testid="login-auth-card-surface"
      id={id}
    >
      <AuthBeaconPreview subtitle={modeCopy.subtitle} theme={theme} title={modeCopy.title} />
      <div className={`px-5 pb-5 pt-4 md:px-6 ${skin.body}`}>
        <form className="space-y-3" onSubmit={onSubmit}>
          <AuthFeedbackBlock feedback={currentFeedback} theme={theme} />

          {mode !== 'password-reset' ? (
            <AuthMethodTabs authMethod={activeAuthMethod} locale={locale} onAuthMethodChange={onAuthMethodChange} theme={theme} />
          ) : null}

          {showEmailField ? (
            <CredentialField fieldId={emailFieldId} icon="mail" label={locale === 'zh' ? '邮箱' : 'Email'} theme={theme}>
              <span className="sr-only">{getCopy(copy.login.auth.emailLabelLight, locale)}</span>
              <input
                autoComplete="email"
                className={`min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none ${skin.fieldInput}`}
                id={emailFieldId}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder={locale === 'zh' ? '输入邮箱地址' : 'Enter email address'}
                required
                type="email"
                value={email}
              />
            </CredentialField>
          ) : null}

          {isPhoneAuth ? (
            <PhoneComingSoonPanel locale={locale} theme={theme} />
          ) : null}

          {showPasswordField ? (
            <CredentialField
              fieldId={passwordFieldId}
              icon="key"
              label={locale === 'zh' ? '密码' : 'Password'}
              theme={theme}
              trailing={<span className={`material-symbols-outlined text-[20px] ${skin.trailingIcon}`}>visibility</span>}
            >
              <span className="sr-only">{locale === 'zh' ? '密码 / 加密密钥' : 'Password / Encryption Key'}</span>
              <input
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className={`min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none ${skin.fieldInput}`}
                data-testid="login-password-input"
                id={passwordFieldId}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder={modeCopy.passwordPlaceholder}
                required
                type="password"
                value={password}
              />
            </CredentialField>
          ) : null}

          {mode === 'login' && !isPhoneAuth ? (
            <div className="flex justify-end text-sm font-semibold">
              <button
                className={`shrink-0 ${skin.forgotLink}`}
                onClick={() => onModeChange('password-reset')}
                type="button"
              >
                {modeCopy.forgotPassword}
              </button>
            </div>
          ) : null}

          {!isPhoneAuth ? (
            <LoginSubmitButton isSubmitting={isSubmitting} label={submitLabel} />
          ) : null}

          {showSessionAlternatives ? (
            <>
              <div className="flex items-center gap-4 py-1">
                <span className={`h-px flex-1 ${skin.divider}`} />
                <span className={`text-xs font-semibold ${skin.dividerText}`}>{locale === 'zh' ? '或' : 'or'}</span>
                <span className={`h-px flex-1 ${skin.divider}`} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SocialButton
                  disabled={isSubmitting}
                  icon={<GoogleBrandGlyph />}
                  label={getCopy(copy.login.auth.google, locale)}
                  onClick={onGoogleLogin}
                  theme={theme}
                />
                <WeChatComingSoonPanel locale={locale} theme={theme} />
              </div>

              <button
                className={`flex min-h-[52px] w-full items-center justify-center gap-3 rounded-[14px] border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${skin.anonymousButton}`}
                disabled={isSubmitting}
                onClick={onAnonymousLogin}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">lock_open</span>
                <span className="flex min-w-0 flex-col items-start leading-tight sm:flex-row sm:items-center sm:gap-2">
                  <span className="whitespace-nowrap">{locale === 'zh' ? '匿名会话' : 'Anonymous session'}</span>
                  <span className={`text-xs font-medium ${skin.anonymousSubLabel}`}>
                    {locale === 'zh' ? '创建匿名身份并保存到当前会话' : 'Create an anonymous identity for this session'}
                  </span>
                </span>
              </button>
            </>
          ) : null}
        </form>

        <p className={`mt-3 rounded-[var(--ff-radius-full)] px-4 py-1.5 text-center text-[11px] leading-5 ${skin.privacy}`}>
          <span className="material-symbols-outlined mr-2 inline text-base align-[-3px]">verified_user</span>
          {privacySummary}
          {' '}
          <Link className={`underline underline-offset-4 ${skin.privacyLink}`} to={PRIVACY_PAGE_HREF}>
            {getCopy(copy.login.footer.fullPrivacy, locale)}
          </Link>
        </p>
        {showModeSwitch ? (
        <p className={`mt-3 text-center text-xs font-semibold ${skin.modeHint}`}>
          {modeCopy.footerPrompt}
          {' '}
          <button
            className={`underline underline-offset-4 ${skin.modeButton}`}
            onClick={() => onModeChange(modeCopy.footerMode)}
            type="button"
          >
            {modeCopy.footerAction}
          </button>
        </p>
        ) : null}
      </div>
    </div>
  )
}

type AuthOverlayProps = AuthCardProps & {
  onClose: () => void
}

function AuthOverlay({ onClose, ...authCardProps }: AuthOverlayProps) {
  const { locale, theme } = authCardProps
  const skin = authCardSkins[theme]
  const overlayClass = theme === 'dark' ? 'bg-black/72' : 'bg-[#eff7f7]/78'
  const modeCopy = getAuthModeCopy(authCardProps.mode, locale, authCardProps.authMethod)
  const closeTimerRef = useRef<number | null>(null)
  const closingRef = useRef(false)
  const [motionState, setMotionState] = useState<'' | 'is-closing' | 'is-open'>(() =>
    typeof document === 'undefined' ? 'is-open' : '',
  )
  const requestClose = useCallback(() => {
    if (closingRef.current) {
      return
    }

    closingRef.current = true
    setMotionState('is-closing')
    closeTimerRef.current = window.setTimeout(onClose, 150)
  }, [onClose])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMotionState('is-open'))

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        requestClose()
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [requestClose])

  return (
    <div
      aria-label={modeCopy.dialogLabel}
      aria-modal="true"
      className={`fixed inset-0 z-[80] overflow-y-auto px-4 py-5 backdrop-blur-sm ${overlayClass}`}
      data-testid="login-auth-overlay"
      onClick={requestClose}
      role="dialog"
    >
      <div
        className="mx-auto flex min-h-full w-full max-w-[520px] items-start py-2 sm:items-center"
        data-testid="login-auth-modal-card"
      >
        <div className={`relative w-full t-modal ${motionState}`} onClick={(event) => event.stopPropagation()}>
          <button
            aria-label={locale === 'zh' ? `关闭${modeCopy.dialogLabel}` : `Close ${modeCopy.dialogLabel.toLowerCase()}`}
            className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-[var(--ff-radius-full)] border transition-colors ${skin.closeButton}`}
            data-testid="login-auth-close"
            onClick={requestClose}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <AuthCard {...authCardProps} id="login-auth-card" />
        </div>
      </div>
    </div>
  )
}

function V3LoginView({
  authMethod,
  authError,
  defaultAuthOpen = false,
  email,
  feedback,
  isSubmitting,
  mode,
  onAnonymousLogin,
  onAuthMethodChange,
  onEmailChange,
  onGoogleLogin,
  onModeChange,
  onPasswordChange,
  onSubmit,
  onToggleTheme,
  password,
  theme,
}: V3LoginProps) {
  const { locale, toggleLocale } = useLocale()
  const currentFeedback = feedback ?? (authError ? { message: authError, tone: 'error' as const } : null)
  const privacySummary =
    locale === 'zh'
      ? PRIVACY_POLICY_SUMMARY
      : 'By continuing, you agree to the privacy policy. Clinical text is used only for structured processing.'
  const [isAuthOpen, setIsAuthOpen] = useState(defaultAuthOpen)
  const skin = loginThemeSkins[theme]
  const authCardProps: AuthCardProps = {
    authMethod,
    currentFeedback,
    email,
    isSubmitting,
    locale,
    mode,
    onAnonymousLogin,
    onAuthMethodChange,
    onEmailChange,
    onGoogleLogin,
    onModeChange,
    onPasswordChange,
    onSubmit,
    password,
    privacySummary,
    theme,
  }

  return (
    <div className={`min-h-dvh w-full overflow-x-hidden font-[var(--ff-font-ui)] ${skin.root}`}>
      <main className="grid min-h-dvh w-full xl:h-dvh xl:grid-cols-1">
        <section className={`relative min-w-0 overflow-hidden px-7 pb-8 pt-24 md:px-14 md:py-12 xl:overflow-hidden ${skin.section}`}>
          <LoginTraceMap locale={locale} theme={theme} />
          <div className="relative z-10 flex min-h-full flex-col">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex min-w-0 items-center gap-4 md:gap-6">
                <FireflyMark className="h-16 w-16 md:h-[72px] md:w-[72px]" />
                <div className="min-w-0">
                  <div className={`font-[var(--ff-font-display)] text-3xl font-bold tracking-normal md:text-[2.8rem] ${skin.brandTitle}`}>
                    {getCopy(copy.shell.brand.lightTitle, locale)}
                  </div>
                  <div className={`mt-2 text-base font-semibold md:text-xl ${skin.brandSubtitle}`}>{getCopy(copy.shell.brand.lightSubtitle, locale)}</div>
                </div>
              </div>
            </div>

            <div className="mt-[12vh] w-full max-w-[calc(100vw-3.5rem)] md:mt-[16vh] md:max-w-[48rem]">
              <div
                className={`mb-5 inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] md:text-sm ${theme === 'dark' ? 'text-white/44' : 'text-[#455c58]/62'}`}
                data-testid="login-intro-eyebrow"
              >
                <span className="h-0.5 w-10 bg-[var(--ff-accent-primary)]" />
                <span>{locale === 'zh' ? 'Clinical timeline workspace' : 'Clinical timeline workspace'}</span>
              </div>
              <h1 className={`max-w-[calc(100vw-3.5rem)] break-words text-[clamp(2.5rem,4vw,3.5rem)] font-black leading-[1.08] tracking-normal md:max-w-[48rem] ${skin.heading}`}>
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
              <p className={`mt-7 max-w-[40rem] text-xl font-semibold leading-8 md:text-[1.35rem] ${skin.bodyCopy}`}>
                {locale === 'zh'
                  ? '把复杂治疗史整理为可追溯的结构化病历。'
                  : 'Transform complex treatment history into an auditable structured clinical record.'}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <IntroAccessCta isOpen={isAuthOpen} locale={locale} onOpen={() => setIsAuthOpen(true)} />
              <LoginSecurityStatus locale={locale} theme={theme} />
            </div>
            <LoginPageUtilityControls
              locale={locale}
              onToggleTheme={onToggleTheme}
              theme={theme}
              toggleLocale={toggleLocale}
            />
          </div>
        </section>

        {isAuthOpen ? <AuthOverlay {...authCardProps} onClose={() => setIsAuthOpen(false)} /> : null}
      </main>
    </div>
  )
}

export function LoginPageView(props: LoginPageViewProps) {
  return <V3LoginView {...props} />
}
