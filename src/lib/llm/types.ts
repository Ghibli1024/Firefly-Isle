/**
 * [INPUT]: 无运行时依赖，只定义前端 LLM adapter 的公共消息、参数与错误类型。
 * [OUTPUT]: 对外提供 Message、ChatOptions、ChatErrorName、ChatError 与 ChatResult 类型。
 * [POS]: src/lib/llm 的类型边界文件，被 chat 封装与上层业务共同消费。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type ChatOptions = {
  model?: string
}

export type ChatErrorName =
  | 'AuthError'
  | 'ConfigurationError'
  | 'LLMInvalidRequestError'
  | 'LLMInvalidResponseError'
  | 'LLMRateLimitError'
  | 'LLMTimeoutError'
  | 'LLMUpstreamError'

export type ChatErrorPayload = {
  error?: {
    message?: string
    name?: string
  }
}

export type ChatSuccessPayload = {
  model?: string
  text?: string
}

export class ChatError extends Error {
  name: ChatErrorName
  status?: number

  constructor(name: ChatErrorName, message: string, status?: number) {
    super(message)
    this.name = name
    this.status = status
  }
}

export type ChatResult = {
  model: string
  text: string
}
