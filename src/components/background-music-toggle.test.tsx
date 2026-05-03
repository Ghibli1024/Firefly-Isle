/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染，依赖 MemoryRouter、ThemeProvider、LocaleProvider、BackgroundAudioProvider、LoginPageView 与 ClinicalTopBar。
 * [OUTPUT]: 对外提供背景音乐简洁歌单入口的可访问语义回归测试。
 * [POS]: components 的背景音乐 UI 合同测试，约束登录页工具区与已登录壳层共用同一个音乐开关、当前曲目与上一首/下一首入口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { LoginPageView, type LoginPageViewProps } from '@/components/login-page-view'
import { ClinicalTopBar } from '@/components/system/topbar'
import { BackgroundAudioProvider } from '@/lib/background-audio'
import { LocaleProvider } from '@/lib/locale'
import { ThemeProvider } from '@/lib/theme'

function withProviders(children: ReactNode) {
  return renderToStaticMarkup(
    <ThemeProvider>
      <LocaleProvider>
        <BackgroundAudioProvider>{children}</BackgroundAudioProvider>
      </LocaleProvider>
    </ThemeProvider>,
  )
}

function renderLogin(theme: LoginPageViewProps['theme']) {
  return withProviders(
    <MemoryRouter>
      <LoginPageView
        authMethod="email"
        email=""
        feedback={null}
        isSubmitting={false}
        mode="login"
        onAnonymousLogin={vi.fn()}
        onAuthMethodChange={vi.fn()}
        onEmailChange={vi.fn()}
        onGoogleLogin={vi.fn()}
        onModeChange={vi.fn()}
        onPasswordChange={vi.fn()}
        onSubmit={vi.fn()}
        onToggleTheme={vi.fn()}
        password=""
        theme={theme}
      />
    </MemoryRouter>,
  )
}

describe('BackgroundMusicToggle shell placement', () => {
  it('renders in the login utility controls with text and accessible state', () => {
    const markup = renderLogin('dark')
    const utilityIndex = markup.indexOf('data-testid="login-page-utility-controls"')
    const musicIndex = markup.indexOf('data-testid="background-music-toggle"')

    expect(utilityIndex).toBeGreaterThan(-1)
    expect(musicIndex).toBeGreaterThan(utilityIndex)
    expect(markup).toContain('aria-label="背景音乐已开启，点击关闭"')
    expect(markup).toContain('data-audio-status="idle"')
    expect(markup).toContain('data-testid="background-music-current-track"')
    expect(markup).toContain('Nagisa Sakano Shitano Wakare')
    expect(markup).toContain('aria-label="上一首背景音乐"')
    expect(markup).toContain('aria-label="下一首背景音乐"')
    expect(markup).toContain('>音乐</span>')
  })

  it('renders in the authenticated top bar as a collapsed short dock trigger', () => {
    const markup = withProviders(<ClinicalTopBar theme="light" title="病程整理台" withRail />)

    expect(markup).toContain('data-testid="background-music-toggle"')
    expect(markup).toContain('aria-label="打开背景音乐控制"')
    expect(markup).toContain('aria-haspopup="dialog"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('data-audio-status="idle"')
    expect(markup).toContain('data-background-music-layout="short-dock"')
    expect(markup).not.toContain('data-background-music-layout="popover"')
    expect(markup).toContain('>volume_up</span>')
    expect(markup).not.toContain('>音乐</span>')
    expect(markup).not.toContain('data-testid="background-music-current-track"')
    expect(markup).not.toContain('Nagisa Sakano Shitano Wakare')
    expect(markup).not.toContain('aria-label="上一首背景音乐"')
    expect(markup).not.toContain('aria-label="下一首背景音乐"')
  })
})
