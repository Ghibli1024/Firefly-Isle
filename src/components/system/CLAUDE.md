# src/components/system/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明设计系统壳层与 surface 基元目录的边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
firefly-mark.tsx: 渲染一页萤屿“岛屿微光灯塔”透明品牌资产，被登录页、展开侧栏与 compact icon-only 侧栏复用，确保生产 mark 与 favicon 同源且不与标题绑定，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
brand-lockup.tsx: 侧栏品牌锁定组合候选组件，导出 BrandLockupVariant、候选元数据与 6 套萤火虫 mark + 星空 wordmark 预览，不替换生产侧栏，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
surfaces.tsx: 统一 Sidebar、TopBar、Main、Panel、Section 与 Action surface 的 V3 主题化结构基元，固定 1px 边界与 8px 主圆角语义，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
origin-story-paper.tsx: 顶栏问号触发的创作初衷纸页，使用 Three.js WebGL 与 Verlet 粒子约束固定整条顶部边、渲染刘勇原文 CanvasTexture，并保留降级与可访问文本副本，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
topbar.tsx: dark/light 共享顶部状态条组件，定义页面名、系统就绪、背景音乐开关、创作初衷入口与邮件联系入口的同构空间角色，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
masthead.tsx: light 旧版头兼容组件，内部转发到共享顶部状态条，不再定义独立 light 骨架，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
sidebar-nav.tsx: V3 响应式侧栏组件，统一 dark/light 的紧凑桌面默认展开、移动端默认收起、独立品牌 mark/中文行楷与英文 Snell Roundhand 手写标题、中文“萤”与英文 Firefly 主题光晕、边线胶囊三态点击、窄恢复胶囊、左缘渐进拉出、拖拽缩放到隐藏、阈值 icon-only、active 图标与文字同色、统计敬请期待短提示、临床笔记病历图标、匿名 theater_comedy / 非匿名 person 身份图标、主题/语言切换与会话出口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 结构先同构，材质后分化；页面只能组合系统组件，不直接发明壳层语义。
