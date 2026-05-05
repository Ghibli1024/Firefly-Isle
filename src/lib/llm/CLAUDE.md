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
types.ts: Message、ChatProvider、ChatOptions、responseFormat 与具名错误类型定义，覆盖 Gemini/Claude/OpenAI/GLM/DeepSeek/Kimi/custom provider id，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
index.ts: 统一导出 chat(messages, options) 封装，负责 JWT 透传、provider/model/responseFormat 请求协议与错误映射，普通 chat 请求不携带用户 API key，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
index.test.ts: chat 请求协议回归测试，约束 provider、model 与 responseFormat 透传到 Edge Function 且不携带密钥，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
provider-settings.ts: LLM provider 设置客户端，负责调用 llm-proxy/settings 读取、保存、重置 provider/model 设置并过滤任何明文 key 回读，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
provider-settings.test.ts: provider 设置客户端协议测试，约束 preset 携带 model 且不携带 URL、custom 保存、DELETE 重置与明文 key redaction，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 调用方只知道 chat 与 settings 两个边界，不直接触碰 provider SDK 或明文密钥。
