/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染，依赖 react-router-dom 的 MemoryRouter，依赖 ./login-page-view 的 LoginPageView。
 * [OUTPUT]: 对外提供登录页主题壳层的回归测试。
 * [POS]: components 的登录页主题测试，约束入口页不再混入工作区导航、点阵背景与卡片内主题切换。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '@/lib/theme'

import { LoginPageView, type LoginPageViewProps } from './login-page-view'

function renderLogin(theme: LoginPageViewProps['theme']) {
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
  }

  return renderToStaticMarkup(
    <ThemeProvider>
      <MemoryRouter>
        <LoginPageView {...props} />
      </MemoryRouter>
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
    expect(markup).toContain('dark_mode')
  })

  it('renders light login on a pure surface without the dotted background class', () => {
    const markup = renderLogin('light')

    expect(markup).not.toContain('ff-light-login-bg')
    expect(markup).toContain('bg-[var(--ff-surface-base)]')
  })

  it('keeps light theme toggle outside the authentication card header', () => {
    const markup = renderLogin('light')
    const headingIndex = markup.indexOf('身份访问控制台')
    const contrastIndex = markup.indexOf('contrast')

    expect(headingIndex).toBeGreaterThan(-1)
    expect(contrastIndex).toBeGreaterThan(headingIndex)
    expect(contrastIndex - headingIndex).toBeGreaterThan(1800)
  })

  it('does not render the light login vertical watermark', () => {
    const markup = renderLogin('light')

    expect(markup).not.toContain('CONFIDENTIAL CLINICAL WORKFLOW ENVIRONMENT')
    expect(markup).not.toContain('AUTHENTICATION REQUIRED')
  })
})
