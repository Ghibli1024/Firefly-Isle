# src/components/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明页面骨架组件与共享交互组件职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
app-shell.tsx: Dark/Light 设计复刻壳层基元，负责导航、顶栏、主题切换、认证出口与占位素材输出，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page-view.tsx: 登录页纯展示层，承载 Dark/Light 复刻结构与表单展示，不直接触碰 Supabase 认证状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
privacy-gate.tsx: 首次使用隐私门控层，负责 localStorage 确认状态与全屏阻塞弹层，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
theme-toggle.tsx: 全局主题切换入口，供壳层头部复用，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
ui/: shadcn/ui 基础组件与轻量封装

法则: 组件只表达结构与交互骨架，不承载数据持久化决策。
