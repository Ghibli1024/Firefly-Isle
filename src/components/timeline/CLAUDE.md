/**
 * [INPUT]: 无直接运行时代码，描述时间线组件目录的职责边界与成员。
 * [OUTPUT]: 对外提供 components/timeline 目录地图，约束表格渲染边界。
 * [POS]: src/components 的 L2 文档，收敛基本信息、初发区块、治疗线区块与总表格组件。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
# src/components/timeline/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明时间线表格组件目录的职责边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
TimelineTable.tsx: 按 archetype 组合基本信息、初发区块与治疗线区块的主表格组件，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 渲染规则跟着 PatientRecord 走，不在 UI 层发明第四种患者类型。
