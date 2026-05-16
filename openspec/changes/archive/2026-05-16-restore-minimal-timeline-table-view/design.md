## 设计决策

### 决策 1：TimelineTable 作为第三个 record view

`RecordViewMode` 扩展为 `dossier | table | gantt`。用户在真实 `/record/:id` 和 demo 记录都可切换查看，但真实导出仍归 dossier。

### 决策 2：复用现有组件和编辑提交

`TimelineTable` 已支持 `record`、`theme`、`onCommitField` 和 disabled。接入时直接复用页面级编辑状态与字段保存逻辑，不新增编辑 mapper。

### 决策 3：导出不被劫持

现有 PDF/PNG 继续绑定 dossier DOM。切到 table/gantt 时不把导出静默改成其他 DOM；需要时显示回到档案视图导出的语义。

### 风险

- 三视图按钮过挤：使用现有 tab switch slider 变量，保持紧凑可扫描。
- 表格和 dossier 编辑冲突：复用同一 `onCommitField`，让保存状态仍在一个 toolbar。
