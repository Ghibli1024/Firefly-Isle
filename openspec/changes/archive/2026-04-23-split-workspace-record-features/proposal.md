## Why

当前 `workspace-page.tsx` 与 `record-page.tsx` 已经完成 design-system token 与 system shell 接入，但 route 文件仍然承担了过厚的展示结构。页面编排、feature-level 展示块与具体 section scaffold 仍混在 route 中，导致后续继续调整 UI 或收口业务块时仍要在大文件里做局部手术。现在需要建立 feature component 中间层，让 route 回到 orchestration 职责，同时不改变现有 design-system contract 与业务行为。

## What Changes

- 抽离 `workspace-page.tsx` 的主要展示块为独立 feature components，包括输入区、追问区与报告预览区。
- 抽离 `record-page.tsx` 的主要展示块为独立 feature components，包括病历总览头部、章节框架与信息卡。
- 保持现有 `src/lib/theme/tokens.ts`、`src/index.css` 与 `src/components/system/` 壳层合同不变，只让页面改为消费新的 feature-level 组件。
- 保持 `workspace-page.tsx` 中的提取、追问、导出、持久化状态机不变，只收口展示层结构。
- 保持 `record-page.tsx` 的 dark / light 顶层分发不变，只减少重复 section scaffold 与长篇 route 内展示代码。
- 同步更新新增目录与相关文件的 `CLAUDE.md`、L3 文件头注释和模块职责说明。

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `app-shell`: route 文件对壳层与 feature block 的消费边界将更清晰，页面壳层继续维持统一 geometry contract，但 route 层不再直接承载大段展示结构。

## Impact

- Affected code:
  - `src/routes/workspace-page.tsx`
  - `src/routes/record-page.tsx`
  - new `src/components/workspace/**`
  - new `src/components/record/**`
  - related `CLAUDE.md` files
- Unchanged core contracts:
  - `src/lib/theme/tokens.ts`
  - `src/index.css`
  - `src/components/system/**`
  - existing extraction / save / export behavior
- No API, data model, Auth, LLM, or export contract changes are expected.
- This is a structural refactor for maintainability and clearer architectural layering, not a behavior change.
