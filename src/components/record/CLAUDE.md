# src/components/record/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明病例详情展示层内部拆分与 route 边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
types.ts: 病例详情展示类型边界，定义 ExportFormat、带字段保存 target 的 Metric/EvidenceCard、带日期范围 target 的 TimelineEntry 等 UI 数据形状，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
ClinicalAnalysisPanel.tsx: 平面 AI 辅助分析章节，保留生成入口、加载态、失败态、治疗线摘要、指标趋势摘要、复核关注点、就诊前问题与非诊断免责声明，但不使用认证式 AI 装饰，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
RecordSharePanel.tsx: 次级授权码分享 disclosure，Demo 默认折叠、真实病历默认展开，并保留创建、一次性链接复制/查看、已有分享状态、Demo 预览禁用态、过期时间与撤销动作，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
LabTrendsTable.tsx: 平面实验室趋势章节，消费 PatientRecord.labResults 并渲染最新值、参考范围、持续增高提示与空态，不额外制造卡片层级，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
LabTrendsTable.test.tsx: 实验室趋势表回归测试，约束持续增高高亮、非诊断文本与空态渲染，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
demo-record.ts: 默认乳腺癌病例 fixture，提供 demoPatientRecord 与 demoTreatmentGanttSupplementNotes，作为 /record/demo 与 demo-only 甘特补充资料的数据源，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-copy.ts: 病例详情静态文案模块，提供无装饰性认证状态的 labels、含癌种/体格占位/多段检查证据的 summaryMetrics 与带字段保存 target 的 BL/Ln 标记/补充资料/rail 时间段/每线 PFS 归一逐线演示时间线组装，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-line-labels.ts: 治疗线中文线别命名工具，把 lineNumber 归一成一线/二线治疗或英文 Line N Therapy，供 demo 与真实记录派生共享，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-timeline-time.ts: 病例详情时间显示 facade，提供 rail 日期、含 ongoing 终点的时间段与 PFS 标签命名入口，真实日期解析和 PFS 口径委托 src/lib/timeline-duration，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-derived.ts: PatientRecord 展示派生层，把真实病历转换为含癌种、身高、体重、BMI、多段基因检测与免疫组化证据的概要指标，以及带字段保存/日期范围 target 的 BL/Ln 标记、补充资料、rail 时间段与每线 PFS 紧凑时间线条目，避免基础信息重复进入 timeline，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-dossier.tsx: 病例详情平面文档阅读层，承载 definition-grid 概要、多行检查证据、AI 辅助分析、按需实验室趋势、桌面独立日期/PFS rail、移动卡内 PFS、分隔线时间线、页面级字段保存编辑值、导出按钮与不可用态，并删除装饰性 AI 认证、完整性、固定时间和系统版本信息，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: route 只给数据和动作，record 展示层只渲染 dossier/分析/分享表现；Supabase row 映射留在 lib/patient-record-storage.ts，LLM 与分享调用留在 route/lib 边界。
