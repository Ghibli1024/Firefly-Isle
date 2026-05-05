## Purpose

定义 LLM Adapter 的统一 chat 接口、Supabase Edge Function 代理边界、模型切换与错误处理规则。
## Requirements
### Requirement: 统一 chat 接口
系统 SHALL 提供统一的 `chat(messages, options)` 接口，调用方无需感知底层 LLM 提供商差异。

#### Scenario: 接口签名一致性
- **WHEN** 任何模块调用 LLM Adapter
- **THEN** 调用方 SHALL 仅使用 `chat(messages: Message[], options?: ChatOptions): Promise<string>` 接口，不直接调用任何 LLM SDK

#### Scenario: Message 类型定义
- **WHEN** 构造 messages 数组
- **THEN** 每条消息 SHALL 包含 `role`（'user' | 'assistant' | 'system'）和 `content`（string）两个必填字段

### Requirement: 通过 Supabase Edge Function 代理
系统 SHALL 将所有 LLM 请求通过 Supabase Edge Function 转发，API Key 不得出现在前端代码或普通 chat 网络请求中，并 SHALL 在 Edge Function 内完成 provider 选择、JWT 校验、用户设置读取与外部模型转发。

#### Scenario: API Key 不暴露前端
- **WHEN** 前端发起 LLM chat 请求
- **THEN** 浏览器网络请求中 SHALL 不包含任何 LLM 提供商的 API Key
- **AND** 系统默认 Gemini 与 DeepSeek 的密钥 SHALL 仅存在于 Edge Function 服务端环境变量或 secret 中
- **AND** 用户自带 provider 的 API key SHALL 仅在保存设置时发送给 Edge Function，后续读取设置与 chat 请求 SHALL NOT 返回或携带明文 key

#### Scenario: Edge Function 请求格式
- **WHEN** LLM Adapter 调用 Supabase Edge Function
- **THEN** 请求 SHALL 携带有效的 Supabase JWT（用户 token 或匿名 token）
- **AND** 请求 MAY 携带 `provider`、`model` 与 `responseFormat`
- **AND** Edge Function SHALL 校验 token、读取用户设置、校验 provider 后再转发至外部 LLM

### Requirement: 错误处理与重试
系统 SHALL 对 LLM 请求失败（网络超时、限流、非法请求、配置错误、非法响应）进行统一错误处理，向上层抛出可识别的错误类型。

#### Scenario: 请求超时处理
- **WHEN** LLM 请求超过 30 秒未返回
- **THEN** 系统 SHALL 中止请求并抛出 `LLMTimeoutError`
- **AND** 调用方 SHALL 可捕获并向用户提示重试

#### Scenario: 限流错误处理
- **WHEN** Gemini 或 DeepSeek API 返回 429 状态码
- **THEN** 系统 SHALL 抛出 `LLMRateLimitError`
- **AND** 系统 SHALL NOT 自动重试，由调用方决定是否重试

#### Scenario: DeepSeek 配置错误处理
- **WHEN** DeepSeek provider 被选择但 `DEEPSEEK_API_KEY` 缺失或上游返回认证失败
- **THEN** Edge Function SHALL 返回 `ConfigurationError`
- **AND** 响应 SHALL NOT 泄露 API Key、secret 名称以外的敏感值或上游原始凭证信息

#### Scenario: DeepSeek 上游不可用处理
- **WHEN** DeepSeek API 返回余额不足、服务器错误或过载状态
- **THEN** Edge Function SHALL 返回 `LLMUpstreamError`
- **AND** 前端 SHALL 保持现有用户可读失败提示

### Requirement: 支持服务端模型提供商切换
系统 SHALL 支持在 Supabase Edge Function 内选择受允许的 LLM provider，并 SHALL 支持系统默认 DeepSeek、Gemini、Claude、OpenAI、GLM、DeepSeek、Kimi 与自定义 OpenAI 风格 provider。

#### Scenario: 默认 provider 回落 DeepSeek
- **WHEN** 前端调用 `chat(messages, options)` 且该用户没有保存 provider 设置
- **THEN** Edge Function SHALL 使用系统 DeepSeek provider
- **AND** `DEFAULT_LLM_PROVIDER` 未配置时 SHALL 回落到 DeepSeek 而不是 Gemini

#### Scenario: 用户 provider 设置优先
- **WHEN** 用户保存了自带 provider 设置并发起 `chat(messages, options)`
- **THEN** Edge Function SHALL 优先使用该用户保存的 provider 设置
- **AND** 前端 SHALL NOT 在 chat 请求体中携带用户 API key

#### Scenario: 显式选择 DeepSeek provider
- **WHEN** 前端调用 `chat(messages, { provider: 'deepseek', model })` 且该用户没有保存 provider 设置
- **THEN** Edge Function SHALL 使用 DeepSeek API 转发请求
- **AND** SHALL 使用 `model` 或服务端 `DEFAULT_DEEPSEEK_MODEL` 作为 DeepSeek 模型名

#### Scenario: 拒绝未知 provider
- **WHEN** 请求体或保存的设置包含非允许 provider 值
- **THEN** Edge Function SHALL 返回 `LLMInvalidRequestError`
- **AND** SHALL NOT 向任何外部模型服务发起请求

#### Scenario: DeepSeek 默认模型不使用弃用别名
- **WHEN** 服务端未显式配置 `DEFAULT_DEEPSEEK_MODEL`
- **THEN** Edge Function SHALL 默认使用当前非弃用 DeepSeek 模型名 `deepseek-v4-flash`
- **AND** 项目文档 SHALL NOT 把 `deepseek-chat` 或 `deepseek-reasoner` 作为默认配置值

### Requirement: DeepSeek JSON 输出模式
系统 SHALL 支持为 DeepSeek 请求启用 JSON 输出模式，用于自然语言病历结构化提取。

#### Scenario: JSON response format 转发
- **WHEN** 调用方通过 `ChatOptions` 请求 `responseFormat: 'json_object'` 且 provider 为 `deepseek`
- **THEN** Edge Function SHALL 向 DeepSeek 请求体添加 `response_format: { "type": "json_object" }`
- **AND** SHALL 保持 messages 中要求输出 JSON 的 prompt 约束

#### Scenario: DeepSeek 成功响应提取
- **WHEN** DeepSeek 返回非 streaming chat completion 响应
- **THEN** Edge Function SHALL 从 `choices[0].message.content` 提取文本
- **AND** SHALL 以现有 `{ model, text }` 成功协议返回给前端

#### Scenario: DeepSeek 空内容响应
- **WHEN** DeepSeek 返回 2xx 响应但 `choices[0].message.content` 为空或缺失
- **THEN** Edge Function SHALL 返回 `LLMInvalidResponseError`
- **AND** 前端 SHALL 保持现有解析失败与重试提示路径
