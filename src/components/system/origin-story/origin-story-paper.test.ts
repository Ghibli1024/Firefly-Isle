/**
 * [INPUT]: 依赖 vitest 与 origin-story-paper 的 calculateOriginStoryStageBox、getOriginStoryClothBudget 纯函数。
 * [OUTPUT]: 对外提供创作初衷纸页舞台尺寸算法与 WebGL 布料性能预算的回归测试。
 * [POS]: components/system/origin-story 的尺寸与性能合同测试，替代 workspace-page 对源码字符串的尺寸断言。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vitest'

import { calculateOriginStoryStageBox, getOriginStoryClothBudget } from './origin-story-paper'

describe('calculateOriginStoryStageBox', () => {
  it('uses the full desktop reading area without overlapping the sidebar', () => {
    expect(
      calculateOriginStoryStageBox({
        anchorBottom: 68,
        isDesktop: true,
        rawShellLeft: 238,
        viewportHeight: 1080,
        viewportWidth: 1920,
      }),
    ).toEqual({
      height: 988,
      left: 559,
      top: 76,
      width: 1040,
    })
  })

  it('fills a narrow mobile viewport with safe side gutters', () => {
    expect(
      calculateOriginStoryStageBox({
        anchorBottom: 92,
        isDesktop: false,
        rawShellLeft: 238,
        viewportHeight: 735,
        viewportWidth: 602,
      }),
    ).toEqual({
      height: 619,
      left: 16,
      top: 100,
      width: 570,
    })
  })

  it('preserves a readable minimum height in short windows', () => {
    expect(
      calculateOriginStoryStageBox({
        anchorBottom: 68,
        isDesktop: true,
        rawShellLeft: 64,
        viewportHeight: 420,
        viewportWidth: 1024,
      }),
    ).toEqual({
      height: 360,
      left: 80,
      top: 76,
      width: 928,
    })
  })
})

describe('getOriginStoryClothBudget', () => {
  it('keeps the draggable paper simulation inside an interactive frame budget', () => {
    expect(getOriginStoryClothBudget()).toMatchObject({
      columns: 28,
      constraintIterations: 3,
      maxPixelRatio: 1.5,
      normalRecomputeInterval: 4,
      rows: 44,
    })
    expect(getOriginStoryClothBudget().vertexCount).toBeLessThanOrEqual(1250)
  })
})
