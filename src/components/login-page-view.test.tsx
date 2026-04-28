/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染，依赖 react-router-dom 的 MemoryRouter，依赖 ./login-page-view 的 LoginPageView。
 * [OUTPUT]: 对外提供登录页主题壳层的回归测试。
 * [POS]: components 的登录页主题测试，约束 V3 入口页不混入工作区导航、旧伪技术装饰、点阵背景，保留左侧人体背景资产，同时约束右侧身份入口复刻 D 夜航岛屿面板与单纯登录按钮。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
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
    expect(markup).toContain('data-testid="login-anatomy-backdrop"')
    expect(markup).toContain('/login/anatomy-dark.png')
    expect(markup).toContain('/login/night-island-auth-scene.png')
    expect(markup).toContain('身份访问')
    expect(markup).toContain('bottom-8')
    expect(markup).not.toContain('top-[42%]')
    expect(markup).toContain('一键登录')
    expect(markup).toContain('data-testid="login-submit-button"')
    expect(markup).not.toContain('data-testid="login-beacon-mark"')
    expect(markup).not.toContain('等待凭证')
    expect(markup).not.toContain('填写邮箱与密码后可登录')
    expect(markup).toContain('快捷登录')
    expect(markup).not.toContain('记住我')
    expect(markup).toContain('dark_mode')
  })

  it('keeps the submit action as a plain login button after credentials are present', () => {
    const markup = renderLogin('dark', {
      email: 'doctor@example.com',
      password: 'encrypted-key',
    })

    expect(markup).toContain('登录')
    expect(markup).toContain('data-testid="login-submit-button"')
    expect(markup).not.toContain('凭证就绪')
    expect(markup).not.toContain('等待凭证')
  })

  it('orders credential actions as email, password, login button, then anonymous session', () => {
    const markup = renderLogin('dark')
    const emailIndex = markup.indexOf('邮箱')
    const passwordIndex = markup.indexOf('密码')
    const loginIndex = markup.indexOf('data-testid="login-submit-button"')
    const anonymousIndex = markup.indexOf('匿名会话')

    expect(emailIndex).toBeGreaterThan(-1)
    expect(passwordIndex).toBeGreaterThan(emailIndex)
    expect(loginIndex).toBeGreaterThan(passwordIndex)
    expect(anonymousIndex).toBeGreaterThan(loginIndex)
  })

  it('renders light login on a pure surface without the dotted background class', () => {
    const markup = renderLogin('light')

    expect(markup).not.toContain('ff-light-login-bg')
    expect(markup).not.toContain('FORENSIC_ARCHIVE_SYSTEM_V3.0')
    expect(markup).not.toContain('ENCRYPTION_LEVEL')
    expect(markup).not.toContain('DATA_EXTRACTION_PROTOCOL')
    expect(markup).toContain('/login/anatomy-light.png')
    expect(markup).toContain('bg-[var(--ff-surface-base)]')
    expect(markup).toContain('在安全的光下，开始您的旅程')
  })

  it('fills the browser viewport instead of keeping the old fixed-width canvas', () => {
    const markup = renderLogin('light')

    expect(markup).toContain('min-h-dvh')
    expect(markup).toContain('w-full')
    expect(markup).toContain('xl:grid-cols-[minmax(0,1fr)_minmax(420px,680px)]')
    expect(markup).not.toContain('lg:grid-cols-[minmax(0,1fr)_minmax(420px,680px)]')
    expect(markup).not.toContain('max-w-[1510px]')
  })

  it('keeps the anatomy backdrop anchored after the two-panel layout is stable', () => {
    const markup = renderLogin('dark')

    expect(markup).toContain('xl:block')
    expect(markup).toContain('w-[clamp(180px,17vw,370px)]')
    expect(markup).toContain('right-[clamp(1.5rem,4vw,5.5rem)]')
    expect(markup).not.toContain('object-contain lg:block')
    expect(markup).not.toContain('object-contain md:block')
    expect(markup).not.toContain('max-w-[430px]')
  })

  it('keeps light theme toggle outside the authentication card header', () => {
    const markup = renderLogin('light')
    const headingIndex = markup.indexOf('身份访问控制台')
    const themeIconIndex = markup.indexOf('light_mode')

    expect(headingIndex).toBe(-1)
    expect(markup.indexOf('身份访问')).toBeGreaterThan(-1)
    expect(themeIconIndex).toBeGreaterThan(markup.indexOf('身份访问'))
  })

  it('does not render the light login vertical watermark', () => {
    const markup = renderLogin('light')

    expect(markup).not.toContain('CONFIDENTIAL CLINICAL WORKFLOW ENVIRONMENT')
    expect(markup).not.toContain('AUTHENTICATION REQUIRED')
  })
})
