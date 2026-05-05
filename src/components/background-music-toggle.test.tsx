/**
 * [INPUT]: 依赖 node:fs 的源码合同检查，依赖 react-dom/server 的静态渲染，依赖 MemoryRouter、ThemeProvider、LocaleProvider、BackgroundAudioProvider、LoginPageView 与 ClinicalTopBar。
 * [OUTPUT]: 对外提供背景音乐简洁歌单入口的可访问语义、移动端满宽顶栏、短侧舱收回交互、透明材质与弹出动效回归测试。
 * [POS]: components 的背景音乐 UI 合同测试，约束登录页工具区与已登录壳层共用同一个音乐开关、移动端满宽顶栏、当前曲目、上一首/下一首入口、暂停文案、离开收回与半透明弹出短侧舱。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { LoginPageView, type LoginPageViewProps } from '@/components/login-page-view'
import { ClinicalTopBar } from '@/components/system/topbar'
import { copy, getCopy } from '@/lib/copy'
import { BackgroundAudioProvider } from '@/lib/background-audio'
import { LocaleProvider } from '@/lib/locale'
import { ThemeProvider } from '@/lib/theme'

const source = readFileSync(new URL('./background-music-toggle.tsx', import.meta.url), 'utf8')
const transitionsSource = readFileSync(new URL('../styles/transitions-dev.css', import.meta.url), 'utf8')
const shortDockPanelClass = source.match(/className="([^"]+)"\n\s+data-testid="background-music-short-dock"/)?.[1]

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
  it('labels paused audio as a simple resume action', () => {
    expect(getCopy(copy.backgroundAudio.aria.paused, 'zh')).toBe('背景音乐已暂停，点击继续播放')
    expect(copy.backgroundAudio.aria).not.toHaveProperty('off')
  })

  it('uses player-style play and pause icons instead of volume icons', () => {
    expect(source).toContain("blocked: 'play_arrow'")
    expect(source).toContain("paused: 'play_arrow'")
    expect(source).toContain("idle: 'pause'")
    expect(source).toContain("playing: 'pause'")
    expect(source).not.toContain("playing: 'volume_up'")
  })

  it('keeps the authenticated short dock panel translucent without fading text', () => {
    expect(shortDockPanelClass).toContain('bg-[color:color-mix(in_srgb,var(--ff-surface-panel)_54%,transparent)]')
    expect(shortDockPanelClass).toContain('supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--ff-surface-panel)_44%,transparent)]')
    expect(shortDockPanelClass).toContain('backdrop-blur-xl')
    expect(shortDockPanelClass).not.toMatch(/\bopacity-/)
  })

  it('collapses the short dock when the pointer leaves both trigger and panel, then opens it with a pop animation', () => {
    expect(source).toContain("window.addEventListener('pointermove', closeWhenPointerLeavesDock)")
    expect(source).toContain("window.removeEventListener('pointermove', closeWhenPointerLeavesDock)")
    expect(source).toContain('rootRef.current')
    expect(source).toContain('panelRef.current')
    expect(shortDockPanelClass).toContain('t-audio-popover')
    expect(transitionsSource).toContain('@keyframes t-audio-pop-in')
    expect(transitionsSource).toContain('.t-audio-popover')
  })

  it('renders in the login utility controls with text and accessible state', () => {
    const markup = renderLogin('dark')
    const utilityIndex = markup.indexOf('data-testid="login-page-utility-controls"')
    const musicIndex = markup.indexOf('data-testid="background-music-toggle"')

    expect(utilityIndex).toBeGreaterThan(-1)
    expect(musicIndex).toBeGreaterThan(utilityIndex)
    expect(markup).toContain('aria-label="背景音乐已开启，点击暂停"')
    expect(markup).toContain('data-audio-status="idle"')
    expect(markup).toContain('data-testid="background-music-current-track"')
    expect(markup).toContain('Nagisa Sakano Shitano Wakare')
    expect(markup).toContain('aria-label="上一首背景音乐"')
    expect(markup).toContain('aria-label="下一首背景音乐"')
    expect(markup).toContain('>音乐</span>')
  })

  it('renders in the authenticated top bar as a collapsed short dock trigger', () => {
    const markup = withProviders(<ClinicalTopBar theme="light" title="病程整理台" withRail />)

    expect(markup).toContain('left-0 w-screen md:left-[var(--ff-sidebar-offset)] md:w-[calc(100%-var(--ff-sidebar-offset))]')
    expect(markup).toContain('data-testid="background-music-toggle"')
    expect(markup).toContain('aria-label="打开背景音乐控制"')
    expect(markup).toContain('aria-haspopup="dialog"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('data-audio-status="idle"')
    expect(markup).toContain('data-background-music-layout="short-dock"')
    expect(markup).not.toContain('data-background-music-layout="popover"')
    expect(markup).toContain('>pause</span>')
    expect(markup).not.toContain('>音乐</span>')
    expect(markup).not.toContain('data-testid="background-music-current-track"')
    expect(markup).not.toContain('Nagisa Sakano Shitano Wakare')
    expect(markup).not.toContain('aria-label="上一首背景音乐"')
    expect(markup).not.toContain('aria-label="下一首背景音乐"')
  })
})
