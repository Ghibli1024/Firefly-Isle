/**
 * [INPUT]: 依赖 @/components/system/surfaces 的 TopBarShell。
 * [OUTPUT]: 对外提供 LightMasthead 组件。
 * [POS]: src/components/system 的 light 顶部版头组件，与 dark top bar 共享顶部空间角色。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { TopBarShell } from '@/components/system/surfaces'

export function LightMasthead() {
  return (
    <TopBarShell className="w-full px-6 pb-4 pt-8 md:px-12" theme="light">
      <div className="flex flex-col items-center">
        <h1 className="font-['Playfair_Display'] text-6xl font-black uppercase tracking-tighter text-[var(--ff-text-primary)] md:text-8xl">
          一页萤岛
        </h1>
        <div className="mt-4 h-1 w-full bg-[var(--ff-border-default)]" />
        <div className="mt-1 h-px w-full bg-[var(--ff-border-default)]" />
        <div className="flex w-full items-center justify-between py-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-text-primary)]">
          <span>VOL. 01 — NO. 52</span>
          <span>Clinical AI Workspace</span>
          <span>EST. 2024</span>
        </div>
        <div className="h-px w-full bg-[var(--ff-border-default)]" />
      </div>
    </TopBarShell>
  )
}
