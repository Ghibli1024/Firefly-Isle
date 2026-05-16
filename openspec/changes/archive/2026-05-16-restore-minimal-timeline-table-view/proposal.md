## 为什么

PRD 的核心表达是“一页看懂治疗时间线”。当前正式记录页已经有 V3 dossier 和 Gantt，但 `TimelineTable` 没有作为真实 record 的主链路视图出现，导致原始产品承诺只剩工作区预览/历史组件。

## 改什么

- 在 `/record/:id` 增加一页极简表格视图，复用现有 `TimelineTable`。
- 视图切换从 dossier/Gantt 扩展为 dossier/TimelineTable/Gantt。
- 三类患者仍按 `TimelineTable` baseline spec 渲染。
- 关键字段缺失高亮、编辑、导出、Gantt 行为不回退。

## 非目标

- 不新增 PatientRecord 数据结构。
- 不复制第二套治疗线编辑逻辑。
- 不移除 dossier 或 Gantt。
- 不把 `/app` 重新变成正式导出入口。
