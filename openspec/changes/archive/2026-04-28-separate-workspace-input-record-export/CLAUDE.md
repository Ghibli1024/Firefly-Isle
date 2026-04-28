# separate-workspace-input-record-export/
> L2 | 父级: /CLAUDE.md

成员清单
proposal.md: 说明重新划分 `/app` 输入台与 `/record/:id` 导出台职责的动因、范围与边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
design.md: 记录 Draft/Input 与 Archive/Export 职责分界、语音/文件入口位置、导出迁移与风险，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
tasks.md: 执行清单，按规格、输入区、导出迁移、文档同步与验证拆分，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
specs/: app-shell 与 export delta specs，约束输入提取台和正式档案导出台行为，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
.openspec.yaml: OpenSpec change 元数据，声明 schema 与创建日期，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: `/app` 只做病历输入、结构化提取与草稿预览；`/record/:id` 才做正式病历档案与 PDF/PNG 导出。
