## Why

当前 LLM 代理只固化 Gemini 调用路径，模型成本、可用性和国内访问表现都被单一 provider 绑定。接入 DeepSeek 可以在不暴露前端 API Key 的前提下，为结构化病史提取提供更适合中文语境与成本控制的服务端模型通道。

## What Changes

- 将 `llm-proxy` 从 Gemini-only 代理演进为支持 DeepSeek 的服务端 LLM 代理。
- 保持前端 `chat(messages, options)` 主接口稳定，调用方仍不直接感知具体模型 SDK 或 API Key。
- 为 Edge Function 增加 DeepSeek 环境变量、默认模型、请求映射、响应解析与错误归一化。
- 允许通过 `ChatOptions` 选择 DeepSeek 模型，同时保留现有 Gemini 路径作为可配置回退或并存 provider。
- 更新部署与示例环境配置，明确 DeepSeek secret 只存在于服务端运行环境。

## Capabilities

### New Capabilities

（无新增 capability；DeepSeek 接入属于既有 LLM adapter 能力的 provider 扩展。）

### Modified Capabilities

- `llm-adapter`: 将现有 Gemini-only 模型切换要求扩展为支持 DeepSeek provider、默认 provider 配置、服务端密钥隔离与统一错误协议。

## Impact

- **Edge Function**: `supabase/functions/llm-proxy/index.ts` 增加 DeepSeek 请求/响应适配与 provider 选择。
- **前端 adapter**: `src/lib/llm/types.ts` 与 `src/lib/llm/index.ts` 扩展 `ChatOptions` 请求协议，但保持 `chat()` 返回文本的公共形态。
- **配置**: `.env.local.example`、`.dev.vars.example`、`wrangler.jsonc` 或 Supabase secret 文档需要增加 DeepSeek 相关环境变量说明。
- **测试**: 需要覆盖 provider 选择、默认配置、DeepSeek 成功响应、限流、超时和非法响应映射。
- **安全边界**: DeepSeek API Key 不得进入前端 bundle、浏览器网络请求或公开 Pages 变量。
