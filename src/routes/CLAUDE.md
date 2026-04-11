# src/routes/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明三类页面骨架文件与路由职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
login-page.tsx: 登录页容器，对应 /login，负责认证状态、主题选择与展示层接线，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
workspace-page.tsx: 临床工作区复刻实现，对应 /app，Dark/Light 分别对齐 docs/design 的工作区稿，并暴露退出登录入口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-page.tsx: 档案详情复刻实现，对应 /record/:id，Dark/Light 分别对齐 docs/design 的档案稿，并复用认证出口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 路由页负责组合页面块，不承载跨页面状态机。
