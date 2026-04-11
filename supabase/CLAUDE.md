# supabase/
> L2 | 父级: /CLAUDE.md

成员清单
CLAUDE.md: 说明 Supabase 基础设施目录与迁移边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
migrations/: PostgreSQL schema、RLS 与 trigger 迁移脚本

法则: 先把数据库边界写死，再让应用层接入，不在前端里偷渡权限逻辑。
