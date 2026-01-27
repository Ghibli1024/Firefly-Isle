# src/
> L2 | 父级: /CLAUDE.md

## 设计系统约束
**一切设计必须来自设计系统的颜色和组件。**
微拟物光影质感：渐变背景 + 三层阴影 + 微交互

## 成员清单

main.jsx:    应用入口，挂载 React 根组件到 DOM
App.jsx:     应用根组件，承载全局布局与路由配置
index.css:   全局样式入口，TailwindCSS + shadcn/ui CSS 变量

## 子目录

components/  - UI 组件库 (ui/, layout/, effects/)
pages/       - 页面组件 (HomePage, DesignSystemPage)
hooks/       - 自定义 React Hooks
lib/         - 工具函数 (utils.js 含 cn 类名合并)
assets/      - 静态资源

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
