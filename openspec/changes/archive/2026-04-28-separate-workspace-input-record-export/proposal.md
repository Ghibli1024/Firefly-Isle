## Why

Firefly-Isle 当前运行时仍把 PDF/PNG 导出按钮放在 `/app` 输入面板动作区，这让“草稿输入台”和“正式档案导出台”的职责混在一起。`/app` 的核心工作应是收集病史、发起结构化提取、查看草稿预览；正式导出应发生在 `/record/:id` 这种已成档的病历上下文里。

输入 composer 也需要回到同一个临床 notes buffer：文件导入、语音输入、键盘输入和字数统计都服务于同一个 textarea，而不是拆成多个互相竞争的行动块。面板外只保留唯一主动作“开始结构化提取”，避免把导出、语音和提取混成一排同级命令。

本 change 的目标是把页面职责边界转成 OpenSpec：`/app` 回归 Draft / Input / Extraction，`/record/:id` 承担 Archive / Record / Export。核心不是多一个按钮，而是让导出只在正式病历档案上下文出现。

## What Changes

- 重构 `/app` 输入 composer 的行动层级：textarea 内左下角提供“导入病历文件”，右下角提供语音按钮与 `0 / 8000` 字数统计，面板外右下角保留唯一主动作“开始结构化提取”。
- 从 `/app` 移除 `导出 PDF` 与 `导出 PNG` 入口；提取完成后的主动作可以演化为“保存并打开病历”，引导进入 `/record/:id`。
- 将 PDF/PNG 正式导出入口收敛到 `/record/:id` 档案详情页，复用现有 html2canvas/jsPDF 导出链路和失败/loading 状态。
- 保持既有路由、认证、提取状态机、PatientRecord schema、inline edit 与落库语义不变。

## Capabilities

### Modified Capabilities

- `app-shell`: `/app` 从“输入 + 提取 + 导出”收敛为输入提取台；导出入口不再属于工作区输入面板。
- `export`: PDF/PNG 导出能力继续存在，但用户入口迁移到正式 `/record/:id` 档案页。

## Impact

- Affected code: `src/components/workspace/extraction-composer.tsx`, `src/routes/workspace-page.tsx`, `src/routes/record-page.tsx`, `src/lib/copy.ts`, related route/component tests.
- Affected docs: this change, `CLAUDE.md`, affected `src/**/CLAUDE.md`, and L3 headers for components/routes whose responsibilities change.
- Explicitly not affected: route set, Supabase auth, extraction prompt/schema, follow-up merge semantics, database schema, Edge Functions, PatientRecord type, html2canvas/jsPDF implementation internals.
- Required verification: focused Vitest coverage for workspace/record export placement, lint, build, and browser checks for `/app` and `/record/demo` in dark/light desktop layout.
