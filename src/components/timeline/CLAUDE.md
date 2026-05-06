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
TimelineTable.tsx: 按 archetype 组合基本信息、初发区块与治疗线区块的主表格组件，消费 V3 timeline token、locale 文案真相源，并负责关键缺失字段橙色高亮、行内编辑入口与 blur 取消提交 helper，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
TimelineTable.test.tsx: 主时间线表格合同测试，约束 Escape 取消后的 blur 只跳过一次提交与 CSS 变量主题 helper 不再保留重复 dark/light class 分支，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
TreatmentGanttView.tsx: 治疗方案甘特图展示组件，消费 PatientRecord、locale 文案、demo-only 补充说明与 treatment-gantt 投影，窄屏展示纵向治疗卡片，桌面展示左右固定信息、中间独立拖动时间轴、PFS、间隔与条形生长动效，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
TreatmentGanttView.test.tsx: 治疗方案甘特图静态渲染测试，约束窄屏治疗卡片、桌面左侧方案/PFS、中间可拖动时间轴、右侧补充资料、缺失日期与空态 DOM 输出，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
treatment-gantt.ts: 治疗方案甘特纯数据投影，负责初发 baseline、lineNumber 排序、日期解析、PFS、axis tick、gap、bar 百分比与开放当前线判定，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
treatment-gantt.test.ts: 治疗方案甘特纯逻辑测试，约束 baseline+多线排序、PFS 计算、间隔虚线、开放当前线、缺失日期不画假 bar 与空记录，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 渲染规则跟着 PatientRecord 走，不在 UI 层发明第四种患者类型；甘特图只是 initialOnset 与 treatmentLines 的展示投影，不是新模型。
