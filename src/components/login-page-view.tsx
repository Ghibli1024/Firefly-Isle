/**
 * [INPUT]: 依赖 react 的表单事件类型，依赖 react-router-dom 的 Link，依赖 @/components/app-shell 的设计复刻壳层，依赖 @/lib/privacy 的隐私页路由与摘要真相源，依赖登录页表单状态 props。
 * [OUTPUT]: 对外提供 LoginPageView 组件，以及 AuthMode / AuthFeedback / LoginPageViewProps 类型。
 * [POS]: components 的登录页展示层，承载 Dark/Light 双主题复刻结构、认证表单展示与产品入口隐私页跳转，不负责 Supabase 认证状态机。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Link } from 'react-router-dom'
import { type FormEvent } from 'react'

import { ArchiveSideNav, DarkTopBar, LightMasthead, REPORT_PLACEHOLDER } from '@/components/app-shell'
import { PRIVACY_PAGE_HREF, PRIVACY_POLICY_SUMMARY } from '@/lib/privacy'
import type { Theme } from '@/lib/theme'

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
      ? 'border-[#7A1F00] text-[#FF8A65]'
      : feedback.tone === 'success'
        ? 'border-[#274B2B] text-[#9CCC65]'
        : 'border-[#262626] text-[#FAFAFA]/70'

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
      ? 'border-[#ba1a1a] text-[#ba1a1a]'
      : feedback.tone === 'success'
        ? 'border-[#205d38] text-[#205d38]'
        : 'border-[#111111] text-[#5d5f5b]'

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
  const submitLabel = mode === 'login' ? '验证并进入控制台' : '创建账户并发送验证邮件'
  const dividerLabel = mode === 'login' ? '或使用邮箱凭证 / OR_EMAIL' : '邮箱建档入口 / CREATE_ACCOUNT'

  return (
    <div className="min-h-screen overflow-hidden bg-[#0A0A0A] font-['Inter'] text-[#FAFAFA]">
      <DarkTopBar />
      <ArchiveSideNav dark />

      <main className="flex min-h-screen flex-col pt-16 md:ml-[15%] md:flex-row">
        <section className="relative flex w-full flex-col justify-center overflow-hidden border-r border-[#262626] p-12 md:w-[65%] md:p-24">
          <div className="absolute right-0 top-0 p-8 text-right font-['JetBrains_Mono'] text-[10px] uppercase leading-relaxed tracking-widest opacity-20 select-none">
            FORENSIC_ARCHIVE_SYSTEM_V1.0
            <br />
            ENCRYPTION_LEVEL: TRIPLE_AES_256
            <br />
            DATA_EXTRACTION_PROTOCOL: ACTIVE
          </div>

          <div className="max-w-4xl space-y-8">
            <div className="mb-4 inline-block border border-[#262626] bg-[#1A1A1A] px-2 py-1 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[#FF3D00]">
              Clinical AI Intelligence
            </div>
            <h1 className="font-['Inter_Tight'] text-[clamp(3rem,8vw,6rem)] font-black leading-[0.9] tracking-tighter text-[#FAFAFA]">
              把复杂治疗史
              <br />
              整理成<span className="text-[#FF3D00]">一页纸</span>
            </h1>
            <p className="max-w-2xl text-xl leading-relaxed text-[#FAFAFA] opacity-60 md:text-2xl">
              临床精密性的本质在于对复杂信息的降维与提取。
            </p>
            <div className="flex items-center gap-4 pt-12 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.3em] opacity-40">
              <div className="h-px w-24 bg-[#262626]" />
              <span>System Ready for Analysis</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-px w-full bg-[#262626]" />
        </section>

        <section className="relative flex w-full flex-col justify-center bg-[#0A0A0A] p-12 md:w-[35%] md:p-16">
          <div className="mx-auto w-full max-w-sm space-y-8">
            <header className="space-y-4">
              <div className="space-y-2">
                <h2 className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-[#FF3D00]">Authentication</h2>
                <p className="text-lg font-bold tracking-tight">身份访问控制台</p>
              </div>
              <div className="grid grid-cols-2 gap-2 border border-[#262626] p-1">
                <button
                  className={`px-3 py-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    mode === 'login' ? 'bg-[#FF3D00] text-[#0A0A0A]' : 'text-[#FAFAFA]/60 hover:text-[#FAFAFA]'
                  }`}
                  onClick={() => onModeChange('login')}
                  type="button"
                >
                  登录
                </button>
                <button
                  className={`px-3 py-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    mode === 'sign-up' ? 'bg-[#FF3D00] text-[#0A0A0A]' : 'text-[#FAFAFA]/60 hover:text-[#FAFAFA]'
                  }`}
                  onClick={() => onModeChange('sign-up')}
                  type="button"
                >
                  注册
                </button>
              </div>
            </header>

            <div className="mb-8 space-y-4">
              <button
                className="flex w-full items-center justify-center gap-3 border border-[#262626] py-4 font-['JetBrains_Mono'] text-[12px] text-[#FAFAFA]/45"
                disabled
                type="button"
              >
                <WechatGlyph />
                <span>微信快捷登录 / WECHAT_AUTH</span>
              </button>
              <button
                className="flex w-full items-center justify-center gap-3 border border-[#262626] py-4 font-['JetBrains_Mono'] text-[12px] text-[#FAFAFA]/45"
                disabled
                type="button"
              >
                <GoogleGlyph />
                <span>谷歌账号登录 / GOOGLE_AUTH</span>
              </button>
              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-grow bg-[#262626]" />
                <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest opacity-30">{dividerLabel}</span>
                <div className="h-px flex-grow bg-[#262626]" />
              </div>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <DarkAuthFeedback feedback={feedback ?? (authError ? { tone: 'error', message: authError } : null)} />

              <div className="group space-y-1">
                <label
                  className="block font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest opacity-40 transition-colors group-focus-within:text-[#FF3D00]"
                  htmlFor="dark-email"
                >
                  Registered Email
                </label>
                <input
                  autoComplete="email"
                  className="w-full border-b border-[#262626] border-l-0 border-r-0 border-t-0 bg-transparent py-3 text-[#FAFAFA] outline-none transition-all placeholder:text-sm placeholder:opacity-20 focus:border-[#FF3D00] focus:border-b-2"
                  id="dark-email"
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="输入临床邮箱"
                  required
                  type="email"
                  value={email}
                />
              </div>
              <div className="group space-y-1">
                <label
                  className="block font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest opacity-40 transition-colors group-focus-within:text-[#FF3D00]"
                  htmlFor="dark-key"
                >
                  Encryption Key
                </label>
                <input
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full border-b border-[#262626] border-l-0 border-r-0 border-t-0 bg-transparent py-3 text-[#FAFAFA] outline-none transition-all placeholder:text-sm placeholder:opacity-20 focus:border-[#FF3D00] focus:border-b-2"
                  id="dark-key"
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder="输入 256 位加密密钥"
                  required
                  type="password"
                  value={password}
                />
              </div>

              <div className="space-y-3 pt-3">
                <button
                  className="flex w-full items-center justify-between bg-[#FF3D00] px-8 py-5 font-['Inter_Tight'] font-bold text-[#0A0A0A] transition-all hover:bg-[#FAFAFA] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  <span className="tracking-widest">{isSubmitting ? '处理中…' : submitLabel}</span>
                  <span className="material-symbols-outlined">arrow_forward_ios</span>
                </button>
                <button
                  className="w-full border border-[#262626] px-6 py-4 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.24em] text-[#FAFAFA]/70 transition-colors hover:border-[#FF3D00] hover:text-[#FF3D00] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  onClick={onAnonymousLogin}
                  type="button"
                >
                  无需登录，直接使用匿名会话
                </button>
                <div className="text-center text-[11px] italic leading-relaxed opacity-60">
                  <Link className="underline underline-offset-4" to={PRIVACY_PAGE_HREF}>
                    查看完整隐私条款
                  </Link>
                </div>
              </div>
            </form>

            <footer className="flex flex-col space-y-6 pt-8">
              <div className="relative h-16 w-full">
                <img alt="Clinical report texture" className="h-full w-full object-cover grayscale opacity-30 contrast-150" src={REPORT_PLACEHOLDER} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
              </div>
            </footer>
          </div>

          <div className="absolute bottom-10 right-10 flex flex-col items-center gap-4">
            <button
              className="group flex items-center justify-center border border-[#262626] p-3 text-[#FAFAFA] transition-none hover:bg-[#1A1A1A]"
              onClick={onToggleTheme}
              type="button"
            >
              <span className="material-symbols-outlined group-hover:text-[#FF3D00]">dark_mode</span>
            </button>
            <div className="h-12 w-px bg-[#262626]" />
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 z-50 flex h-12 w-full items-center justify-between border-t border-[#262626] bg-[#0A0A0A] px-6 md:ml-[15%] md:w-[85%]">
        <div className="flex items-center gap-8 font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest text-[#FAFAFA] opacity-30">
          <span>© 2024 一页萤岛 ARCHIVE</span>
          <span>Clinical_Control_V1.4.2</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse bg-[#FF3D00]" />
            <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest text-[#FF3D00]">
              Secure Link Active
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
  const submitLabel = mode === 'login' ? '验证并进入系统' : '注册并发送验证邮件'

  return (
    <div className="ff-light-login-bg min-h-screen font-['Noto_Serif'] text-[#111111]">
      <LightMasthead />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 py-12 md:flex-row md:px-12">
        <section className="flex w-full flex-col gap-8 md:w-7/12">
          <div className="relative overflow-hidden border-2 border-[#111111] bg-[#F9F9F7] p-8">
            <div className="absolute right-0 top-0 h-16 w-16 border-b-2 border-l-2 border-[#111111]" />
            <h2 className="mb-8 font-['Playfair_Display'] text-5xl leading-[0.95] tracking-tight text-[#111111] md:text-7xl">
              把复杂治疗史
              <br />
              整理成一页纸
            </h2>
            <div className="mb-8 h-2 w-24 bg-[#111111]" />
            <p className="ff-light-drop-cap mb-8 text-justify text-xl leading-relaxed text-[#111111] md:text-2xl">
              在数字化医疗的洪流中，信息的碎片化成为了精准诊疗的阻碍。一页萤岛利用先进的语义提取引擎，将跨度数年的电子病历、检验报告及主观叙述，浓缩为具备高度逻辑性的临床全景。我们不只是在整理数据，更是在重构生命叙事。
            </p>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="border border-[#111111] bg-[#f4f4f2] p-4">
                <span className="mb-2 block font-['JetBrains_Mono'] text-xs">PRECISION // 01</span>
                <h4 className="font-['Newsreader'] text-lg font-bold">结构化重塑</h4>
                <p className="mt-1 text-sm opacity-80">
                  自动识别140余种临床实体，将非结构化文本转化为标准医学图谱。
                </p>
              </div>
              <div className="border border-[#111111] bg-[#f4f4f2] p-4">
                <span className="mb-2 block font-['JetBrains_Mono'] text-xs">INTELLIGENCE // 02</span>
                <h4 className="font-['Newsreader'] text-lg font-bold">时间轴推理</h4>
                <p className="mt-1 text-sm opacity-80">
                  跨时空对比关键指标变化，自动勾勒病情进展与治疗反应曲线。
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 font-['JetBrains_Mono'] text-xs uppercase">
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Clinical Data Encryption Standard ISO-27001 Certified</span>
          </div>
        </section>

        <section className="w-full md:w-5/12">
          <div className="ff-light-ink-shadow border-2 border-[#111111] bg-[#F9F9F7] p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-['Playfair_Display'] text-3xl font-bold leading-tight">身份访问控制台</h3>
                <p className="mt-1 font-['JetBrains_Mono'] text-[10px] uppercase tracking-tight">
                  Identity Access Management / Secure Gateway
                </p>
              </div>
              <button
                className="border border-[#111111] p-2 transition-colors hover:bg-[#111111] hover:text-[#F9F9F7]"
                onClick={onToggleTheme}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">contrast</span>
              </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 border border-[#111111] p-1">
              <button
                className={`px-3 py-2 font-['Inter'] text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  mode === 'login' ? 'bg-[#111111] text-[#F9F9F7]' : 'text-[#111111]/60 hover:text-[#111111]'
                }`}
                onClick={() => onModeChange('login')}
                type="button"
              >
                登录
              </button>
              <button
                className={`px-3 py-2 font-['Inter'] text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  mode === 'sign-up' ? 'bg-[#111111] text-[#F9F9F7]' : 'text-[#111111]/60 hover:text-[#111111]'
                }`}
                onClick={() => onModeChange('sign-up')}
                type="button"
              >
                注册
              </button>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <LightAuthFeedback feedback={feedback ?? (authError ? { tone: 'error', message: authError } : null)} />

              <div className="group">
                <label className="mb-1 block font-['Inter'] text-[10px] font-bold uppercase tracking-widest">
                  Electronic Mail
                </label>
                <input
                  autoComplete="email"
                  className="w-full border-b-2 border-l-0 border-r-0 border-t-0 border-[#111111] bg-transparent px-0 py-3 text-[#111111] outline-none placeholder:text-[#111111]/30"
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="输入邮箱地址"
                  required
                  type="email"
                  value={email}
                />
              </div>
              <div className="group">
                <label className="mb-1 block font-['Inter'] text-[10px] font-bold uppercase tracking-widest">
                  Encryption Key / Password
                </label>
                <input
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full border-b-2 border-l-0 border-r-0 border-t-0 border-[#111111] bg-transparent px-0 py-3 font-['JetBrains_Mono'] text-[#111111] outline-none placeholder:text-[#111111]/30"
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                />
              </div>

              <button
                className="mt-6 w-full border-2 border-[#111111] bg-[#111111] py-4 font-['Inter'] text-sm font-bold uppercase tracking-widest text-[#F9F9F7] transition-all hover:bg-[#F9F9F7] hover:text-[#111111] active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? '处理中…' : submitLabel}
              </button>
            </form>

            <div className="relative my-10 flex items-center">
              <div className="flex-grow border-t border-[#111111]/20" />
              <span className="mx-4 flex-shrink font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest">
                第三方鉴权
              </span>
              <div className="flex-grow border-t border-[#111111]/20" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="group flex items-center justify-center gap-2 border border-[#111111] py-3 font-['Inter'] font-medium text-[#111111]/45"
                disabled
                type="button"
              >
                <img alt="WeChat" className="h-4 w-4 grayscale" src={WECHAT_ICON_URL} />
                <span className="text-xs uppercase tracking-tight">WeChat</span>
              </button>
              <button
                className="group flex items-center justify-center gap-2 border border-[#111111] py-3 font-['Inter'] font-medium text-[#111111]/45"
                disabled
                type="button"
              >
                <img alt="Google" className="h-4 w-4 grayscale" src={GOOGLE_ICON_URL} />
                <span className="text-xs uppercase tracking-tight">Google</span>
              </button>
            </div>

            <button
              className="mt-4 w-full border-2 border-[#111111] px-6 py-4 font-['Inter'] text-sm font-bold uppercase tracking-[0.18em] text-[#111111] transition-colors hover:bg-[#111111] hover:text-[#F9F9F7] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              onClick={onAnonymousLogin}
              type="button"
            >
              无需登录，直接使用匿名会话
            </button>

            <div className="mt-12 border-t border-[#111111]/10 pt-8">
              <p className="text-center text-[11px] italic leading-relaxed opacity-60">{PRIVACY_POLICY_SUMMARY}</p>
              <div className="mt-4 text-center text-[11px] uppercase tracking-[0.2em]">
                <Link className="underline underline-offset-4" to={PRIVACY_PAGE_HREF}>
                  查看完整隐私条款
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-between bg-[#111111] p-4 text-[#F9F9F7]">
              <span className="font-['JetBrains_Mono'] text-[10px]">UPTIME</span>
              <span className="font-['Playfair_Display'] text-2xl font-bold">99.9%</span>
            </div>
            <div className="flex flex-col justify-between border border-[#111111] bg-[#eeeeec] p-4">
              <span className="font-['JetBrains_Mono'] text-[10px]">USERS ONLINE</span>
              <span className="font-['Playfair_Display'] text-2xl font-bold">1.2K+</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto w-full px-6 py-8 md:px-12">
        <div className="mb-1 h-1 w-full bg-[#111111]" />
        <div className="mb-4 h-px w-full bg-[#111111]" />
        <div className="flex flex-col items-center justify-between font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest opacity-60 md:flex-row">
          <span>© 2024 一页萤岛 ARCHIVE SYSTEM</span>
          <div className="mt-4 flex gap-8 md:mt-0">
            <Link className="underline underline-offset-4" to={PRIVACY_PAGE_HREF}>
              Privacy Policy
            </Link>
            <a className="underline underline-offset-4" href="#">
              System Status
            </a>
            <a className="underline underline-offset-4" href="#">
              Support Cluster
            </a>
          </div>
        </div>
      </footer>

      <div className="pointer-events-none fixed right-4 top-1/2 hidden -translate-y-1/2 xl:block">
        <span className="inline-block origin-center rotate-90 whitespace-nowrap font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.5em] opacity-20">
          CONFIDENTIAL CLINICAL WORKFLOW ENVIRONMENT — AUTHENTICATION REQUIRED
        </span>
      </div>
    </div>
  )
}

export function LoginPageView(props: LoginPageViewProps) {
  return props.theme === 'dark' ? <DarkLoginView {...props} /> : <LightLoginView {...props} />
}
