/**
 * [INPUT]: 依赖 node:fs 读取 src/index.css，依赖 vitest，依赖 ./tokens 的 V3 主题合同。
 * [OUTPUT]: 对外提供主题 token 与 CSS 全局约束的回归测试。
 * [POS]: src/lib/theme 的测试文件，阻止 action 色、light 侧栏 shell 归属、紧凑响应式侧栏、宽幅 shell 与圆角合同回退到旧双主题漂移。
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
})
