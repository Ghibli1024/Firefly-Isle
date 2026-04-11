/**
 * [INPUT]: 依赖 AppShell、ShellSectionHeading、ShellKpiCard 与 Button。
 * [OUTPUT]: 对外提供 LoginPage 组件，对应 /login。
 * [POS]: routes 的登录页骨架，承载认证入口、隐私门控提示与设计基调。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { ShieldAlert } from 'lucide-react'

import { AppShell, ShellKpiCard, ShellSectionHeading } from '@/components/app-shell'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  return (
    <AppShell
      eyebrow="Login / Web"
      title="在门诊开始前，把治疗线整理成一页。"
      description="这里先落登录骨架：邮箱登录、注册、匿名进入与隐私门控文案都在这个版面收口。后续认证逻辑会直接挂在这套结构里。"
      aside={
        <div className="space-y-4 text-sm text-muted">
          <div className="flex items-start gap-3 border border-border/70 bg-background/40 px-3 py-3">
            <ShieldAlert className="mt-0.5 size-4 text-accent" />
            <p>首次进入前会显示隐私条款；未确认前，不允许进入主功能。</p>
          </div>
          <p className="leading-6">
            默认 Dark 主题。用户手动切换到 Light 后，刷新应恢复上次选择。
          </p>
        </div>
      }
    >
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-5 border border-border/70 bg-card-strong px-5 py-6">
          <ShellSectionHeading
            label="Authentication entry"
            title="最少输入，最快进入。"
            description="这一版只做结构，不接真实 Supabase 行为。布局预留邮箱密码、注册 CTA 与匿名入口，避免后续为主题和路由重写。"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="ff-label">Email</span>
              <input
                className="w-full border-b border-border bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-accent"
                placeholder="name@example.com"
                type="email"
              />
            </label>
            <label className="space-y-2">
              <span className="ff-label">Password</span>
              <input
                className="w-full border-b border-border bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-accent"
                placeholder="••••••••"
                type="password"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-none bg-accent px-5 py-5 text-accent-foreground hover:bg-accent/90">
              邮箱登录
            </Button>
            <Button variant="outline" className="rounded-none px-5 py-5">
              创建账号
            </Button>
            <Button variant="ghost" className="rounded-none px-5 py-5 text-muted">
              无需登录，直接使用
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <ShellKpiCard label="Default theme" value="Dark" hint="首次进入默认 Dark，强调稳定与对比。" />
          <ShellKpiCard label="Anonymous mode" value="Ready" hint="匿名入口预留在主操作组，后续直接挂 Supabase session。" />
        </div>
      </section>
    </AppShell>
  )
}
