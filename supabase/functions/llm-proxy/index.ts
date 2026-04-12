/**
 * [INPUT]: 依赖 Deno 标准运行时、Supabase JWT、Gemini REST API 与函数环境变量。
 * [OUTPUT]: 对外提供 llm-proxy Edge Function HTTP 入口，返回统一成功/错误协议。
 * [POS]: supabase/functions/llm-proxy 的核心入口，负责鉴权、模型转发、超时控制与具名错误映射。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')?.trim() ?? ''
const DEFAULT_GEMINI_MODEL = Deno.env.get('DEFAULT_GEMINI_MODEL')?.trim() || 'gemini-2.5-flash'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')?.trim() ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')?.trim() ?? ''
const REQUEST_TIMEOUT_MS = 30_000

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type RequestBody = {
  messages?: Message[]
  model?: string
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

function jsonResponse(status: number, body: ErrorResponse | SuccessResponse) {
  return new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    status,
  })
}

function errorResponse(status: number, name: ErrorCode, message: string) {
  return jsonResponse(status, {
    error: {
      message,
      name,
    },
  })
}

function extractBearerToken(request: Request) {
  const authHeader = request.headers.get('Authorization') ?? request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  return authHeader.slice('Bearer '.length).trim() || null
}

async function verifyJwt(token: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase runtime configuration')
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
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

function buildGeminiUrl(model: string) {
  const safeModel = model.trim() || DEFAULT_GEMINI_MODEL
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(safeModel)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`
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

function extractGeminiText(payload: GeminiResponse): string | null {
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part?.text ?? '')
    .join('')
    .trim()

  return text ? text : null
}

function isTimeoutError(error: unknown) {
  if (error instanceof DOMException) {
    return error.name === 'AbortError'
  }

  return error instanceof Error && error.name === 'AbortError'
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return errorResponse(405, 'LLMInvalidRequestError', 'Only POST is supported.')
  }

  if (!GEMINI_API_KEY) {
    return errorResponse(500, 'ConfigurationError', 'GEMINI_API_KEY is not configured.')
  }

  const token = extractBearerToken(request)

  if (!token) {
    return errorResponse(401, 'AuthError', 'Missing Supabase bearer token.')
  }

  try {
    const user = await verifyJwt(token)

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

  const model = body.model?.trim() || DEFAULT_GEMINI_MODEL
  const abortController = new AbortController()
  const timeoutId = setTimeout(() => abortController.abort('timeout'), REQUEST_TIMEOUT_MS)

  try {
    const upstreamResponse = await fetch(buildGeminiUrl(model), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toGeminiRequest(body.messages)),
      signal: abortController.signal,
    })

    if (upstreamResponse.status === 429) {
      return errorResponse(429, 'LLMRateLimitError', 'Gemini API rate limit reached.')
    }

    if (!upstreamResponse.ok) {
      return errorResponse(502, 'LLMUpstreamError', 'Gemini API request failed.')
    }

    const payload = await upstreamResponse.json()
    const text = extractGeminiText(payload)

    if (!text) {
      return errorResponse(502, 'LLMInvalidResponseError', 'Gemini returned an invalid response payload.')
    }

    return jsonResponse(200, { model, text })
  } catch (error) {
    if (isTimeoutError(error)) {
      return errorResponse(504, 'LLMTimeoutError', 'Gemini API request timed out.')
    }

    return errorResponse(502, 'LLMUpstreamError', 'Gemini API request failed.')
  } finally {
    clearTimeout(timeoutId)
  }
})
