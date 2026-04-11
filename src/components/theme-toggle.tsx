/**
 * [INPUT]: 依赖 lucide-react 图标、@/components/ui/button 与 @/lib/theme 的 useTheme。
 * [OUTPUT]: 对外提供 ThemeToggle 组件。
 * [POS]: components 的全局主题开关，被应用壳层头部复用。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { MoonStar, SunMedium } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2 border-border/80 bg-card/70 px-3 font-mono uppercase tracking-[0.22em] text-[11px]"
      onClick={toggleTheme}
    >
      {isDark ? <SunMedium className="size-3.5" /> : <MoonStar className="size-3.5" />}
      {isDark ? 'Light' : 'Dark'}
    </Button>
  )
}
