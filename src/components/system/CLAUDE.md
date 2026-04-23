# src/components/system/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明设计系统壳层与 surface 基元目录的边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
surfaces.tsx: 统一 Sidebar、TopBar、Main、Panel、Section 与 Action surface 的主题化结构基元，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
topbar.tsx: dark 顶栏组件，定义 dark 主题顶部空间角色与操作入口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
masthead.tsx: light 版头组件，与 dark 顶栏共享顶部空间角色，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
sidebar-nav.tsx: 共享侧栏导航组件，统一 dark/light 的侧栏几何、导航、主题切换与会话出口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 结构先同构，材质后分化；页面只能组合系统组件，不直接发明壳层语义。
