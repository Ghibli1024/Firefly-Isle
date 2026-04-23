/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染，依赖 react-router-dom 的 MemoryRouter，依赖 vitest 的模块 mock，依赖 ./workspace-page。
 * [OUTPUT]: 对外提供工作区报告预览壳层回归测试。
 * [POS]: routes 的工作区测试文件，约束 /app 报告区不再渲染多余总标题壳。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/locale'

let currentTheme: 'light' | 'dark' = 'light'
const localeStorage = new Map<string, string>()

const localStorageMock = {
  getItem: (key: string) => localeStorage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    localeStorage.set(key, value)
  },
  removeItem: (key: string) => {
    localeStorage.delete(key)
  },
}

vi.stubGlobal('localStorage', localStorageMock)
vi.stubGlobal('window', { localStorage: localStorageMock })

function setLocale(locale: 'zh' | 'en') {
  localeStorage.set('firefly-locale', locale)
}

function resetLocale() {
  localeStorage.clear()
}

beforeEach(() => {
  resetLocale()
})

afterEach(() => {
  resetLocale()
})


vi.mock('@/lib/theme', () => ({
  useTheme: () => ({ theme: currentTheme }),
}))

vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth')
  return {
    ...actual,
    useAuth: () => ({
      authError: null,
      isAuthenticated: true,
      isAuthReady: true,
      isSigningOut: false,
      session: null,
      signOut: vi.fn(),
      user: { id: 'user-1', is_anonymous: true },
    }),
  }
})

import { WorkspacePage } from './workspace-page'

function renderWorkspace(theme: 'light' | 'dark') {
  currentTheme = theme
  return renderToStaticMarkup(
    <LocaleProvider>
      <MemoryRouter>
        <WorkspacePage isSigningOut={false} onSignOut={() => undefined} userLabel="ANON_SESSION" />
      </MemoryRouter>
    </LocaleProvider>,
  )
}

describe('WorkspacePage report shell', () => {
  it.each(['light', 'dark'] as const)('does not render the outer 临床结构化报告 heading shell in %s mode', (theme) => {
    const markup = renderWorkspace(theme)

    expect(markup).not.toContain('临床结构化报告')
    expect(markup).toContain('治疗时间线表格')
  })

  it('renders workspace support copy in English when locale is en', () => {
    setLocale('en')
    const markup = renderWorkspace('light')

    expect(markup).toContain('Clinical Notes')
    expect(markup).toContain('Verified by AI Agent')
    expect(markup).not.toContain('仍待补充：')
  })

  it('renders workspace support copy in Chinese when locale is zh', () => {
    setLocale('zh')
    const markup = renderWorkspace('light')

    expect(markup).toContain('临床备注')
    expect(markup).toContain('AI 助手已校验')
    expect(markup).not.toContain('Clinical Notes')
  })
})
