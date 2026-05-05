/**
 * [INPUT]: 无直接运行时代码，描述时间线组件目录的职责边界与成员。
 * [OUTPUT]: 对外提供 components/timeline 目录地图，约束表格与甘特图渲染边界。
 * [POS]: src/components 的 L2 文档，收敛基本信息、初发区块、治疗线区块、总表格组件与治疗线甘特投影。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
# src/components/timeline/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明时间线表格组件目录的职责边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
TimelineTable.tsx: 按 archetype 组合基本信息、初发区块与治疗线区块的主表格组件，消费 V3 timeline token、locale 文案真相源，并负责关键缺失字段橙色高亮与行内编辑入口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
TreatmentGanttView.tsx: 治疗线甘特图展示组件，消费 PatientRecord.treatmentLines、locale 文案与 treatment-gantt 归一化结果，只读展示持续时间、缺失日期与当前治疗线，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
TreatmentGanttView.test.tsx: 治疗线甘特图静态渲染测试，约束多线、缺失日期、当前治疗线与空态 DOM 输出，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
treatment-gantt.ts: 治疗线甘特纯数据投影，负责 lineNumber 排序、日期解析、bar 百分比与 current-line 判定，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
treatment-gantt.test.ts: 治疗线甘特纯逻辑测试，约束排序、缺失日期不画假 bar、空数组与当前治疗线判定，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 渲染规则跟着 PatientRecord 走，不在 UI 层发明第四种患者类型；甘特图只是 treatmentLines 的投影，不是新模型。
