## Why

当前 dark / light 主题切换虽然可用，但在工作区和壳层上仍然表现出明显的结构漂移与表面层级漂移：侧栏宽度、顶部空间角色、分隔线语义与 dark 背景层级没有被同一套设计系统约束，导致切换时视觉突兀，也让后续页面继续散写颜色与组件风格的风险越来越高。现在需要把主题切换从“页面级样式切换”提升为“设计系统驱动的同构主题切换”，让所有视觉决策都来自统一 token 与系统组件。

## What Changes

- 建立主题同构规则，明确 dark / light 必须共享同一套壳层几何合同：侧栏宽度、顶部空间角色、主内容起始线与版心关系保持一致。
- 收敛 dark 主题表面层级，定义可允许的背景、内嵌面、强调面与分隔线语义，禁止页面继续直接发明新的 dark 颜色。
- 抽离并固定设计系统 token，要求页面颜色、边框、文字层级与强调色只能来自设计系统，而不是在业务组件中直接写散落的十六进制值。
- 抽离壳层级系统组件与表面组件，让页面通过设计系统组件组合视觉结构，而不是在页面中重复拼装主题语义。
- 统一主题切换行为，使切换只改变材质、排版语气与 token 映射，而不再改变结构角色。
- 将现有 `docs/design/dark/*`、`docs/design/light/*` 与 Stitch 页面映射整理为本轮设计系统约束的上游证据，而不是继续让实现直接依赖页面级散写样式。

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `theme-system`: 主题实现从“对齐设计稿”提升为“必须消费统一 token、surface contract 与系统组件”，并显式约束 dark surface 收敛与主题切换的结构同构。
- `app-shell`: 页面壳层从“复刻各主题页面结构”提升为“dark / light 共享相同空间角色与壳层几何合同”，明确侧栏宽度、顶部角色、主内容起始线与分隔线语义。

## Impact

- Affected code: `src/components/app-shell.tsx`, `src/routes/workspace-page.tsx`, `src/routes/record-page.tsx`, `src/routes/login-page.tsx`, `src/components/timeline/TimelineTable.tsx`, `src/index.css`, `src/components/ui/**`, potential new system-level theme primitives under `src/components/` or `src/lib/`.
- Affected docs: change-local `design.md`, `tasks.md`, delta specs for `theme-system` and `app-shell`, and potentially root / module CLAUDE docs if files or directories move.
- Affected design inputs: `docs/design/dark/*`, `docs/design/light/*`, `docs/products/stitch-screen-mapping.md`.
- No API contract changes are expected, but visual system rules and implementation boundaries will change substantially inside the frontend.
