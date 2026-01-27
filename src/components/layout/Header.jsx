/**
 * [INPUT]: 依赖 react-router-dom 的 Link，依赖 @/components/ui 的 Button/NavigationMenu
 * [OUTPUT]: 对外提供 Header 组件
 * [POS]: layout/ 的顶部导航栏，承载品牌标识与路由导航
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

/* ========================================================================
   Header - 全局顶部导航
   ======================================================================== */

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* ----------------------------------------------------------------
           品牌标识
           ---------------------------------------------------------------- */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Firefly Isle</span>
        </Link>

        {/* ----------------------------------------------------------------
           导航菜单
           ---------------------------------------------------------------- */}
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
