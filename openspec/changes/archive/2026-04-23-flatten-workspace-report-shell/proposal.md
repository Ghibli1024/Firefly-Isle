## Why

当前 `/app` 中的报告预览区域在 dark / light 两个主题下都叠了过多外框：route 层还有“临床结构化报告”标题壳，feature 层 `ReportPreviewFrame` 又继续包一层 preview scaffold，而 `TimelineTable` 自己本身已经是一个完整的主表面。结果是视觉嵌套太深，用户感知为“外面先有一层报告壳，再看到治疗时间线表格”。

现在需要把报告预览区收口为“直接展示治疗时间线表格”，去掉最外层多余壳层和标题，让时间线本体成为主焦点。

## What Changes

- 去掉 `/app` 报告区 route 层的“临床结构化报告”外层标题壳。
- 收敛 `ReportPreviewFrame` 的外部包裹层，让 `TimelineTable` 直接成为主展示表面。
- 在 dark / light 两个主题下都保持这个扁平化结果，减少重复嵌套。
- 保留报告区下方真正有信息价值的补充内容，如临床备注/AI 验证信息，但不再把它们包装成多一层总框架标题。

## Capabilities

### Modified Capabilities
- `app-shell`: 工作区报告区从“标题壳 + preview frame + 时间线表格”收敛为“时间线表格为主、补充信息为辅”的扁平结构。

## Impact

- Affected code: `src/routes/workspace-page.tsx`, `src/components/workspace/report-preview-frame.tsx`, new regression test for workspace report shell.
- Affected docs: change-local artifacts, `src/routes/CLAUDE.md`, `src/components/workspace/CLAUDE.md`, potentially root `CLAUDE.md` if active change state is mirrored there.
