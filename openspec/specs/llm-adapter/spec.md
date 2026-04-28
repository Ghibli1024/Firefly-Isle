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
系统 SHALL 将所有 LLM 请求通过 Supabase Edge Function 转发，API Key 不得出现在前端代码或网络请求中。

#### Scenario: API Key 不暴露前端
- **WHEN** 前端发起 LLM 请求
- **THEN** 浏览器网络请求中 SHALL 不包含任何 LLM 提供商的 API Key，密钥仅存在于 Edge Function 环境变量中

#### Scenario: Edge Function 请求格式
- **WHEN** LLM Adapter 调用 Supabase Edge Function
- **THEN** 请求 SHALL 携带有效的 Supabase JWT（用户 token 或匿名 token），Edge Function 校验 token 后再转发至 LLM

### Requirement: 支持 Gemini 模型切换
系统 SHALL 支持通过 ChatOptions 指定 Gemini 模型名称，MVP 默认使用 Gemini API。

#### Scenario: 默认模型
- **WHEN** 调用 chat 接口未指定 model 参数
- **THEN** 系统 SHALL 使用配置文件中定义的默认 Gemini 模型（MVP 阶段为 `gemini-2.5-flash` 或同等级别模型）

#### Scenario: 指定模型切换
- **WHEN** 调用 chat 接口时 options.model 有值
- **THEN** Edge Function SHALL 在 Gemini 模型族内使用指定模型名称转发请求，不忽略该参数

### Requirement: 错误处理与重试
系统 SHALL 对 LLM 请求失败（网络超时、限流、非法响应）进行统一错误处理，向上层抛出可识别的错误类型。

#### Scenario: 请求超时处理
- **WHEN** LLM 请求超过 30 秒未返回
- **THEN** 系统 SHALL 中止请求并抛出 `LLMTimeoutError`，调用方可捕获并向用户提示重试

#### Scenario: 限流错误处理
- **WHEN** LLM API 返回 429 状态码
- **THEN** 系统 SHALL 抛出 `LLMRateLimitError`，不自动重试，由调用方决定是否重试
