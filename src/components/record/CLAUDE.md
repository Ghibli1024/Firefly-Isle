# src/components/record/
> L2 | 父级: /src/components/CLAUDE.md

成员清单
CLAUDE.md: 说明 record feature 层职责边界与成员清单，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-section-frame.tsx: 统一档案章节序号、标题、副标题、badge 与正文容器骨架，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-side-card.tsx: 统一档案侧栏信息卡结构，承载 IHC、基因、protocol 与风险提示等小型信息块，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
record-summary-header.tsx: 统一档案总览头部区块，收口病人主标识、指标网格与元信息展示，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: feature 层承载病历页面的业务展示结构，只复用 system 基元，不把章节拼装继续留在 route。
