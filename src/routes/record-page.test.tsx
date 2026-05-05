/**
 * [INPUT]: 依赖 node:fs 的源码合同检查，依赖 react-dom/server 的静态渲染，依赖 react-router-dom 的 MemoryRouter，依赖 vitest 的模块 mock，依赖 BackgroundAudioProvider、./record-page、./record-page.view 与 ./record-page.logic。
 * [OUTPUT]: 对外提供病例详情页响应式版心、dossier/Gantt 切换与导出职责回归测试。
 * [POS]: routes 的病例详情测试文件，约束 /record/:id 使用 V3 宽幅 shell 合同而不是旧 980px 固定画布，承接背景音 topbar、Gantt 备用视图与 PDF/PNG 正式导出入口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'
import { createRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BackgroundAudioProvider } from '@/lib/background-audio'
import { LocaleProvider } from '@/lib/locale'
import { shellWideContentClass } from '@/lib/theme/tokens'
import type { PatientRecord } from '@/types/patient'

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
import { RecordPageContent } from './record-page.view'
import type { RecordExportState, RecordViewMode } from './record-page.view'
import type { RecordLoadState } from './record-page.logic'

function readRecordRouteSource() {
  return ['./record-page.tsx', './record-page.logic.ts'].map((file) => readFileSync(new URL(file, import.meta.url), 'utf8')).join('\n')
}

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

function renderRecordContent({
  demoRoute = false,
  record,
  viewMode,
}: {
  demoRoute?: boolean
  record?: PatientRecord
  viewMode: RecordViewMode
}) {
  const exportState: RecordExportState = {
    error: null,
    format: null,
    isExporting: false,
  }
  const activeRecordLoadState: RecordLoadState = {
    error: null,
    isLoading: false,
    record: record ?? null,
    recordId: record?.id ?? null,
  }

  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[demoRoute ? '/record/demo' : '/record/patient-42']}>
      <RecordPageContent
        activeRecordLoadState={activeRecordLoadState}
        demoRoute={demoRoute}
        exportState={exportState}
        locale="zh"
        onExport={() => undefined}
        onViewModeChange={() => undefined}
        recordRef={createRef<HTMLDivElement>()}
        viewMode={viewMode}
      />
    </MemoryRouter>,
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

  it('exposes a dossier/Gantt view switch on demo records', () => {
    const markup = renderRecord('light')

    expect(markup).toContain('档案视图')
    expect(markup).toContain('甘特图视图')
  })

  it('renders the Gantt view for demo records through the record content layer', () => {
    const markup = renderRecordContent({
      demoRoute: true,
      viewMode: 'gantt',
    })

    expect(markup).toContain('治疗线甘特图')
    expect(markup).toContain('奥希替尼')
    expect(markup).toContain('当前治疗线')
  })

  it('renders the Gantt view for persisted records without demo fallback values', () => {
    const markup = renderRecordContent({
      record: {
        basicInfo: { tumorType: 'NSCLC' },
        id: 'patient-42',
        treatmentLines: [
          { endDate: '2024-02', lineNumber: 1, regimen: 'Real first line', startDate: '2023-05' },
          { lineNumber: 2, regimen: 'Real current line', startDate: '2024-03' },
        ],
      },
      viewMode: 'gantt',
    })

    expect(markup).toContain('Real first line')
    expect(markup).toContain('Real current line')
    expect(markup).not.toContain('张三')
  })

  it('renders lab trends for persisted records on the dossier view', () => {
    const markup = renderRecordContent({
      record: {
        id: 'patient-42',
        labResults: [
          { category: 'tumor-marker', itemCode: 'cea', itemName: 'CEA', testDate: '2024-01-01', value: 8.1, unit: 'ng/mL' },
          { category: 'tumor-marker', itemCode: 'cea', itemName: 'CEA', testDate: '2024-02-01', value: 9.3, unit: 'ng/mL' },
        ],
        treatmentLines: [],
      },
      viewMode: 'dossier',
    })

    expect(markup).toContain('实验室趋势')
    expect(markup).toContain('持续增高')
  })

  it('keeps export actions scoped to the dossier view instead of the active Gantt view', () => {
    const record: PatientRecord = {
      id: 'patient-42',
      treatmentLines: [{ endDate: '2024-02', lineNumber: 1, regimen: 'Real first line', startDate: '2023-05' }],
    }
    const dossierMarkup = renderRecordContent({ record, viewMode: 'dossier' })
    const ganttMarkup = renderRecordContent({ record, viewMode: 'gantt' })

    expect(dossierMarkup).toContain('导出 PDF')
    expect(dossierMarkup).toContain('导出 PNG')
    expect(ganttMarkup).toContain('治疗线甘特图')
    expect(ganttMarkup).not.toContain('导出 PDF')
    expect(ganttMarkup).not.toContain('导出 PNG')
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
    const source = readRecordRouteSource()

    expect(source).toContain('loadPatientRecordById(id)')
    expect(source).toContain('recordLoadState.record')
    expect(source).not.toContain("const isDemoRecord = id === 'demo'")
  })
})
