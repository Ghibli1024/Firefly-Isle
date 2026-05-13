# add-secure-record-sharing/
> L2 | 父级: /openspec/changes/CLAUDE.md

成员清单
.openspec.yaml: OpenSpec change 元数据，标记 spec-driven 工作流，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
README.md: change 标题与短描述，说明本变更添加可撤销只读分享，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
proposal.md: 变更动机与范围，锁定单份病历只读分享和授权码边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
design.md: 技术设计，记录 record_shares 表、授权码、只读路由、撤销和过期策略，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
tasks.md: 执行清单，按 OpenSpec、迁移/RLS、前端分享体验和测试拆分任务，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
specs/: delta 规格目录，定义 record-sharing 与 supabase-schema 变更，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 分享是只读授权，不是协作编辑；权限事实必须落在 Supabase schema 和查询边界。
