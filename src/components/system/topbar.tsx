/**
 * [INPUT]: 依赖 @/components/system/surfaces 的 TopBarShell。
 * [OUTPUT]: 对外提供 DarkTopBar 组件。
 * [POS]: src/components/system 的 dark 顶栏组件，定义 dark 主题顶部空间角色与操作入口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { getCopy, copy } from '@/lib/copy'
import { useLocale } from '@/lib/locale'

import { TopBarShell } from '@/components/system/surfaces'

export function DarkTopBar() {
  const { locale } = useLocale()

  return (
    <TopBarShell className="fixed top-0 z-50 flex h-16 w-full items-center justify-between px-6" theme="dark">
      <div className="border-l-2 border-[var(--ff-accent-primary)] pl-4 font-['Inter_Tight'] text-xl font-black uppercase tracking-tight">
        {getCopy(copy.shell.brand.darkTitle, locale)}
      </div>
      <div className="flex items-center gap-6 text-[24px]">
        <span className="material-symbols-outlined cursor-pointer p-1 transition-none hover:bg-[var(--ff-accent-primary)] hover:text-[var(--ff-surface-base)]">
          help
        </span>
        <span className="material-symbols-outlined cursor-pointer p-1 transition-none hover:bg-[var(--ff-accent-primary)] hover:text-[var(--ff-surface-base)]">
          settings
        </span>
      </div>
    </TopBarShell>
  )
}
