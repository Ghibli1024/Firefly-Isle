# src/
> L2 | 父级: /CLAUDE.md

成员清单
CLAUDE.md: 说明前端源码层级、模块边界与文档同步规则，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
App.tsx: 路由装配入口，负责 BrowserRouter、ThemeProvider、AuthProvider、PrivacyGate 与三类页面路由拼接，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
main.tsx: React 挂载入口，只负责把 App 渲染到 DOM，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
index.css: 全局 token、主题变量与共享布局样式，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
components/: 页面骨架、主题开关与 UI 组件
lib/: 主题、认证、隐私文案、LLM adapter、Supabase 客户端与通用工具
routes/: 登录页、临床工作区、档案详情三类页面骨架
types/: PatientRecord 等领域模型与判定工具

法则: 壳层先于业务，主题先于页面，路由只装配不承载细节。
