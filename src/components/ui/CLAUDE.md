# src/components/ui/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明基础 UI 组件目录的边界与更新规则，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
button.tsx: shadcn 按钮基元，以显式属性过渡和克制按压缩放供主题开关与页面操作复用，不使用 transition-all，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
liquid-effect-animation.tsx: WebGL 液体背景基元，动态导入 threejs-components liquid1，renderer 只随启停创建/销毁，图片与材质在同一实例上串行热同步，并在不可用时静默回退静态背景，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 基础 UI 保持薄层，不把业务语义塞进通用组件。
