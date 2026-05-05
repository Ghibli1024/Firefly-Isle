# src/components/record/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明病例详情展示层内部拆分与 route 边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
types.ts: 病例详情展示类型边界，定义 ExportFormat、Metric、EvidenceCard、TimelineEntry 等 UI 数据形状，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-copy.ts: 病例详情静态文案与 demo 数据模块，提供 labels、demoPatientRecord、summaryMetrics 与演示时间线，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-derived.ts: PatientRecord 展示派生层，把真实病历转换为概要指标、标题副文案与时间线条目，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-dossier.tsx: 病例详情主展示层，承载档案版心、指标、时间线、证据卡、导出按钮与不可用态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: route 只给数据和动作，record 展示层只渲染 dossier；Supabase row 映射留在 routes/record-page.logic.ts。
