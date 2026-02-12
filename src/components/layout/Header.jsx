/**
 * [INPUT]: 依赖 react 的 useState/useEffect，依赖 react-router-dom 的 Link
 *          依赖 framer-motion 的 motion/AnimatePresence
 *          依赖 @/components/ui 的 Button/NavigationMenu
 * [OUTPUT]: 对外提供 Header 组件 (滚动时中间导航收缩隐藏)
 * [POS]: layout/ 的顶部导航栏，承载品牌标识与路由导航
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

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
           导航菜单 - 滚动时隐藏
           ---------------------------------------------------------------- */}
        <AnimatePresence>
          {!scrolled && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link to="/">首页</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link to="/design-system">设计系统</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ----------------------------------------------------------------
           操作按钮
           ---------------------------------------------------------------- */}
        <div className="flex items-center gap-2">
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
