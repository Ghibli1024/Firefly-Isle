/**
 * [INPUT]: 依赖 node:fs 的源码合同检查、react-dom/server 静态渲染、DesignPreviewPage 与 App/CSS 聚合源码。
 * [OUTPUT]: 对外提供 /design-preview 三候选、共享内容、默认状态、公开路由、隔离样式与可访问控件回归测试。
 * [POS]: routes 的 V4 设计评估页合同测试，防止预览接入 Supabase/全局主题、进入正式导航或突破 .ff-v4-* 命名空间。
 * [PROTOCOL]: 变更候选、预览路由、样式分层或隔离边界时更新此头部，然后检查 routes/styles/CLAUDE.md
 */
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DESIGN_PREVIEW_DIRECTIONS, DesignPreviewPage } from './design-preview-page'

function readSource(path: string) {
  return readFileSync(new URL(path, import.meta.url), 'utf8')
}

const routeSource = readSource('./design-preview-page.tsx')
const appSource = readSource('../App.tsx')
const sidebarSource = readSource('../components/system/sidebar-nav.tsx')
const styleEntrySource = readSource('../styles/design-preview.css')
const styleSources = [
  readSource('../styles/design-preview-tokens.css'),
  readSource('../styles/design-preview-shell.css'),
  readSource('../styles/design-preview-data.css'),
  readSource('../styles/design-preview-responsive.css'),
]
const combinedStyles = styleSources.join('\n')

describe('DesignPreviewPage', () => {
  it('renders one shared patient page with all three candidate directions and the recommended default', () => {
    const markup = renderToStaticMarkup(<DesignPreviewPage />)

    expect(markup).toContain('data-direction="calm"')
    expect(markup).toContain('data-mode="light"')
    expect(markup).toContain('同一页面 · 三种视觉系统')
    expect(markup).toContain('虚构静态数据')
    expect(markup).toContain('林予安')
    expect(markup).toContain('T-DXd · 第 5 周期')
    expect(markup).toContain('今天先看这三件事')
    expect(markup).toContain('最近治疗节点')

    for (const direction of DESIGN_PREVIEW_DIRECTIONS) {
      expect(markup).toContain(direction.name)
      expect(markup).toContain(direction.englishName)
    }

    expect(markup).toContain('推荐')
  })

  it('keeps all metric data in the shared DOM and exposes native pressed-state controls', () => {
    const markup = renderToStaticMarkup(<DesignPreviewPage />)

    for (const metric of ['CA15-3', 'CEA', 'WBC', 'ALT']) {
      expect(markup).toContain(metric)
    }

    expect(markup.match(/aria-pressed="true"/g)?.length).toBe(3)
    expect(markup).toContain('aria-label="设计方向"')
    expect(markup).toContain('aria-label="预览材质"')
    expect(markup).toContain('aria-label="指标选择"')
    expect(markup).not.toContain('role="listitem"')
  })

  it('registers a lazy public preview route before the wildcard without adding production navigation', () => {
    expect(appSource).toContain('const DesignPreviewPage = lazy')
    expect(appSource).toContain('path="/design-preview"')
    expect(appSource.indexOf('path="/design-preview"')).toBeLessThan(appSource.indexOf('path="*"'))
    expect(sidebarSource).not.toContain('/design-preview')
  })

  it('keeps preview data and state isolated from Supabase and persisted production theme state', () => {
    expect(routeSource).not.toMatch(/supabase/i)
    expect(routeSource).not.toContain('useAuth')
    expect(routeSource).not.toContain('useTheme')
    expect(routeSource).not.toContain('setTheme')
    expect(routeSource).not.toContain('localStorage')
    expect(routeSource).toContain("useState<DesignDirection>('calm')")
    expect(routeSource).toContain("useState<PreviewMode>('light')")
  })

  it('aggregates namespaced style layers with focus, mobile overflow, and reduced-motion contracts', () => {
    for (const filename of [
      'design-preview-tokens.css',
      'design-preview-shell.css',
      'design-preview-data.css',
      'design-preview-responsive.css',
    ]) {
      expect(styleEntrySource).toContain(filename)
    }

    expect(combinedStyles).toContain('.ff-v4-preview')
    expect(combinedStyles).toContain(':focus-visible')
    expect(combinedStyles).toContain('overflow-x: clip')
    expect(combinedStyles).toContain('@media (max-width: 520px)')
    expect(combinedStyles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(combinedStyles).not.toContain('transition: all')
    expect(combinedStyles).not.toMatch(/^\s*:root\b/m)
    expect(combinedStyles).not.toMatch(/^\s*html(?:\b|[.:[#])/m)
    expect(combinedStyles).not.toMatch(/^\s*\.dark(?:\b|[.:[#])/m)
    expect(combinedStyles).not.toMatch(/^\s*--ff-(?!v4-)/m)
  })
})
