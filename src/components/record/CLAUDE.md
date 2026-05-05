# src/components/record/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明病例详情展示层内部拆分与 route 边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
types.ts: 病例详情展示类型边界，定义 ExportFormat、Metric、EvidenceCard、TimelineEntry 等 UI 数据形状，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
LabTrendsTable.tsx: 实验室趋势表展示组件，消费 PatientRecord.labResults 并渲染最新值、参考范围、持续增高提示与空态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
LabTrendsTable.test.tsx: 实验室趋势表回归测试，约束持续增高高亮、非诊断文本与空态渲染，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
demo-record.ts: 默认乳腺癌病例 fixture，提供 demoPatientRecord 与 demoTreatmentGanttSupplementNotes，作为 /record/demo 与 demo-only 甘特补充资料的数据源，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-copy.ts: 病例详情静态文案模块，提供 labels、含癌种 summaryMetrics 与 00 起算/中文线别/补充资料归一的逐线演示时间线组装，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-line-labels.ts: 治疗线中文线别命名工具，把 lineNumber 归一成一线/二线治疗或英文 Line N Therapy，供 demo 与真实记录派生共享，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-derived.ts: PatientRecord 展示派生层，把真实病历转换为含癌种概要指标与 00 起算/中文线别/补充资料归一的紧凑时间线条目，避免基础信息和治疗线编号重复进入 timeline，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-dossier.tsx: 病例详情主展示层，承载档案版心、概要指标、按需实验室趋势、时间线 rail draw-in、证据卡 stagger、导出按钮与不可用态，页头、标题与补充资料行不重复已表达信息，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: route 只给数据和动作，record 展示层只渲染 dossier；Supabase row 映射留在 lib/patient-record-storage.ts。
