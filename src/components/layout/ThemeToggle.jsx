/**
 * [INPUT]: 依赖 react 的 useState，依赖 framer-motion 的 motion/AnimatePresence
 *          依赖 lucide-react 的 Sun/Moon，依赖 @/hooks 的 useTheme
 * [OUTPUT]: 对外提供 ThemeToggle 组件
 * [POS]: layout/ 的主题切换按钮，微拟物光影质感，嵌入 Header 操作区
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks'

/* ========================================================================
   微拟物样式 - 遵循设计系统公式
   ======================================================================== */

const STYLE = {
  idle: {
    background: 'linear-gradient(135deg, var(--secondary) 0%, color-mix(in srgb, var(--secondary) 90%, black) 50%, color-mix(in srgb, var(--secondary) 80%, black) 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.05)',
  },
  hover: {
    background: 'linear-gradient(135deg, var(--secondary) 0%, color-mix(in srgb, var(--secondary) 90%, black) 50%, color-mix(in srgb, var(--secondary) 80%, black) 100%)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.08)',
  },
}

/* ========================================================================
   图标动画配置
   ======================================================================== */

const iconMotion = {
  initial: { rotate: -90, opacity: 0, scale: 0.5 },
  animate: { rotate: 0, opacity: 1, scale: 1 },
  exit: { rotate: 90, opacity: 0, scale: 0.5 },
  transition: { duration: 0.25, ease: 'easeInOut' },
}

/* ========================================================================
   ThemeToggle - 主题切换按钮
   ======================================================================== */

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-[16px] text-foreground transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={hovered ? STYLE.hover : STYLE.idle}
      aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.span key="sun" {...iconMotion} className="flex items-center justify-center">
            <Sun size={14} />
          </motion.span>
        ) : (
          <motion.span key="moon" {...iconMotion} className="flex items-center justify-center">
            <Moon size={14} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export default ThemeToggle
