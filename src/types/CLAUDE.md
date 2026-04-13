# src/types/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明领域模型目录边界与更新规则，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
patient.ts: PatientRecord、TreatmentLine、InitialOnset、编辑目标与患者 archetype 判定工具，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
patient.test.ts: PatientRecord archetype 判定的最小回归测试，供 CI 校验核心领域分支，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 类型先讲清现实结构，再谈工具函数，不在类型文件里混入 UI 状态。
