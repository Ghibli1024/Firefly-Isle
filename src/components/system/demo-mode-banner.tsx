/**
 * [INPUT]: 依赖 react-router-dom 的 Link、@/lib/locale 的当前语言状态。
 * [OUTPUT]: 对外提供 DemoModeBanner 组件，渲染公开 Demo 页面的模式提醒和返回登录入口。
 * [POS]: components/system 的页面级提示条，被 /demo/record 与 /demo/analytics 复用，统一说明公开演示数据不写入个人账号。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Link } from 'react-router-dom'

import { useLocale } from '@/lib/locale'

export function DemoModeBanner() {
  const { locale } = useLocale()
  const copy =
    locale === 'zh'
      ? {
          action: '登录或新建自己的工作区',
          body: '这里展示公开演示数据；编辑只用于当前页面调试，不会写入你的个人账号。新注册或匿名账号默认从空白工作区开始。',
          title: '当前为 Demo 视图',
        }
      : {
          action: 'Log in or create your own workspace',
          body: 'This page shows public demo data. Edits are only for page debugging and are not written to your personal account. New accounts and anonymous sessions start blank.',
          title: 'You are viewing Demo mode',
        }

  return (
    <section
      aria-label={copy.title}
      className="mb-4 grid gap-3 border border-[var(--ff-border-default)] bg-[color-mix(in_srgb,var(--ff-accent-primary)_10%,var(--ff-surface-panel))] px-4 py-3 text-[var(--ff-text-primary)] md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center"
      data-testid="demo-mode-banner"
    >
      <span className="material-symbols-outlined text-[24px] text-[var(--ff-accent-primary)]" aria-hidden="true">
        preview
      </span>
      <div className="min-w-0">
        <p className="text-sm font-black">{copy.title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--ff-text-secondary)]">{copy.body}</p>
      </div>
      <Link
        className="t-control-press inline-flex min-h-[40px] w-fit items-center justify-center gap-2 rounded-[8px] border border-[var(--ff-border-default)] bg-[var(--ff-surface-raised)] px-3 text-sm font-bold text-[var(--ff-text-primary)] hover:border-[var(--ff-accent-primary)]"
        to="/login"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          login
        </span>
        {copy.action}
      </Link>
    </section>
  )
}
