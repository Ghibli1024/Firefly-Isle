/**
 * [INPUT]: 依赖 node:fs 读取 src/index.css，依赖 vitest，依赖 ./tokens 的 V3 主题合同。
 * [OUTPUT]: 对外提供主题 token、CSS 全局约束与字体系统回归测试。
 * [POS]: src/lib/theme 的测试文件，阻止 action 色、light 侧栏 shell 归属、紧凑响应式侧栏、宽幅 shell、圆角合同与 03 Apple Editorial 字体系统回退到旧双主题漂移。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  sidebarDefaultWidth,
  sidebarLabelHideWidth,
  sidebarMaxWidth,
  sidebarMinWidth,
  sidebarOffsetClass,
  sidebarWidthClass,
  shellWideContentClass,
  shellViewportOffsetClass,
  themeTokens,
} from './tokens'

const indexCss = readFileSync(new URL('../../index.css', import.meta.url), 'utf8')
const workspacePageSource = readFileSync(new URL('../../routes/workspace-page.tsx', import.meta.url), 'utf8')
const extractionComposerSource = readFileSync(new URL('../../components/workspace/extraction-composer.tsx', import.meta.url), 'utf8')
const reportPreviewFrameSource = readFileSync(new URL('../../components/workspace/report-preview-frame.tsx', import.meta.url), 'utf8')
const timelineTableSource = readFileSync(new URL('../../components/timeline/TimelineTable.tsx', import.meta.url), 'utf8')
const topbarSource = readFileSync(new URL('../../components/system/topbar.tsx', import.meta.url), 'utf8')
const followUpPanelSource = readFileSync(new URL('../../components/workspace/follow-up-panel.tsx', import.meta.url), 'utf8')
const loginPageViewSource = readFileSync(new URL('../../components/login-page-view.tsx', import.meta.url), 'utf8')
const originStoryPaperSource = readFileSync(new URL('../../components/system/origin-story-paper.tsx', import.meta.url), 'utf8')
const privacyGateSource = readFileSync(new URL('../../components/privacy-gate.tsx', import.meta.url), 'utf8')
const privacyPageSource = readFileSync(new URL('../../routes/privacy-page.tsx', import.meta.url), 'utf8')
const recordPageSource = readFileSync(new URL('../../routes/record-page.tsx', import.meta.url), 'utf8')
const brandLockupPreviewSource = readFileSync(new URL('../../routes/brand-lockup-preview-page.tsx', import.meta.url), 'utf8')

describe('V3 theme token contract', () => {
  it('uses orange as the only primary action color across dark and light themes', () => {
    expect(themeTokens.dark.accent.primary).toBe('#E85D2A')
    expect(themeTokens.light.accent.primary).toBe('#E85D2A')
    expect(themeTokens.dark.accent.success).toBe('#43A56B')
    expect(themeTokens.light.accent.success).toBe('#43A56B')
  })

  it('keeps the light sidebar joined to the workspace shell color', () => {
    expect(themeTokens.light.surface.sidebar).toBe(themeTokens.light.surface.base)
    expect(indexCss).toContain('--ff-surface-sidebar: #f8f7f4')
  })

  it('uses a resizable V3 sidebar geometry with an icon-only threshold', () => {
    expect(sidebarDefaultWidth).toBe(148)
    expect(sidebarMinWidth).toBe(72)
    expect(sidebarMaxWidth).toBe(296)
    expect(sidebarLabelHideWidth).toBe(148)
    expect(sidebarWidthClass).toBe('w-[var(--ff-sidebar-width)]')
    expect(sidebarOffsetClass).toBe('md:ml-[var(--ff-sidebar-offset)]')
    expect(shellViewportOffsetClass).toBe('md:left-[var(--ff-sidebar-offset)] md:w-[calc(100%-var(--ff-sidebar-offset))]')
    expect(shellWideContentClass).toBe('mx-auto w-full max-w-[1760px]')
  })

  it('keeps the V3 radius contract available in CSS', () => {
    expect(indexCss).not.toContain('border-radius: 0 !important')
    expect(indexCss).toContain('--ff-radius-md: 8px')
    expect(indexCss).toContain('--ff-sidebar-width: 148px')
  })

  it('uses the selected 03 Apple Editorial font system across the app shell', () => {
    expect(indexCss).toContain('--ff-font-display: "New York", "Songti SC", "STSong", "Times New Roman", serif')
    expect(indexCss).toContain('--ff-font-ui: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", sans-serif')
    expect(indexCss).toContain('--ff-font-mono: "SFMono-Regular", "SF Mono", ui-monospace, monospace')
    expect(indexCss).toContain('h1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-family: var(--ff-font-display);\n}')
    expect(indexCss).toContain('.font-\\[var\\(--ff-font-display\\)\\] {\n  font-family: var(--ff-font-display);\n}')
    expect(indexCss).toContain('.font-\\[var\\(--ff-font-ui\\)\\] {\n  font-family: var(--ff-font-ui);\n}')
    expect(indexCss).toContain('.font-\\[var\\(--ff-font-mono\\)\\] {\n  font-family: var(--ff-font-mono);\n}')
    expect(indexCss).not.toContain('--ff-font-display: "Inter", "Noto Sans SC", sans-serif')
    expect(indexCss).not.toContain('--ff-font-ui: "Inter", "Noto Sans SC", sans-serif')

    for (const source of [workspacePageSource, extractionComposerSource, reportPreviewFrameSource, timelineTableSource, topbarSource]) {
      expect(source).not.toContain("font-['Inter']")
      expect(source).not.toContain("font-['Inter_Tight']")
      expect(source).not.toContain("font-['JetBrains_Mono']")
      expect(source).not.toContain("font-['Newsreader']")
      expect(source).toContain('font-[var(--ff-font')
    }

    expect(topbarSource).toContain('whitespace-nowrap font-[var(--ff-font-display)] text-lg')
    expect(extractionComposerSource).toContain('label className="font-[var(--ff-font-display)] text-2xl')
    expect(reportPreviewFrameSource).toContain('<h2 className="font-[var(--ff-font-display)] text-2xl')
    expect(timelineTableSource).toContain('font-[var(--ff-font-display)] text-4xl')
    expect(timelineTableSource).toContain('font-[var(--ff-font-display)] text-3xl font-bold tracking-tight')
    expect(reportPreviewFrameSource).toContain("const previewSectionTitleClass = 'font-[var(--ff-font-display)] text-base font-semibold")
    expect(reportPreviewFrameSource).toContain('className={`mb-2 ${previewSectionTitleClass}`}')
    expect(reportPreviewFrameSource).toContain('className={`mt-4 ${previewSectionTitleClass}`}')
    expect(reportPreviewFrameSource).toContain('className="block font-[var(--ff-font-display)] text-lg font-bold')
    expect(privacyGateSource).toContain('className="mt-3 font-[var(--ff-font-display)] text-lg font-bold tracking-normal"')
    expect(loginPageViewSource).toContain('font-[var(--ff-font-display)] text-3xl font-bold')

    for (const source of [
      followUpPanelSource,
      loginPageViewSource,
      originStoryPaperSource,
      privacyPageSource,
      recordPageSource,
      brandLockupPreviewSource,
      timelineTableSource,
      reportPreviewFrameSource,
      privacyGateSource,
    ]) {
      expect(source).not.toMatch(/<h[1-6][^>]*font-\[var\(--ff-font-(ui|mono)\)\]/)
    }

    expect(extractionComposerSource).toContain('bg-[var(--ff-accent-primary)] px-6 font-[var(--ff-font-ui)] text-sm font-bold')
  })
})
