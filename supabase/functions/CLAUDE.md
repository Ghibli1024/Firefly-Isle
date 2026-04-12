/**
 * [INPUT]: 无直接运行时代码，描述 Supabase Edge Functions 目录的职责边界与成员。
 * [OUTPUT]: 对外提供 functions 目录地图，供后续 llm-proxy 等函数模块同步使用。
 * [POS]: supabase 的函数层 L2 文档，连接基础设施目录与具体 Edge Function 子模块。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
# supabase/functions/
> L2 | 父级: /supabase/CLAUDE.md

成员清单
CLAUDE.md: 说明 Edge Functions 目录的边界与同步规则，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
llm-proxy/: Gemini 代理函数模块，负责 JWT 校验、模型转发与统一错误响应

法则: 函数只做安全边界与协议转换，不在这里堆业务状态机。
