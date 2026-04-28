/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染，依赖 react-router-dom 的 MemoryRouter，依赖 vitest 的模块 mock，依赖 ./workspace-page。
 * [OUTPUT]: 对外提供工作区报告预览、输入 composer、侧栏壳层、职责边界与 locale 回归测试。
 * [POS]: routes 的工作区测试文件，约束 /app 报告区复刻病历预览主表面、单一主提取动作、无正式导出入口、textarea 输入工具行、无装饰性状态卡侧栏、无右侧 active 亮条导航、紧凑默认侧栏弹出态、隐藏态左缘渐进拉出与拖拽到隐藏。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'
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
import { ReportPreviewFrame } from '@/components/workspace/report-preview-frame'
import type { PatientRecord } from '@/types/patient'

function renderWorkspace(theme: 'light' | 'dark') {
  currentTheme = theme
  return renderToStaticMarkup(
    <LocaleProvider>
      <MemoryRouter initialEntries={['/app']}>
        <WorkspacePage isSigningOut={false} onSignOut={() => undefined} userLabel="ANON_SESSION" />
      </MemoryRouter>
    </LocaleProvider>,
  )
}

function readSidebarSource() {
  return readFileSync(new URL('../components/system/sidebar-nav.tsx', import.meta.url), 'utf8')
}

describe('WorkspacePage report shell', () => {
  it.each(['light', 'dark'] as const)('does not render the outer 临床结构化报告 heading shell in %s mode', (theme) => {
    const markup = renderWorkspace(theme)

    expect(markup).not.toContain('临床结构化报告')
    expect(markup).toContain('病历预览')
  })

  it('renders one primary extraction action and no discarded V3 control blocks in light mode', () => {
    const markup = renderWorkspace('light')

    expect(markup.match(/开始结构化提取/g)?.length).toBe(1)
    expect(markup).not.toContain('语音录入')
    expect(markup).not.toContain('当前参数')
  })

  it('keeps formal PDF and PNG export actions out of /app', () => {
    const markup = renderWorkspace('light')

    expect(markup).not.toContain('导出 PDF')
    expect(markup).not.toContain('导出 PNG')
  })

  it('keeps file import, voice and character count inside the textarea tool row', () => {
    const markup = renderWorkspace('light')

    expect(markup).toContain('id="patient-history-input"')
    expect(markup).toContain('导入病历文件')
    expect(markup).toContain('>mic</span>')
    expect(markup).toContain('0 / 8000')
    expect(markup).not.toContain('type="file"')
  })

  it('keeps record navigation out of the preview frame while preserving the export ref', () => {
    const record: PatientRecord = {
      basicInfo: { age: 63, stage: 'IV', tumorType: 'NSCLC' },
      id: 'patient-42',
      treatmentLines: [{ lineNumber: 1, regimen: 'Osimertinib' }],
    }
    let reportNode: HTMLDivElement | null = null

    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ReportPreviewFrame
          isExtracting={false}
          isSaving={false}
          onCommitField={() => undefined}
          record={record}
          remainingMissing={[]}
          setReportRef={(node) => {
            reportNode = node
          }}
          theme="light"
        />
      </LocaleProvider>,
    )

    expect(reportNode).toBeNull()
    expect(markup).toContain('病历预览')
    expect(markup).not.toContain('href="/record/patient-42"')
    expect(markup).not.toContain('查看病历')
  })

  it('does not render the decorative sidebar system-status card', () => {
    const zhMarkup = renderWorkspace('light')

    expect(zhMarkup).not.toContain('运行正常')

    setLocale('en')
    const enMarkup = renderWorkspace('light')

    expect(enMarkup).not.toContain('Operational')
    expect(enMarkup).toContain('System Ready')
  })

  it('keeps active sidebar navigation free of inset card highlights and edge rails', () => {
    const markup = renderWorkspace('light')

    expect(markup).toMatch(/<a[^>]*class="[^"]*text-\[var\(--ff-accent-primary\)\][^"]*"[^>]*href="\/app"/)
    expect(markup).not.toContain('bg-[linear-gradient(90deg,color-mix(in_srgb,var(--ff-accent-primary)_18%,transparent)')
    expect(markup).not.toContain('absolute left-0 top-0 h-full w-[3px] bg-[var(--ff-accent-primary)]')
    expect(markup).not.toContain('absolute right-0 top-0 h-full w-[3px] bg-[var(--ff-accent-primary)]')
  })

  it('uses semantically specific Material icons for sidebar record and language actions', () => {
    const markup = renderWorkspace('light')

    expect(markup).toContain('>g_translate</span>')
    expect(markup).toContain('>clinical_notes</span>')
    expect(markup).not.toContain('>folder</span>')
    expect(markup).not.toContain('>translate</span>')
    expect(markup).not.toContain('>language</span>')
    expect(markup).not.toContain('>expand_more</span>')
  })

  it('keeps the hidden-sidebar restore handle narrow', () => {
    const sidebarSource = readSidebarSource()

    expect(sidebarSource).toContain('w-[14px]')
    expect(sidebarSource).toContain('hover:w-[18px]')
    expect(sidebarSource).not.toContain('w-5 -translate-y-1/2')
    expect(sidebarSource).not.toContain('hover:w-7')
  })

  it('supports gradual left-edge reveal and drag-to-hide sidebar behavior', () => {
    const sidebarSource = readSidebarSource()

    expect(sidebarSource).toContain('HIDDEN_EDGE_HIT_WIDTH')
    expect(sidebarSource).toContain('HIDDEN_SWIPE_VERTICAL_TOLERANCE')
    expect(sidebarSource).toContain('onPointerDown={startHiddenSwipe}')
    expect(sidebarSource).toContain('onMouseDown={startHiddenMouseSwipe}')
    expect(sidebarSource).toContain('const nextWidth = clampSidebarWidth(dragState.width)')
    expect(sidebarSource).toContain('setWidth(nextWidth)')
    expect(sidebarSource).toContain('rawWidth <= HIDDEN_EDGE_HIT_WIDTH')
    expect(sidebarSource).toContain("title={locale === 'zh' ? '显示侧边栏，或从左向右滑出'")
    expect(sidebarSource).toContain('h-screen w-10 touch-none')
  })

  it('ignores pre-compact and undersized sidebar width cache when rendering the default expanded sidebar', () => {
    localeStorage.set('firefly-sidebar-width', '296')
    localeStorage.set('firefly-sidebar-expanded-width', '296')
    localeStorage.set('firefly-sidebar-expanded-width-v2', '245')
    localeStorage.set('firefly-sidebar-expanded-width-v3', '245')
    localeStorage.set('firefly-sidebar-expanded-width-v4', '296')

    const markup = renderWorkspace('light')

    expect(markup).toContain('style="width:148px"')
    expect(markup).not.toContain('style="width:296px"')
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
    expect(markup).toContain('AI 验证状态')
    expect(markup).toContain('未开始验证')
    expect(markup).not.toContain('Clinical Notes')
  })
})
