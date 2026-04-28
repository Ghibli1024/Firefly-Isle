/**
 * [INPUT]: 依赖 node:fs 的源码合同检查，依赖 react-dom/server 的静态渲染，依赖 react-router-dom 的 MemoryRouter，依赖 ./login-page-view 的 LoginPageView。
 * [OUTPUT]: 对外提供登录页主题壳层的回归测试。
 * [POS]: components 的登录页主题测试，约束 V3 入口页不混入工作区导航、旧伪技术装饰、点阵背景，锁住 A 版首屏节奏、双主题扁平全屏背景、无圆形光晕主入口、默认不挂载统一登录弹层与主页面工具区。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/locale'
import { ThemeProvider } from '@/lib/theme'

import { LoginPageView, type LoginPageViewProps } from './login-page-view'

function renderLogin(theme: LoginPageViewProps['theme'], overrides: Partial<LoginPageViewProps> = {}) {
  const props: LoginPageViewProps = {
    email: '',
    feedback: null,
    isSubmitting: false,
    mode: 'login',
    onAnonymousLogin: vi.fn(),
    onEmailChange: vi.fn(),
    onModeChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onSubmit: vi.fn(),
    onToggleTheme: vi.fn(),
    password: '',
    theme,
    ...overrides,
  }

  return renderToStaticMarkup(
    <ThemeProvider>
      <LocaleProvider>
        <MemoryRouter>
          <LoginPageView {...props} />
        </MemoryRouter>
      </LocaleProvider>
    </ThemeProvider>,
  )
}

function readLoginSource() {
  return readFileSync(new URL('./login-page-view.tsx', import.meta.url), 'utf8')
}

function readTraceMapSource() {
  return readFileSync(new URL('./login-trace-map.tsx', import.meta.url), 'utf8')
}

describe('LoginPageView theme shell', () => {
  it('renders dark login as an entry page without workspace side navigation', () => {
    const markup = renderLogin('dark')

    expect(markup).not.toContain('FORENSIC_ARCHIVE_V1')
    expect(markup).not.toContain('临床 AI 控制台')
    expect(markup).not.toContain('content_paste_search')
    expect(markup).not.toContain('folder_managed')
    expect(markup).not.toContain('analytics')
    expect(markup).not.toContain('CLINICAL ARCHIVE CONSOLE v3.0')
    expect(markup).not.toContain('login-clinical-backdrop')
    expect(markup).toContain('data-testid="login-trace-map"')
    expect(markup).toContain('/login/blue-tears-background-dark.png')
    expect(markup).not.toContain('/login/wind-field-background-light.png')
    expect(markup).not.toContain('/login/lighthouse-sea-chart-background.png')
    expect(markup).not.toContain('data-testid="login-trace-waypoint"')
    expect(markup).not.toContain('role="tooltip"')
    expect(markup).not.toContain('group-hover:opacity-100')
    expect(markup).toContain('临床治疗时间线')
    expect(markup).not.toContain('data-testid="login-compass-overlay"')
    expect(markup).not.toContain('270°')
    expect(markup).not.toContain('060°')
    expect(markup).not.toContain('090°')
    expect(markup).not.toContain('320°')
    expect(markup).toContain('data-testid="login-security-status"')
    expect(markup).toContain('安全访问路径已加密')
    expect(markup).toContain('data-testid="login-intro-eyebrow"')
    expect(markup).toContain('Clinical timeline workspace')
    expect(markup).not.toContain('top-[42%]')
    expect(markup).not.toContain('一键登录')
    expect(markup).not.toContain('data-testid="login-submit-button"')
    expect(markup).not.toContain('data-testid="login-auth-overlay"')
    expect(markup).not.toContain('data-testid="login-auth-modal-card"')
    expect(markup).not.toContain('data-testid="login-auth-drawer"')
    expect(markup).not.toContain('data-state="collapsed"')
    expect(markup).not.toContain('data-testid="login-drawer-collapsed-tab"')
    expect(markup).not.toContain('data-testid="login-mobile-auth-overlay"')
    expect(markup).not.toContain('data-testid="login-mobile-auth-card"')
    expect(markup).not.toContain('data-testid="login-capability-rail"')
    expect(markup).toContain('data-testid="login-page-utility-controls"')
    expect(markup).toContain('data-testid="login-auth-cta"')
    expect(markup).toContain('class="whitespace-nowrap">登录</span>')
    expect(markup).not.toContain('进入身份访问')
    expect(markup).not.toContain('data-testid="login-beacon-mark"')
    expect(markup).not.toContain('等待凭证')
    expect(markup).not.toContain('填写邮箱与密码后可登录')
    expect(markup).not.toContain('快捷登录')
    expect(markup).not.toContain('记住我')
    expect(markup).toContain('深色')
    expect(markup).not.toContain('dark_mode')
  })

  it('keeps the intro access action as a plain login button after credentials are present', () => {
    const markup = renderLogin('dark', {
      email: 'doctor@example.com',
      password: 'encrypted-key',
    })

    expect(markup).toContain('登录')
    expect(markup).toContain('data-testid="login-auth-cta"')
    expect(markup).not.toContain('data-testid="login-submit-button"')
    expect(markup).not.toContain('凭证就绪')
    expect(markup).not.toContain('等待凭证')
  })

  it('keeps credential actions out of the initial narrow-screen markup', () => {
    const markup = renderLogin('dark')

    expect(markup).not.toContain('邮箱')
    expect(markup).not.toContain('密码')
    expect(markup).not.toContain('匿名会话')
    expect(markup).not.toContain('data-testid="login-auth-overlay"')
    expect(markup).not.toContain('data-testid="login-mobile-auth-overlay"')
  })

  it('renders light login on a pure surface without the dotted background class', () => {
    const markup = renderLogin('light')

    expect(markup).not.toContain('ff-light-login-bg')
    expect(markup).not.toContain('FORENSIC_ARCHIVE_SYSTEM_V3.0')
    expect(markup).not.toContain('ENCRYPTION_LEVEL')
    expect(markup).not.toContain('DATA_EXTRACTION_PROTOCOL')
    expect(markup).toContain('/login/wind-field-background-light.png')
    expect(markup).not.toContain('/login/blue-tears-background-dark.png')
    expect(markup).not.toContain('/login/lighthouse-sea-chart-background.png')
    expect(markup).toContain('data-testid="login-trace-map"')
    expect(markup).not.toContain('/login/anatomy-light.png')
    expect(markup).toContain('bg-[#f7fbfb]')
    expect(markup).not.toContain('bg-[#02080a]')
    expect(markup).toContain('把复杂治疗史整理为可追溯的结构化病历。')
  })

  it('fills the browser viewport instead of keeping the old fixed-width canvas', () => {
    const markup = renderLogin('light')

    expect(markup).toContain('min-h-dvh')
    expect(markup).toContain('w-full')
    expect(markup).toContain('xl:h-dvh')
    expect(markup).toContain('xl:grid-cols-1')
    expect(markup).toContain('overflow-hidden px-7 pb-8 pt-24')
    expect(markup).not.toContain('xl:grid-cols-[minmax(0,1fr)_112px]')
    expect(markup).not.toContain('order-first')
    expect(markup).not.toContain('order-last')
    expect(markup).not.toContain('xl:grid-cols-[minmax(0,1fr)_minmax(440px,580px)]')
    expect(markup).not.toContain('xl:grid-cols-[minmax(0,1fr)_minmax(420px,680px)]')
    expect(markup).not.toContain('lg:grid-cols-[minmax(0,1fr)_minmax(420px,680px)]')
    expect(markup).not.toContain('max-w-[1510px]')
    expect(markup).not.toContain('rounded-[var(--ff-radius-lg)] border border-[var(--ff-border-default)]')
  })

  it('uses one auth overlay instead of a desktop drawer branch', () => {
    const source = readLoginSource()

    expect(source).toContain('function AuthOverlay')
    expect(source).toContain('data-testid="login-auth-overlay"')
    expect(source).toContain('fixed inset-0 z-[80]')
    expect(source).toContain('<AuthCard {...authCardProps} id="login-auth-card" />')
    expect(source).not.toContain('function AuthDrawer')
    expect(source).not.toContain('desktopGridClass')
    expect(source).not.toContain('data-testid="login-auth-drawer"')
    expect(source).not.toContain('data-testid="login-mobile-auth-overlay"')
    expect(source).not.toContain('data-testid="login-mobile-auth-card"')
    expect(source).not.toContain('data-testid="login-drawer-close"')
    expect(source).not.toContain('fixed inset-0 z-50')
    expect(source).not.toContain('xl:grid-cols-[minmax(0,1fr)_minmax')
    expect(source).not.toContain('backdrop-blur-sm xl:hidden')
    expect(source).not.toContain('className="hidden h-full w-full xl:flex')
  })

  it('uses the short login title in the auth card hero', () => {
    const source = readLoginSource()

    expect(source).toContain("{locale === 'zh' ? '登录' : 'Login'}")
    expect(source).not.toContain('账号登录')
    expect(source).not.toContain('Account Login')
  })

  it('keeps the intro background clean without visible workflow waypoints', () => {
    const markup = renderLogin('dark')

    expect(markup).toContain('登录页主题海岸背景')
    expect(markup).not.toContain('data-testid="login-trace-waypoint"')
    expect(markup).not.toContain('login-trace-tooltip-chaos')
    expect(markup).not.toContain('login-trace-tooltip-organize')
    expect(markup).not.toContain('login-trace-tooltip-structured')
    expect(markup).not.toContain('login-trace-tooltip-traceable')
    expect(markup).not.toContain('非结构化来源')
    expect(markup).not.toContain('时间轴梳理')
    expect(markup).not.toContain('标准化记录')
    expect(markup).not.toContain('可审计路径')
    expect(markup).not.toContain('混乱')
  })

  it('keeps the trace map anchored after the intro layout is stable', () => {
    const markup = renderLogin('dark')
    const waypointCount = markup.split('data-testid="login-trace-waypoint"').length - 1
    const inactiveWaypointCount = markup.split('data-active="false"').length - 1

    expect(waypointCount).toBe(0)
    expect(inactiveWaypointCount).toBe(0)
    expect(markup).toContain('登录页主题海岸背景')
    expect(markup).toContain('absolute inset-0 select-none overflow-hidden')
    expect(markup).toContain('absolute inset-0 h-full w-full object-cover object-center opacity-100')
    expect(markup).not.toContain('pointer-events-none absolute inset-0 z-20 hidden xl:block')
    expect(markup).not.toContain('data-testid="login-compass-overlay"')
    expect(markup).not.toContain('stroke-dasharray="7 16"')
    expect(markup).not.toContain('270°')
    expect(markup).not.toContain('060°')
    expect(markup).not.toContain('090°')
    expect(markup).not.toContain('320°')
    expect(markup).not.toContain('先把症状、用药、检查和疗效放回同一条时间轴')
    expect(markup).not.toContain('治疗线、分期、方案、免疫组化和基因检测')
    expect(markup).not.toContain('data-testid="login-anatomy-backdrop"')
    expect(markup).not.toContain('object-contain lg:block')
    expect(markup).not.toContain('object-contain md:block')
    expect(markup).not.toContain('max-w-[430px]')
  })

  it('keeps theme and language controls on the intro page instead of the auth card', () => {
    const markup = renderLogin('light')
    const utilityIndex = markup.indexOf('data-testid="login-page-utility-controls"')
    const ctaIndex = markup.indexOf('data-testid="login-auth-cta"')
    const securityIndex = markup.indexOf('data-testid="login-security-status"')
    const themeLabelIndex = markup.indexOf('浅色')
    const languageLabelIndex = markup.indexOf('中文')

    expect(markup.indexOf('登录')).toBeGreaterThan(-1)
    expect(utilityIndex).toBeGreaterThan(-1)
    expect(ctaIndex).toBeGreaterThan(utilityIndex)
    expect(markup).not.toContain('data-testid="login-auth-overlay"')
    expect(markup).not.toContain('data-testid="login-auth-drawer"')
    expect(markup).not.toContain('data-testid="login-drawer-collapsed-tab"')
    expect(markup).not.toContain('data-testid="login-auth-modal-card"')
    expect(markup).not.toContain('data-testid="login-mobile-auth-card"')
    expect(markup).not.toContain('data-testid="login-mobile-auth-overlay"')
    expect(securityIndex).toBeGreaterThan(ctaIndex)
    expect(themeLabelIndex).toBeGreaterThan(utilityIndex)
    expect(languageLabelIndex).toBeGreaterThan(utilityIndex)
    expect(themeLabelIndex).toBeLessThan(ctaIndex)
    expect(languageLabelIndex).toBeLessThan(ctaIndex)
  })

  it('does not render the light login vertical watermark', () => {
    const markup = renderLogin('light')

    expect(markup).not.toContain('CONFIDENTIAL CLINICAL WORKFLOW ENVIRONMENT')
    expect(markup).not.toContain('AUTHENTICATION REQUIRED')
  })

  it('keeps the main entry surface free of circular glow masks', () => {
    const source = readTraceMapSource()
    const loginSource = readLoginSource()

    expect(source).not.toContain('radial-gradient')
    expect(source).not.toContain('circle_at_')
    expect(loginSource).not.toContain('shadow-[0_22px_50px_rgba(232,93,42,0.26)]')
  })
})
