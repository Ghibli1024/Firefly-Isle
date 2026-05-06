/**
 * [INPUT]: 依赖 node:fs 的源码合同检查，依赖 ./TimelineTable 的 blur 取消提交 helpers。
 * [OUTPUT]: 对外提供 TimelineTable Escape 取消不提交行为与主题 class 分支去噪的回归测试。
 * [POS]: components/timeline 的主表格测试，约束输入框取消语义与 CSS 变量驱动的主题边界，和 TimelineTable.tsx 同步演化。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { consumeCanceledBlur, markNextBlurAsCanceled } from './TimelineTable'

function readTimelineTableSource() {
  return readFileSync(new URL('./TimelineTable.tsx', import.meta.url), 'utf8')
}

describe('TimelineTable inline editing contract', () => {
  it('consumes exactly one blur commit after Escape cancels editing', () => {
    const guard = { current: false }

    expect(consumeCanceledBlur(guard)).toBe(false)

    markNextBlurAsCanceled(guard)

    expect(consumeCanceledBlur(guard)).toBe(true)
    expect(guard.current).toBe(false)
    expect(consumeCanceledBlur(guard)).toBe(false)
  })

  it('keeps identical dark/light class branches out of CSS-variable helpers', () => {
    const source = readTimelineTableSource()

    expect(source).toContain('function getShellClass() {')
    expect(source).toContain('function getSectionClass() {')
    expect(source).toContain('function getCellClass(critical: boolean, filled: boolean) {')
    expect(source).not.toContain("return theme === 'dark'\n    ? 'rounded-[var(--ff-radius-md)] border")
  })
})
