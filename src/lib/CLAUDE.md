# src/lib/
> L2 | 父级: /src/CLAUDE.md

成员清单
CLAUDE.md: 说明前端基础设施模块职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
theme.tsx: Dark / Light 主题状态、持久化与 document 根节点主题标记同步，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
supabase.ts: Supabase 客户端初始化与环境变量边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
utils.ts: 类名合并等无业务状态工具，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 基础设施集中在这里，页面只消费结果，不重复发明边界。
