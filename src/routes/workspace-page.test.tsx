/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染，依赖 react-router-dom 的 MemoryRouter，依赖 vitest 的模块 mock，依赖 BackgroundAudioProvider 与 ./workspace-page。
 * [OUTPUT]: 对外提供工作区报告预览、输入 composer、侧栏壳层、职责边界、Transitions.dev 动效与 locale 回归测试。
 * [POS]: routes 的工作区测试文件，约束 /app 报告区复刻病历预览主表面、单一主提取动作、无正式导出入口、textarea 输入工具行、提取/追问/缺失数字动效、背景音 topbar 依赖、创作初衷纸页入口、邮件联系入口、中英艺术字标、无装饰性状态卡侧栏、统计敬请期待按钮、主题/语言顺序、无右侧 active 亮条导航、紧凑默认侧栏弹出态、隐藏态左缘渐进拉出与拖拽到隐藏。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BackgroundAudioProvider } from '@/lib/background-audio'
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
import { ExtractionComposer } from '@/components/workspace/extraction-composer'
import { FollowUpPanel } from '@/components/workspace/follow-up-panel'
import { ReportPreviewFrame } from '@/components/workspace/report-preview-frame'
import type { PatientRecord } from '@/types/patient'

function renderWorkspace(
  theme: 'light' | 'dark',
  options: { userIsAnonymous?: boolean; userLabel?: string } = {},
) {
  currentTheme = theme
  return renderToStaticMarkup(
    <LocaleProvider>
      <BackgroundAudioProvider>
        <MemoryRouter initialEntries={['/app']}>
          <WorkspacePage
            isSigningOut={false}
            onSignOut={() => undefined}
            userIsAnonymous={options.userIsAnonymous ?? true}
            userLabel={options.userLabel ?? 'ANON_SESSION'}
          />
        </MemoryRouter>
      </BackgroundAudioProvider>
    </LocaleProvider>,
  )
}

function readSidebarSource() {
  return readFileSync(new URL('../components/system/sidebar-nav.tsx', import.meta.url), 'utf8')
}

function readTopbarSource() {
  return readFileSync(new URL('../components/system/topbar.tsx', import.meta.url), 'utf8')
}

function readExtractionComposerSource() {
  return readFileSync(new URL('../components/workspace/extraction-composer.tsx', import.meta.url), 'utf8')
}

function readOriginStoryPaperSource() {
  return readFileSync(new URL('../components/system/origin-story-paper.tsx', import.meta.url), 'utf8')
}

function readCopySource() {
  return readFileSync(new URL('../lib/copy.ts', import.meta.url), 'utf8')
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
    expect(markup).toContain('maxLength="8000"')
    expect(markup).toContain('导入病历文件')
    expect(markup).toContain('>mic</span>')
    expect(markup).toContain('0 / 8000')
    expect(markup).not.toContain('type="file"')
  })

  it('marks import and voice tools as coming-soon actions until those inputs exist', () => {
    const markup = renderWorkspace('light')

    expect(markup).toContain('data-input-tool="import-record-file"')
    expect(markup).toContain('data-input-tool="voice-input"')
    expect(markup).toContain('title="导入病历文件暂未开放"')
    expect(markup).toContain('title="语音输入暂未开放"')
  })

  it('uses Transitions.dev motion for extraction status changes', () => {
    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ExtractionComposer
          error={null}
          extractionInput="患者 2024 年开始治疗"
          isExtracting
          isSaving={false}
          onExtract={() => undefined}
          onInputChange={() => undefined}
          onRetry={() => undefined}
          remainingMissingCount={2}
          retryMode={null}
          theme="light"
        />
      </LocaleProvider>,
    )

    expect(markup).toContain('t-icon-swap')
    expect(markup).toContain('data-state="b"')
    expect(markup).toContain('data-icon="a"')
    expect(markup).toContain('data-icon="b"')
    expect(markup).toContain('t-text-swap')
  })

  it('keeps the primary extraction action text visible during text-swap transitions', () => {
    const source = readExtractionComposerSource()

    expect(source).toContain('t-text-swap')
    expect(source).not.toContain('is-enter-start')
  })

  it('reveals follow-up questions with the shared panel-slide transition', () => {
    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <FollowUpPanel currentQuestion="请补充治疗方案。" onSubmit={() => undefined} theme="light" />
      </LocaleProvider>,
    )

    expect(markup).toContain('t-panel-slide')
    expect(markup).toContain('data-open="true"')
    expect(markup).toContain('请补充治疗方案。')
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

  it('does not render demo demographic values as missing real patient fields', () => {
    const record: PatientRecord = {
      treatmentLines: [],
    }

    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ReportPreviewFrame
          isExtracting={false}
          isSaving={false}
          onCommitField={() => undefined}
          record={record}
          remainingMissing={[]}
          setReportRef={() => undefined}
          theme="light"
        />
      </LocaleProvider>,
    )

    expect(markup).not.toContain('张三')
    expect(markup).not.toContain('56 岁')
    expect(markup).not.toContain('>女<')
  })

  it('rolls back optimistic follow-up data when persistence fails', () => {
    const source = readFileSync(new URL('./workspace-page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('const previousRecord = state.record')
    expect(source).toContain('record: previousRecord')
    expect(source).toContain('remainingMissing: getMissingCriticalFields(previousRecord)')
  })

  it('animates missing-field counts with Transitions.dev digit pop-in classes', () => {
    const record: PatientRecord = {
      basicInfo: { age: 63 },
      treatmentLines: [],
    }

    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ReportPreviewFrame
          followUpCount={1}
          isExtracting={false}
          isSaving={false}
          onCommitField={() => undefined}
          record={record}
          remainingMissing={['肿瘤类型', '分期', '治疗方案']}
          setReportRef={() => undefined}
          theme="light"
        />
      </LocaleProvider>,
    )

    expect(markup).toContain('t-digit-group')
    expect(markup).toContain('is-animating')
    expect(markup).toContain('t-digit')
    expect(markup).toContain('待补充')
    expect(markup).toContain('第')
  })

  it('does not render the decorative sidebar system-status card', () => {
    const zhMarkup = renderWorkspace('light')

    expect(zhMarkup).not.toContain('运行正常')

    setLocale('en')
    const enMarkup = renderWorkspace('light')

    expect(enMarkup).not.toContain('Operational')
    expect(enMarkup).toContain('System Ready')
  })

  it('turns the topbar settings placeholder into a mail contact disclosure', () => {
    const markup = renderWorkspace('light')
    const topbarSource = readTopbarSource()

    expect(markup).toMatch(/<button[^>]*aria-controls="topbar-contact-card"[^>]*aria-expanded="false"[^>]*aria-label="联系我"[^>]*data-topbar-action="contact"/)
    expect(markup).toContain('title="联系方式"')
    expect(markup).toContain('>mail</span>')
    expect(markup).not.toContain('>settings</span>')
    expect(markup).not.toContain('设置，敬请期待')
    expect(topbarSource).toContain('topbar-contact-card')
    expect(topbarSource).toContain('小生才疏学浅，有任何问题都可以通过')
    expect(topbarSource).toContain('font-black text-[var(--ff-accent-primary)]')
    expect(topbarSource).toContain('ghibli1024@gmail.com')
  })

  it('renders the sidebar brand title as an artistic wordmark', () => {
    localeStorage.set('firefly-sidebar-expanded-width-v5', '220')
    const markup = renderWorkspace('dark')
    const sidebarSource = readSidebarSource()

    expect(markup).toContain('data-brand-art-wordmark="true"')
    expect(markup).toContain('data-brand-wordmark="true"')
    expect(markup).toContain('data-brand-firefly-glow="true"')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('一页<span')
    expect(markup).toContain('萤</span>屿')
    expect(markup).not.toContain('Firefly Isle')
    expect(sidebarSource).toContain('fontFamily: \'"STXingkai SC", "Xingkai SC", "STKaiti", "Kaiti SC", "Kai", serif\'')
    expect(sidebarSource).toContain("transform: 'scaleX(0.86)'")
    expect(sidebarSource).toContain("textShadow: '.35px 0 var(--ff-accent-primary), 0 0 12px rgba(232,93,42,0.28)'")
    expect(sidebarSource).toContain('fireflyGlyphAuraStyle')
    expect(sidebarSource).toContain('radial-gradient(circle at 58% 50%, color-mix(in srgb, var(--ff-accent-primary) 44%, transparent)')
    expect(sidebarSource).toContain("filter: 'blur(4px)'")
    expect(sidebarSource).toContain("inset: '-0.12em -0.08em -0.08em -0.1em'")
    expect(sidebarSource).not.toContain("filter: 'blur(7px)'")
    expect(sidebarSource).toContain('w-32 max-w-full')
    expect(sidebarSource).not.toContain('w-14 max-w-full')
    expect(sidebarSource).not.toContain('STXingkai_SC')
  })

  it('renders only the English brand wordmark when locale is English', () => {
    localeStorage.set('firefly-sidebar-expanded-width-v5', '220')
    setLocale('en')
    const markup = renderWorkspace('dark')
    const sidebarSource = readSidebarSource()

    expect(markup).toContain('data-brand-art-wordmark="true"')
    expect(markup).toContain('data-brand-wordmark="true"')
    expect(markup).toContain('data-brand-firefly-glow="true"')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('Firefly</span> Isle')
    expect(sidebarSource).toContain('fontFamily: \'"Snell Roundhand", "Savoye LET", "Apple Chancery", cursive\'')
    expect(sidebarSource).toContain("lineHeight: '1.08'")
    expect(sidebarSource).toContain("paddingBottom: '0.18em'")
    expect(sidebarSource).toContain("transform: 'translateY(2px)'")
    expect(sidebarSource).toContain("'overflow-visible whitespace-nowrap text-[29px] font-bold tracking-normal'")
    expect(sidebarSource).not.toContain('"Avenir Next", "Trebuchet MS", system-ui, sans-serif')
    expect(markup).not.toContain('一页')
    expect(markup).not.toContain('萤</span>屿')
  })

  it('keeps active sidebar navigation free of inset card highlights and edge rails', () => {
    const markup = renderWorkspace('light')

    expect(markup).toMatch(/<a[^>]*class="[^"]*text-\[var\(--ff-accent-primary\)\][^"]*"[^>]*href="\/app"/)
    expect(markup).not.toContain('bg-[linear-gradient(90deg,color-mix(in_srgb,var(--ff-accent-primary)_18%,transparent)')
    expect(markup).not.toContain('absolute left-0 top-0 h-full w-[3px] bg-[var(--ff-accent-primary)]')
    expect(markup).not.toContain('absolute right-0 top-0 h-full w-[3px] bg-[var(--ff-accent-primary)]')
  })

  it('uses the display font for expanded sidebar menu labels', () => {
    localeStorage.set('firefly-sidebar-expanded-width-v5', '220')
    const markup = renderWorkspace('light')
    const sidebarSource = readSidebarSource()

    expect(sidebarSource).toContain("font-[var(--ff-font-display)]`")
    expect(markup).toMatch(/<span class="[^"]*font-\[var\(--ff-font-display\)\][^"]*">提取<\/span>/)
    expect(markup).toMatch(/<span class="[^"]*font-\[var\(--ff-font-display\)\][^"]*">主题<\/span>/)
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

  it('keeps the sidebar theme control above the language control with short labels', () => {
    const markup = renderWorkspace('light')

    expect(markup).toContain('>主题</span>')
    expect(markup).toContain('>语言</span>')
    expect(markup).not.toContain('>中文</span>')
    expect(markup).not.toContain('>切换主题</span>')
    expect(markup.indexOf('>dark_mode</span>')).toBeLessThan(markup.indexOf('>g_translate</span>'))
  })

  it('uses the person icon for non-anonymous authenticated identities', () => {
    const markup = renderWorkspace('light', {
      userIsAnonymous: false,
      userLabel: 'ghibli1024@gmail.com',
    })

    expect(markup).toMatch(/<div[^>]*aria-label="ghibli1024@gmail\.com"[^>]*>[\s\S]*?>person<\/span>/)
    expect(markup).not.toMatch(/<div[^>]*aria-label="ghibli1024@gmail\.com"[^>]*>[\s\S]*?>theater_comedy<\/span>/)
  })

  it('keeps the theater mask icon for anonymous identities', () => {
    const markup = renderWorkspace('light', {
      userIsAnonymous: true,
      userLabel: 'ANON_SESSION',
    })

    expect(markup).toMatch(/<div[^>]*aria-label="ANON_SESSION"[^>]*>[\s\S]*?>theater_comedy<\/span>/)
  })

  it('turns analytics into a coming-soon button instead of a route jump', () => {
    const markup = renderWorkspace('light')
    const sidebarSource = readSidebarSource()
    const copySource = readCopySource()

    expect(markup).toMatch(/<button[^>]*aria-label="统计"[^>]*data-nav-action="coming-soon"/)
    expect(markup).not.toContain('href="/login"')
    expect(sidebarSource).not.toContain("href: '/login'")
    expect(sidebarSource).toContain('onClick={showComingSoon}')
    expect(sidebarSource).toContain('onPointerLeave={hideComingSoon}')
    expect(sidebarSource).toContain('}, 3000)')
    expect(sidebarSource).toContain('role="status"')
    expect(copySource).toContain("comingSoon: text('敬请期待', 'Coming Soon')")
  })

  it('wires the help button to the origin story paper instead of a passive icon', () => {
    const topbarSource = readTopbarSource()

    expect(topbarSource).toContain('OriginStoryPaper')
    expect(topbarSource).toContain('originStoryOpen')
    expect(topbarSource).toContain("title={locale === 'zh' ? '为什么做一页萤屿' : 'Why Firefly Isle'}")
    expect(topbarSource).toContain("aria-label={locale === 'zh' ? '为什么做一页萤屿' : 'Why Firefly Isle'}")
  })

  it('keeps the origin story footer focused on Liu Lv and tango always on', () => {
    const source = readOriginStoryPaperSource()

    expect(source).toContain('作者是一位律师，大家习惯称呼为刘律')
    expect(source).toContain('至今依旧在为患者朋友们无偿解答疑惑')
    expect(source).toContain('如果出版我也会第一时间附上阅读链接')
    expect(source).toContain('爱一直在那里，tango always on')
    expect(source).toContain('愿每一段治疗经历，都能被清楚整理、温柔保存')
  })

  it('centers the origin story paper and removes decorative close furniture', () => {
    const source = readOriginStoryPaperSource()

    expect(source).toContain('const shellLeft =')
    expect(source).toContain('const availableWidth = window.innerWidth - shellLeft')
    expect(source).toContain('const left = Math.round(shellLeft + (availableWidth - width) / 2)')
    expect(source).not.toContain('const centerX = anchor ? anchor.left + anchor.width / 2 : window.innerWidth / 2')
    expect(source).toContain('data-origin-story-close-minimal')
    expect(source).toContain('h-px w-px')
    expect(source).toContain('opacity-0')
    expect(source).toContain('focus:opacity-100')
    expect(source).toContain('right-4 top-4')
    expect(source).not.toContain('data-origin-story-close-fold')
    expect(source).not.toContain('data-origin-story-close-pin')
    expect(source).not.toContain("clipPath: 'polygon(100% 0, 100% 100%, 0 0)'")
    expect(source).not.toContain("filter: 'drop-shadow(-4px 6px 5px rgba(62,44,25,0.12))'")
    expect(source).not.toContain('radial-gradient(circle at 34% 28%')
    expect(source).not.toContain('rotate-45')
    expect(source).not.toContain('-rotate-45')
    expect(source).not.toContain('h-[76px] w-[76px]')
    expect(source).not.toContain('h-[62px] w-[62px]')
    expect(source).not.toContain('<span>关闭</span>')
    expect(source).not.toContain('Close</span>')
    expect(source).not.toContain('rounded-full border border-[#d9cdb8]')
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

  it('persists new patient rows under the authenticated Supabase user id for every auth provider', () => {
    const source = readFileSync(new URL('./workspace-page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('async function ensurePatientRecordExists(record: PatientRecord, userId: string)')
    expect(source).toContain(".eq('user_id', userId)")
    expect(source).toContain('user_id: userId')
    expect(source).toContain('const patientId = await ensurePatientRecordExists(record, user.id)')
    expect(source).not.toContain('user_id: user.email')
    expect(source).not.toContain('user.phone')
    expect(source).not.toContain('app_metadata.provider')
  })
})
