/**
 * [INPUT]: 依赖 react 的 useState，依赖 react-router-dom 的 Link
 *          依赖 lucide-react 的 Palette
 * [OUTPUT]: 对外提供 DesignSystemFab 组件
 * [POS]: layout/ 的右侧悬浮按钮，固定定位，链接到 /design-system
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Palette } from 'lucide-react'

/* ========================================================================
   微拟物样式 - 遵循设计系统公式
   ======================================================================== */

const STYLE = {
  idle: {
    background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
  },
  hover: {
    background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
    boxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
}

/* ========================================================================
   DesignSystemFab - 设计系统悬浮入口
   ======================================================================== */

function DesignSystemFab() {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to="/design-system"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed right-0 top-1/2 z-40 -translate-y-1/2 flex items-center gap-2 rounded-l-[20px] px-3 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={hovered ? STYLE.hover : STYLE.idle}
      aria-label="设计系统"
    >
      <Palette size={16} />
    </Link>
  )
}

export default DesignSystemFab
