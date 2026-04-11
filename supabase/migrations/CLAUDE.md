# supabase/migrations/
> L2 | 父级: /supabase/CLAUDE.md

成员清单
CLAUDE.md: 说明迁移目录职责与命名规则，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
001_init.sql: 建立 patients、treatment_lines、RLS 与 updated_at trigger 的首个 MVP 迁移，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 每个迁移都是一次可审计的数据库事实，不把 schema 变化散落到别处。
