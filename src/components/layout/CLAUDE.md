# layout/
> L2 | 父级: /src/components/CLAUDE.md

## 设计系统约束
**一切设计必须来自设计系统的颜色和组件。**
- 颜色：仅使用 CSS 变量 (primary, secondary, accent, muted, destructive, background, foreground 等)
- 组件：仅使用 @/components/ui 中的 shadcn 组件
- 禁止硬编码颜色值，禁止自定义组件样式

## 成员清单

Header.jsx:           全局顶部导航栏，Shrink on Scroll + 品牌标识 + ThemeToggle + 操作按钮
ThemeToggle.jsx:      主题切换按钮，微拟物光影质感，Sun/Moon 图标旋转动画，嵌入 Header 操作区
DesignSystemFab.jsx:  右侧悬浮按钮，固定定位，微拟物 primary 渐变，链接到 /design-system
Hero.jsx:             首屏展示区，Badge 标签 + 主副标题 + CTA 按钮 + 特性卡片
Footer.jsx:           全局底部信息区，品牌信息 + 快速链接 + 版权声明
index.js:             模块出口，聚合导出所有布局组件

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
