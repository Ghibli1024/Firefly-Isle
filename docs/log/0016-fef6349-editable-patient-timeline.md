# fef6349 feat: add editable patient timeline

## 1. 基本信息
- Commit: `fef6349`
- Message: `feat: add editable patient timeline`
- 时间顺序: 0016
- 日期: 2026-04-12
- 在当前仓库中的定位: `mvp-core` Commit 8（8.1 ~ 8.3）的核心提交

## 2. 这次提交实际解决了什么
- 把时间线表格从“只读结果”推进到“可点、可改、可保存”的真实工作工具。
- 新增 `PatientFieldTarget` 这样的编辑目标类型，使不同字段归属到 `patients` 或 `treatment_lines` 的规则可以被明确表达。
- 让用户在提取不完整或 AI 表达不准时，可以在表格内直接修正。

## 3. 是怎么一步一步完成的
1. 先从数据层补类型，而不是先硬写交互。
   - 在 `src/types/patient.ts` 里定义 `PatientFieldTarget`
   - 让 basicInfo / initialOnset / treatmentLine 的保存目标先变得可表达
2. 再在 `TimelineTable.tsx` 里给单元格加编辑态：
   - 点击进入 input / textarea
   - 自动 focus
   - blur 时提交
   - Escape/Enter 的基本键盘处理
3. 然后把真正的保存逻辑接进 `src/routes/workspace-page.tsx`：
   - `handleFieldCommit()`
   - `persistField()`
   - 根据 target 选择写 `patients` 还是 `treatment_lines`
4. 为了避免“能改但页面乱跳”，再回头补布局稳定性，让编辑态不会把表格撑坏。
5. 已证实命令：当前没有保留这次提交当天可直接引用的命令级证据。
6. 未证实命令：可以确认后来围绕这笔提交做过浏览器验证与持久化验证，但没有原始 shell 记录，因此不补假命令。

## 4. 遇到的问题
- 最大挑战是“编辑看起来简单，但保存目标并不简单”：不同字段的归属表不同，不能做成一把梭。
- 这类交互让 `workspace-page.tsx` 明显更胖，后续也确实成为继续重构的热点。
- 后来在整理 8.x/9.x 历史时，还一度误以为要重新创建 Commit 8，最后才发现 `fef6349` 已经真实存在。

## 5. 证据
- `git show --stat fef6349`: 关键变更在 `TimelineTable.tsx`、`workspace-page.tsx`、`src/types/patient.ts`
- `mvp-core` 任务 8.1 ~ 8.3 与本提交对齐
- 后续生产验证中 inline edit + 刷新恢复路径都建立在这里

## 6. 我的判断
- 这是一次典型的“把 AI 输出从建议稿变成可工作的病历编辑工具”的提交。
- 从产品价值上，它让提取失败不再等于流程失败。

## 7. 置信度
- 当前等级: 高
- 原因: 类型、组件、持久化与后续验证记录都能直接支撑这次提交的完整故事。
