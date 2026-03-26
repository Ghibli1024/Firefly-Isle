/**
 * [INPUT]: 依赖 react 的 useState/useEffect，依赖 react-router-dom 的 Link
 *          依赖 @/components/ui 的 Button
 *          依赖 ./ThemeToggle 的主题切换按钮
 * [OUTPUT]: 对外提供 Header 组件 (滚动时高度收缩)
 * [POS]: layout/ 的顶部导航栏，承载品牌标识 + 主题切换 + 操作按钮
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import ThemeToggle from './ThemeToggle'

/* ========================================================================
   常量 - 滚动阈值
   ======================================================================== */

const SCROLL_THRESHOLD = 50

/* ========================================================================
   Header - 全局顶部导航 (Shrink on Scroll)
   ======================================================================== */

function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > SCROLL_THRESHOLD)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 transition-[height] duration-300"
        style={{ height: scrolled ? 48 : 64 }}
      >
        {/* ----------------------------------------------------------------
           品牌标识
           ---------------------------------------------------------------- */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Firefly Isle</span>
        </Link>

        {/* ----------------------------------------------------------------
           操作按钮
           ---------------------------------------------------------------- */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm">
            登录
          </Button>
          <Button size="sm">开始使用</Button>
        </div>
      </div>
    </header>
  )
}

export default Header
