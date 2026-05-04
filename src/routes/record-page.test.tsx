/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染，依赖 react-router-dom 的 MemoryRouter，依赖 vitest 的模块 mock，依赖 BackgroundAudioProvider 与 ./record-page。
 * [OUTPUT]: 对外提供病例详情页响应式版心与导出职责回归测试。
 * [POS]: routes 的病例详情测试文件，约束 /record/:id 使用 V3 宽幅 shell 合同而不是旧 980px 固定画布，承接背景音 topbar 依赖与 PDF/PNG 正式导出入口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BackgroundAudioProvider } from '@/lib/background-audio'
import { LocaleProvider } from '@/lib/locale'
import { shellWideContentClass } from '@/lib/theme/tokens'

let currentTheme: 'light' | 'dark' = 'light'
const localStorageState = new Map<string, string>()

const localStorageMock = {
  getItem: (key: string) => localStorageState.get(key) ?? null,
  removeItem: (key: string) => {
    localStorageState.delete(key)
  },
  setItem: (key: string, value: string) => {
    localStorageState.set(key, value)
  },
}

vi.stubGlobal('localStorage', localStorageMock)
vi.stubGlobal('window', { localStorage: localStorageMock })

beforeEach(() => {
  localStorageState.clear()
})

afterEach(() => {
  localStorageState.clear()
})

vi.mock('@/lib/theme', async () => {
  const actual = await vi.importActual<typeof import('@/lib/theme')>('@/lib/theme')

  return {
    ...actual,
    useTheme: () => ({
      theme: currentTheme,
      toggleTheme: vi.fn(),
    }),
  }
})

import { RecordPage } from './record-page'

function renderRecord(theme: 'light' | 'dark', initialEntry = '/record/demo') {
  currentTheme = theme

  return renderToStaticMarkup(
    <LocaleProvider>
      <BackgroundAudioProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/record/:id" element={<RecordPage isSigningOut={false} onSignOut={() => undefined} userLabel="ANON_SESSION" />} />
          </Routes>
        </MemoryRouter>
      </BackgroundAudioProvider>
    </LocaleProvider>,
  )
}

describe('RecordPage responsive dossier shell', () => {
  it.each(['light', 'dark'] as const)('uses the shared wide shell contract in %s mode', (theme) => {
    const markup = renderRecord(theme)

    expect(markup).toContain('data-testid="record-responsive-canvas"')
    expect(markup).toContain(shellWideContentClass)
    expect(markup).not.toContain('max-w-[980px]')
  })

  it('keeps the evidence column responsive instead of locking it to one desktop width', () => {
    const markup = renderRecord('light')

    expect(markup).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(260px,32%)]')
    expect(markup).toContain('2xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]')
  })

  it('places PDF and PNG export actions on the record page', () => {
    const markup = renderRecord('light', '/record/patient-42')

    expect(markup).toContain('导出 PDF')
    expect(markup).toContain('导出 PNG')
  })

  it('does not allow demo fallback export before a real saved record is loaded', () => {
    const markup = renderRecord('light')

    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*导出 PDF/)
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*导出 PNG/)
  })

  it('does not show static demo patient content for arbitrary record ids before loading data', () => {
    const markup = renderRecord('light', '/record/patient-42')

    expect(markup).toContain('正在载入病历')
    expect(markup).not.toContain('张三')
    expect(markup).not.toContain('EGFR L858R')
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*导出 PDF/)
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*导出 PNG/)
  })

  it('routes real record ids through the Supabase record loader instead of the demo gate', () => {
    const source = readFileSync(new URL('./record-page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('loadPatientRecordById(id)')
    expect(source).toContain('recordLoadState.record')
    expect(source).not.toContain("const isDemoRecord = id === 'demo'")
  })
})
