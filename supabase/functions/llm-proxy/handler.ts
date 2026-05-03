/**
 * [INPUT]: 依赖 Fetch API、Supabase JWT 校验端点、Gemini REST API 与 DeepSeek OpenAI-compatible Chat API。
 * [OUTPUT]: 对外提供 createLlmProxyHandler、RuntimeEnv 与 llm-proxy 统一 HTTP 协议。
 * [POS]: supabase/functions/llm-proxy 的可测试核心，把鉴权、provider registry、请求转换与错误映射收敛在一处。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
}

const DEFAULT_DEEPSEEK_MODEL = 'deepseek-v4-flash'
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'
const DEFAULT_LLM_PROVIDER: ChatProvider = 'gemini'
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'

export type RuntimeEnv = {
  get(name: string): string | undefined
}

type RuntimeFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

type HandlerOptions = {
  env: RuntimeEnv
  fetch?: RuntimeFetch
  timeoutMs?: number
}

type ChatProvider = 'gemini' | 'deepseek'
type ResponseFormat = 'text' | 'json_object'

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type RequestBody = {
  messages?: Message[]
  model?: string
  provider?: string
  responseFormat?: string
}

type ErrorCode =
  | 'AuthError'
  | 'ConfigurationError'
  | 'LLMInvalidRequestError'
  | 'LLMInvalidResponseError'
  | 'LLMRateLimitError'
  | 'LLMTimeoutError'
  | 'LLMUpstreamError'

type ErrorResponse = {
  error: {
    message: string
    name: ErrorCode
  }
}

type SuccessResponse = {
  model: string
  text: string
}

type RuntimeConfig = {
  deepseekApiKey: string
  deepseekBaseUrl: string
  defaultDeepseekModel: string
  defaultGeminiModel: string
  defaultLlmProvider: string
  geminiApiKey: string
  supabaseAnonKey: string
  supabaseUrl: string
}

type ProviderRequest = {
  init: RequestInit
  model: string
  url: string
}

type ProviderAdapter = {
  buildRequest(messages: Message[], options: ProviderOptions, config: RuntimeConfig): ProviderRequest | ErrorResponse
  extractText(payload: unknown): string | null
  mapError(status: number): { name: ErrorCode; status: number }
}

type ProviderOptions = {
  model?: string
  responseFormat?: ResponseFormat
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

type DeepSeekResponse = {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
}

function readConfig(env: RuntimeEnv): RuntimeConfig {
  const get = (name: string) => env.get(name)?.trim() ?? ''

  return {
    deepseekApiKey: get('DEEPSEEK_API_KEY'),
    deepseekBaseUrl: get('DEEPSEEK_BASE_URL') || DEEPSEEK_BASE_URL,
    defaultDeepseekModel: get('DEFAULT_DEEPSEEK_MODEL') || DEFAULT_DEEPSEEK_MODEL,
    defaultGeminiModel: get('DEFAULT_GEMINI_MODEL') || DEFAULT_GEMINI_MODEL,
    defaultLlmProvider: get('DEFAULT_LLM_PROVIDER') || DEFAULT_LLM_PROVIDER,
    geminiApiKey: get('GEMINI_API_KEY'),
    supabaseAnonKey: get('SUPABASE_ANON_KEY'),
    supabaseUrl: get('SUPABASE_URL'),
  }
}

function jsonResponse(status: number, body: ErrorResponse | SuccessResponse) {
  return new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    status,
  })
}

function errorBody(name: ErrorCode, message: string): ErrorResponse {
  return {
    error: {
      message,
      name,
    },
  }
}

function errorResponse(status: number, name: ErrorCode, message: string) {
  return jsonResponse(status, errorBody(name, message))
}

function extractBearerToken(request: Request) {
  const authHeader = request.headers.get('Authorization') ?? request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  return authHeader.slice('Bearer '.length).trim() || null
}

async function verifyJwt(token: string, config: RuntimeConfig, runtimeFetch: RuntimeFetch) {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Missing Supabase runtime configuration')
  }

  const response = await runtimeFetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

function validateMessages(messages: Message[] | undefined): messages is Message[] {
  return Array.isArray(messages) && messages.length > 0 && messages.every((message) => {
    const validRole = message?.role === 'system' || message?.role === 'user' || message?.role === 'assistant'
    return validRole && typeof message?.content === 'string' && message.content.trim().length > 0
  })
}

function normalizeProvider(provider: string | undefined): ChatProvider | null {
  if (provider === 'gemini' || provider === 'deepseek') {
    return provider
  }

  return null
}

function normalizeResponseFormat(responseFormat: string | undefined): ResponseFormat | undefined {
  if (responseFormat === 'text' || responseFormat === 'json_object') {
    return responseFormat
  }

  return undefined
}

function toGeminiRequest(messages: Message[]) {
  const systemInstructionText = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content.trim())
    .join('\n\n')
    .trim()

  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      parts: [{ text: message.content }],
      role: message.role === 'assistant' ? 'model' : 'user',
    }))

  if (contents.length === 0) {
    contents.push({
      parts: [{ text: systemInstructionText || 'Continue.' }],
      role: 'user',
    })
  }

  return {
    contents,
    systemInstruction: systemInstructionText
      ? {
          parts: [{ text: systemInstructionText }],
        }
      : undefined,
  }
}

function buildGeminiUrl(model: string, apiKey: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
}

function extractGeminiText(payload: unknown): string | null {
  const text = (payload as GeminiResponse)?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text ?? '')
    .join('')
    .trim()

  return text ? text : null
}

function extractDeepSeekText(payload: unknown): string | null {
  const text = (payload as DeepSeekResponse)?.choices?.[0]?.message?.content?.trim()

  return text ? text : null
}

function buildDeepSeekUrl(config: RuntimeConfig) {
  return `${config.deepseekBaseUrl.replace(/\/$/, '')}/chat/completions`
}

function isErrorResponse(value: ProviderRequest | ErrorResponse): value is ErrorResponse {
  return 'error' in value
}

function isTimeoutError(error: unknown) {
  if (error instanceof DOMException) {
    return error.name === 'AbortError'
  }

  return error instanceof Error && error.name === 'AbortError'
}

const geminiAdapter: ProviderAdapter = {
  buildRequest(messages, options, config) {
    if (!config.geminiApiKey) {
      return errorBody('ConfigurationError', 'GEMINI_API_KEY is not configured.')
    }

    const model = options.model?.trim() || config.defaultGeminiModel

    return {
      init: {
        body: JSON.stringify(toGeminiRequest(messages)),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
      model,
      url: buildGeminiUrl(model, config.geminiApiKey),
    }
  },
  extractText: extractGeminiText,
  mapError(status) {
    if (status === 429) {
      return { name: 'LLMRateLimitError', status: 429 }
    }

    if (status === 400 || status === 422) {
      return { name: 'LLMInvalidRequestError', status: 400 }
    }

    if (status === 401) {
      return { name: 'ConfigurationError', status: 500 }
    }

    return { name: 'LLMUpstreamError', status: 502 }
  },
}

const deepseekAdapter: ProviderAdapter = {
  buildRequest(messages, options, config) {
    if (!config.deepseekApiKey) {
      return errorBody('ConfigurationError', 'DEEPSEEK_API_KEY is not configured.')
    }

    const model = options.model?.trim() || config.defaultDeepseekModel
    const body: Record<string, unknown> = {
      messages,
      model,
      stream: false,
    }

    if (options.responseFormat === 'json_object') {
      body.response_format = { type: 'json_object' }
    }

    return {
      init: {
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${config.deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
      model,
      url: buildDeepSeekUrl(config),
    }
  },
  extractText: extractDeepSeekText,
  mapError(status) {
    if (status === 429) {
      return { name: 'LLMRateLimitError', status: 429 }
    }

    if (status === 400 || status === 422) {
      return { name: 'LLMInvalidRequestError', status: 400 }
    }

    if (status === 401) {
      return { name: 'ConfigurationError', status: 500 }
    }

    return { name: 'LLMUpstreamError', status: 502 }
  },
}

const providerAdapters: Record<ChatProvider, ProviderAdapter> = {
  deepseek: deepseekAdapter,
  gemini: geminiAdapter,
}

function getProvider(body: RequestBody, config: RuntimeConfig): ChatProvider | ErrorResponse {
  const requestedProvider = body.provider?.trim()
  const provider = requestedProvider || config.defaultLlmProvider
  const normalizedProvider = normalizeProvider(provider)

  if (!normalizedProvider) {
    return requestedProvider
      ? errorBody('LLMInvalidRequestError', 'Unsupported LLM provider.')
      : errorBody('ConfigurationError', 'DEFAULT_LLM_PROVIDER is invalid.')
  }

  return normalizedProvider
}

async function fetchUpstream(
  provider: ChatProvider,
  providerRequest: ProviderRequest,
  adapter: ProviderAdapter,
  runtimeFetch: RuntimeFetch,
  timeoutMs: number,
) {
  const abortController = new AbortController()
  const timeoutId = setTimeout(() => abortController.abort('timeout'), timeoutMs)

  try {
    const upstreamResponse = await runtimeFetch(providerRequest.url, {
      ...providerRequest.init,
      signal: abortController.signal,
    })

    if (!upstreamResponse.ok) {
      const mappedError = adapter.mapError(upstreamResponse.status)
      return errorResponse(mappedError.status, mappedError.name, `${provider} API request failed.`)
    }

    const payload = await upstreamResponse.json()
    const text = adapter.extractText(payload)

    if (!text) {
      return errorResponse(502, 'LLMInvalidResponseError', `${provider} returned an invalid response payload.`)
    }

    return jsonResponse(200, { model: providerRequest.model, text })
  } catch (error) {
    if (isTimeoutError(error)) {
      return errorResponse(504, 'LLMTimeoutError', `${provider} API request timed out.`)
    }

    return errorResponse(502, 'LLMUpstreamError', `${provider} API request failed.`)
  } finally {
    clearTimeout(timeoutId)
  }
}

export function createLlmProxyHandler(options: HandlerOptions) {
  const runtimeFetch = options.fetch ?? fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS

  return async function handleLlmProxyRequest(request: Request) {
    const config = readConfig(options.env)

    if (request.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    if (request.method !== 'POST') {
      return errorResponse(405, 'LLMInvalidRequestError', 'Only POST is supported.')
    }

    const token = extractBearerToken(request)

    if (!token) {
      return errorResponse(401, 'AuthError', 'Missing Supabase bearer token.')
    }

    try {
      const user = await verifyJwt(token, config, runtimeFetch)

      if (!user) {
        return errorResponse(401, 'AuthError', 'Invalid Supabase session.')
      }
    } catch {
      return errorResponse(500, 'ConfigurationError', 'Supabase auth verification failed.')
    }

    let body: RequestBody

    try {
      body = await request.json()
    } catch {
      return errorResponse(400, 'LLMInvalidRequestError', 'Request body must be valid JSON.')
    }

    if (!validateMessages(body.messages)) {
      return errorResponse(400, 'LLMInvalidRequestError', 'messages must be a non-empty array of valid chat messages.')
    }

    const provider = getProvider(body, config)

    if (typeof provider !== 'string') {
      return jsonResponse(provider.error.name === 'ConfigurationError' ? 500 : 400, provider)
    }

    const adapter = providerAdapters[provider]
    const providerRequest = adapter.buildRequest(
      body.messages,
      {
        model: body.model,
        responseFormat: normalizeResponseFormat(body.responseFormat),
      },
      config,
    )

    if (isErrorResponse(providerRequest)) {
      return jsonResponse(providerRequest.error.name === 'ConfigurationError' ? 500 : 400, providerRequest)
    }

    return fetchUpstream(provider, providerRequest, adapter, runtimeFetch, timeoutMs)
  }
}
