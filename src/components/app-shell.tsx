/**
 * [INPUT]: 依赖 react-router-dom 的 Link，依赖 lucide-react 图标，依赖 ThemeToggle 与 cn。
 * [OUTPUT]: 对外提供 AppShell、ShellSectionHeading 与 ShellKpiCard 组件。
 * [POS]: components 的页面壳层骨架，统一三类 Web 页面布局、导航与右侧检查区。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { PropsWithChildren, ReactNode } from 'react'
import { Activity, ArrowUpRight, FileClock, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

type AppShellProps = PropsWithChildren<{
  eyebrow: string
  title: string
  description: string
  aside?: ReactNode
}>

const navItems = [
  { label: 'Login', href: '/login' },
  { label: 'Workspace', href: '/app' },
  { label: 'Record', href: '/record/demo' },
]

const statusCards = [
  { label: 'Privacy gate', value: 'Pending', icon: ShieldCheck },
  { label: 'Supabase', value: 'Scaffolded', icon: Activity },
  { label: 'Export flow', value: 'Planned', icon: FileClock },
]

export function AppShell({ eyebrow, title, description, aside, children }: AppShellProps) {
  const location = useLocation()

  return (
    <div className="ff-shell px-4 py-4 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
        <header className="ff-panel flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="ff-label">Firefly Isle / MVP Core</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] md:text-4xl">
              一页萤临床记录工作台
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <div className="ff-grid">
          <aside className="ff-panel flex flex-col gap-6 px-4 py-5 lg:min-h-[calc(100vh-10rem)] lg:sticky lg:top-4">
            <div>
              <p className="ff-label">Navigation spine</p>
              <nav className="mt-4 flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      className={cn(
                        'flex items-center justify-between border px-3 py-3 text-sm transition-colors',
                        active
                          ? 'border-accent bg-accent/10 text-foreground'
                          : 'border-border/70 text-muted hover:border-accent/50 hover:text-foreground',
                      )}
                      to={item.href}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="border-t border-border/70 pt-5">
              <p className="ff-label">Why this shell</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Dark by default, high-contrast, and calm under pressure. The shell keeps
                navigation, status, and future editing controls in one stable frame.
              </p>
            </div>
          </aside>

          <main className="ff-panel min-h-[70vh] px-5 py-6 md:px-7 md:py-8">
            <div className="max-w-4xl">
              <p className="ff-label">{eyebrow}</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.06em] md:text-6xl">
                {title}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
                {description}
              </p>
            </div>

            <div className="mt-10 space-y-5">{children}</div>
          </main>

          <aside className="ff-panel flex flex-col gap-4 px-4 py-5">
            <div>
              <p className="ff-label">System check</p>
              <div className="mt-4 space-y-3">
                {statusCards.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="border border-border/70 bg-background/40 px-3 py-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted">{label}</span>
                      <Icon className="size-4 text-accent" />
                    </div>
                    <p className="mt-3 text-lg font-medium tracking-[-0.03em]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {aside ? (
              <div className="border-t border-border/70 pt-4">{aside}</div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  )
}

export function ShellSectionHeading({
  label,
  title,
  description,
}: {
  label: string
  title: string
  description: string
}) {
  return (
    <div className="space-y-3 border-l-2 border-accent pl-4">
      <p className="ff-label">{label}</p>
      <h3 className="text-xl font-semibold tracking-[-0.04em] md:text-2xl">{title}</h3>
      <p className="max-w-3xl text-sm leading-7 text-muted">{description}</p>
    </div>
  )
}

export function ShellKpiCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="border border-border/70 bg-card-strong px-4 py-4">
      <p className="ff-label">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{hint}</p>
    </div>
  )
}
