# ui/
> L2 | 父级: /src/components/CLAUDE.md

## 设计系统核心
**shadcn/ui 组件库 + 微拟物光影质感设计**

### 设计语言
```
微拟物 = 渐变背景 + 立体阴影 + 微交互

禁止：backdrop-blur、发光扩散阴影、硬编码颜色
必须：CSS 变量 + color-mix、三层阴影、大圆角 (16px-32px)
```

### 圆角规范
sm: 16px | default: 20px | lg: 24px | xl: 32px

## 成员清单

button.jsx:           微拟物按钮，渐变背景 + 三层阴影 + 微交互
                      [VARIANTS]: default, primary, destructive, accent, secondary, outline, ghost, link
                      [SIZES]: sm, default, md, lg, xl, icon

card.jsx:             微拟物卡片，凸起/内凹效果
                      [VARIANTS]: default(凸起), elevated(高凸起), inset(内凹)

badge.jsx:            微拟物徽章，渐变背景 + 立体阴影
                      [VARIANTS]: default, primary, destructive, accent, secondary, outline

input.jsx:            微拟物输入框，内凹效果
                      [VARIANTS]: default(内凹), elevated(浮起)

navigation-menu.jsx:  导航菜单，支持多级菜单与触发器样式
separator.jsx:        分隔线，水平/垂直方向
tooltip.jsx:          工具提示，需配合 TooltipProvider 使用

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
