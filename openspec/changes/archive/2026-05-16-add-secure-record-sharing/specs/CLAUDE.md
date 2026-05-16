# specs/
> L2 | 父级: /openspec/changes/add-secure-record-sharing/CLAUDE.md

成员清单
record-sharing/spec.md: 新增病历分享规格，定义创建、查看、撤销、过期、错误授权码和只读访问，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
supabase-schema/spec.md: 修改 Supabase schema，新增 record_shares 表与 RLS/授权查询边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 授权码只证明访问单份记录；永远不能变成用户身份或全库权限。
