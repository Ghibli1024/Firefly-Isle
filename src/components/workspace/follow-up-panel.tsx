/**
 * [INPUT]: 依赖 react 的 useState，依赖 @/components/system/surfaces 的 PanelSurface 承载追问容器。
 * [OUTPUT]: 对外提供 FollowUpPanel 组件，渲染追问文案、补充输入与提交动作。
 * [POS]: components/workspace 的追问补充区块，被 workspace-page 组合，用于把 follow-up 展示层从 route 移出。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from 'react'

import { PanelSurface } from '@/components/system/surfaces'

type FollowUpPanelProps = {
  currentQuestion: string
  onSubmit: (value: string) => void
  theme: 'dark' | 'light'
}

export function FollowUpPanel({ currentQuestion, onSubmit, theme }: FollowUpPanelProps) {
  const [value, setValue] = useState('')

  const textareaClassName =
    theme === 'dark'
      ? 'mt-4 h-28 w-full resize-none border border-[var(--ff-border-default)] bg-[var(--ff-surface-base)] p-4 outline-none focus:border-[var(--ff-accent-primary)]'
      : 'mt-4 h-32 w-full resize-none border-2 border-[var(--ff-border-default)] bg-transparent p-4 outline-none'

  const buttonClassName =
    theme === 'dark'
      ? "mt-4 border border-[var(--ff-accent-primary)] px-4 py-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.2em] text-[var(--ff-accent-primary)]"
      : "mt-4 border-2 border-[var(--ff-border-default)] px-6 py-3 font-['Inter'] text-xs font-bold uppercase tracking-[0.2em]"

  return (
    <PanelSurface className={theme === 'dark' ? 'p-6' : 'ff-light-ink-shadow p-6'} theme={theme} tone="panel">
      {theme === 'dark' ? (
        <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[var(--ff-accent-primary)]">FOLLOW UP</div>
      ) : (
        <h3 className="font-['Inter'] text-xs font-bold uppercase tracking-[0.2em]">FOLLOW UP</h3>
      )}
      <p className="mt-3 text-sm leading-7 text-[var(--ff-text-subtle)]">{currentQuestion}</p>
      <textarea
        className={textareaClassName}
        onChange={(event) => setValue(event.target.value)}
        placeholder="一次性补充缺失信息..."
        value={value}
      />
      <button
        className={buttonClassName}
        onClick={() => {
          onSubmit(value)
          setValue('')
        }}
        type="button"
      >
        提交补充
      </button>
    </PanelSurface>
  )
}
