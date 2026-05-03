## Context

当前 LLM 边界是 `src/lib/llm/chat(messages, options)` → `supabase/functions/llm-proxy` → Gemini REST API。这个形状是对的：前端不知道 provider，API Key 不进浏览器，所有失败收敛成具名错误。问题是 `llm-proxy` 现在把 Gemini 的 URL、请求体、响应解析和错误文案写死在同一个文件里，接入 DeepSeek 如果继续堆分支，会把代理层变成 provider 细节的泥团。

DeepSeek 官方文档当前给出的 OpenAI 格式 base URL 是 `https://api.deepseek.com`，聊天端点是 `/chat/completions`，认证使用 `Authorization: Bearer ${DEEPSEEK_API_KEY}`。截至 2026-05-02，推荐模型名是 `deepseek-v4-flash` 与 `deepseek-v4-pro`，`deepseek-chat` 和 `deepseek-reasoner` 标记为 2026-07-24 弃用兼容别名。DeepSeek 支持 `response_format: { "type": "json_object" }`，但仍要求 prompt 自己明确要求 JSON，并给足 `max_tokens`，否则可能出现空内容或截断。

## Goals / Non-Goals

**Goals:**

- 在不暴露 DeepSeek API Key 的前提下，让现有 LLM proxy 支持 DeepSeek。
- 保持前端 `chat(messages, options): Promise<string>` 调用形态稳定。
- 用服务端配置决定默认 provider，并允许调用方显式指定 `provider` 与 `model`。
- 保留 Gemini 路径，便于回退、对照和灰度切换。
- 对 DeepSeek 的成功、限流、认证/余额配置错误、超时和非法响应做统一映射。
- 为结构化病历提取提供 DeepSeek JSON 输出模式。

**Non-Goals:**

- 不增加用户可见的模型选择 UI。
- 不引入完整多 provider 路由平台、计费面板或运行时管理后台。
- 不接入 DeepSeek streaming、tool calls、Anthropic 格式或 beta prefix completion。
- 不迁移数据库结构，不改变 `PatientRecord`、追问流程或表格渲染规则。

## Decisions

### 1. 继续使用 Supabase Edge Function 作为唯一模型出口

DeepSeek 接入仍走 `llm-proxy`，前端只把 `messages` 和可选 `options` 发给 Edge Function。直接前端调用 DeepSeek 会泄露 API Key；新增独立后端服务会复制鉴权、部署、错误映射和日志边界。现有 Edge Function 已经掌握 Supabase JWT 校验，是这个系统里唯一该知道外部模型密钥的位置。

### 2. 用 provider adapter 表消除分支扩散

`llm-proxy` 内部使用一个小型 provider registry：

```ts
const providers = {
  gemini: geminiAdapter,
  deepseek: deepseekAdapter,
}
```

每个 adapter 只负责四件事：读取自身配置、构造 upstream request、提取文本、映射 upstream 错误。主处理函数只做认证、输入校验、选择 provider、超时控制和统一响应。这样新增 provider 是添一个 adapter，不是在主函数里增加一串 `if/else`。

### 3. 前端协议只扩展 `ChatOptions`，不扩展调用面

`ChatOptions` 增加：

- `provider?: 'gemini' | 'deepseek'`
- `model?: string`
- `responseFormat?: 'text' | 'json_object'`

`chat()` 仍返回 `Promise<string>`。调用方需要结构化输出时传 `responseFormat: 'json_object'`；当前 `extractPatientRecord()` 可以直接使用这个选项，而不用知道 DeepSeek 的 REST shape。

### 4. DeepSeek 默认使用非弃用模型名

服务端新增配置：

- `DEFAULT_LLM_PROVIDER=gemini|deepseek`
- `DEEPSEEK_API_KEY`
- `DEFAULT_DEEPSEEK_MODEL=deepseek-v4-flash`
- `DEEPSEEK_BASE_URL=https://api.deepseek.com` 可选，主要用于测试或代理环境

实现不把 `deepseek-chat` / `deepseek-reasoner` 作为默认值。若用户显式传入兼容别名，可以转发，但测试与文档应使用 `deepseek-v4-flash` / `deepseek-v4-pro`。

### 5. DeepSeek 请求走非 streaming OpenAI chat completion 格式

DeepSeek adapter 发送：

- `POST ${DEEPSEEK_BASE_URL}/chat/completions`
- `model`
- `messages`
- `stream: false`
- `response_format: { type: 'json_object' }`，仅当 `responseFormat === 'json_object'`

响应只读取 `choices[0].message.content`。`reasoning_content`、usage、tool calls 和 stream chunk 不进入前端协议。结构化提取的 prompt 已经要求“只输出合法 JSON”，正好满足 DeepSeek JSON Output 的 prompt 约束。

### 6. 错误映射保持现有错误族

不为 DeepSeek 新增一批 UI 必须理解的错误名。映射规则：

- 429 → `LLMRateLimitError`
- abort/timeout → `LLMTimeoutError`
- 400/422 → `LLMInvalidRequestError`
- 401 或缺少 `DEEPSEEK_API_KEY` → `ConfigurationError`
- 402、500、503 和其他非 2xx → `LLMUpstreamError`
- 2xx 但缺少文本内容 → `LLMInvalidResponseError`

用户看到的是稳定、温和、可重试的产品文案；技术细节留在服务端日志与测试夹具里。

## Risks / Trade-offs

- DeepSeek 模型名和价格会继续变化 → 使用环境变量保存默认模型，文档记录当前官方推荐名，避免把旧兼容别名写死成默认值。
- JSON Output 仍可能返回空内容或被截断 → 保留 `parsePatientRecordResponse()` 的 JSON 解析失败路径，并把空 content 映射为 `LLMInvalidResponseError`。
- 多 provider 会带来配置歧义 → 只允许 `gemini` 和 `deepseek`，未知 provider 直接返回 `LLMInvalidRequestError`。
- DeepSeek 长连接与限流行为可能让 30 秒超时过短 → 本次保持现有 30 秒用户体验边界；若真实病历提取经常超时，再单独评估超时策略。
- 保留 Gemini 会多一条运行路径 → 这是有意的回退通道，不进入 UI，不扩大用户心智负担。

## Migration Plan

1. 先补 provider 选择、DeepSeek 请求构造、响应解析和错误映射测试。
2. 重构 `llm-proxy` 为主处理函数 + provider adapter 表。
3. 扩展 `ChatOptions` 与前端请求 body，更新 `extractPatientRecord()` 使用 JSON response format。
4. 增加 `.env.local.example`、`.dev.vars.example`、README 或相关部署文档中的 DeepSeek 配置说明。
5. 在 Supabase Edge Function secrets 中配置 `DEEPSEEK_API_KEY` 与可选默认 provider/model。
6. 部署后先用 `DEFAULT_LLM_PROVIDER=gemini` 验证无回归，再切到 `deepseek` 做一轮结构化提取验证。
7. 回滚只需要把 `DEFAULT_LLM_PROVIDER` 切回 `gemini`，或撤销 Edge Function 部署。

## Open Questions

- 生产环境默认 provider 是否立即切换到 `deepseek`，还是先保持 `gemini` 并用显式 option 灰度验证？
- DeepSeek 余额、限流和中国大陆链路是否已在目标账号上实测？
- 病历提取是否需要 `deepseek-v4-pro`，还是 `deepseek-v4-flash` 的成本/速度已经足够？
