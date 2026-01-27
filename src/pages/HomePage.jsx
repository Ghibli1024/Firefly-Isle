/**
 * [INPUT]: 依赖 @/components/layout 的 Hero
 * [OUTPUT]: 对外提供 HomePage 组件
 * [POS]: pages/ 的首页，组合 Hero 等区块
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Hero } from '@/components/layout'

/* ========================================================================
   HomePage - 应用首页
   ======================================================================== */

function HomePage() {
  return (
    <main>
      <Hero />
    </main>
  )
}

export default HomePage
