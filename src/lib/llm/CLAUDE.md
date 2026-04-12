/**
 * [INPUT]: 无直接运行时代码，描述前端 LLM adapter 目录的职责边界与成员。
 * [OUTPUT]: 对外提供 src/lib/llm 目录地图，约束类型与调用边界。
 * [POS]: src/lib 的 L2 文档，收敛前端所有 LLM 访问点。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
# src/lib/llm/
> L2 | 父级: /src/lib/CLAUDE.md

成员清单
CLAUDE.md: 说明前端 LLM adapter 目录的职责边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
types.ts: Message、ChatOptions 与具名错误类型定义，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
index.ts: 统一导出 chat(messages, options) 封装，负责 JWT 透传与错误映射，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 调用方只知道 chat 接口，不知道 provider 细节。
