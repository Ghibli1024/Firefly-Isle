# ui/
> L2 | 父级: /src/components/CLAUDE.md

## 设计系统核心
**shadcn/ui 组件库 - 一切 UI 构建的唯一来源。**
- 主题：amethyst-haze (紫水晶薄雾)
- 所有组件自动继承设计令牌
- 禁止修改组件源码，通过 className 扩展样式

## 成员清单

button.jsx:           按钮组件，支持 default/secondary/destructive/outline/ghost/link 变体
card.jsx:             卡片容器，含 CardHeader/CardTitle/CardDescription/CardContent/CardFooter
navigation-menu.jsx:  导航菜单，支持多级菜单与触发器样式
separator.jsx:        分隔线，水平/垂直方向
badge.jsx:            徽章标签，支持 default/secondary/destructive/outline 变体
tooltip.jsx:          工具提示，需配合 TooltipProvider 使用

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
