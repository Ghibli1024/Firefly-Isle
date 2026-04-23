/**
 * [INPUT]: 依赖 @/components/ui/button，依赖 @/lib/locale 的 useLocale，依赖 @/lib/copy 的切换文案。
 * [OUTPUT]: 对外提供 LocaleToggle 组件。
 * [POS]: components 的全局语言开关，与 ThemeToggle 并列复用，但状态职责独立。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Languages } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'

export function LocaleToggle() {
  const { locale, toggleLocale } = useLocale()
  const nextLocale = locale === 'zh' ? 'en' : 'zh'

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2 border-border/80 bg-card/70 px-3 font-mono uppercase tracking-[0.22em] text-[11px]"
      onClick={toggleLocale}
    >
      <Languages className="size-3.5" />
      {getCopy(copy.localeToggle[nextLocale], locale)}
    </Button>
  )
}
