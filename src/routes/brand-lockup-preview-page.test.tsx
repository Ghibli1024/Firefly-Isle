/**
 * [INPUT]: 依赖 react-dom/server 的静态渲染，依赖 BrandLockupPreviewPage 与 brandLockupVariants。
 * [OUTPUT]: 对外提供 /brand-lockup-preview 设计看板的候选数量与四态展示回归测试。
 * [POS]: routes 的品牌锁定组合预览测试文件，确保 6 套候选同时展示 full-label、icon-only、dark、light 状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { brandLockupVariants } from '@/components/system/brand-lockup'

import { BrandLockupPreviewPage } from './brand-lockup-preview-page'

describe('BrandLockupPreviewPage', () => {
  it('renders all brand lockup variants with dark/light and width states', () => {
    const markup = renderToStaticMarkup(<BrandLockupPreviewPage />)

    expect(markup).toContain('侧栏品牌标识区')
    expect(markup).toContain('萤火虫')
    expect(markup).toContain('Brand lockup preview')
    expect(markup).toContain('Light sidebar')
    expect(markup).toContain('Dark sidebar')
    expect(markup).toContain('148 / 72')
    expect(markup).toContain('Light / full-label')
    expect(markup).toContain('Dark / icon')

    for (const variant of brandLockupVariants) {
      expect(markup).toContain(variant)
    }
  })
})
