/**
 * [INPUT]: 依赖 vitest 的 fetch mock，依赖 ./handler.ts 的 createLlmProxyHandler。
 * [OUTPUT]: 对外提供 llm-proxy provider 选择、DeepSeek 请求与错误映射测试。
 * [POS]: supabase/functions/llm-proxy 的协议测试，替代本机缺失 Deno 时的最近本地验证层。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it, vi } from 'vitest'

import { createLlmProxyHandler, type RuntimeEnv } from './handler.ts'

const messages = [
  {
    role: 'user' as const,
    content: 'Hello',
  },
]

type FetchCall = {
  body?: unknown
  headers?: Headers
  url: string
}

function createEnv(overrides: Record<string, string | undefined> = {}): RuntimeEnv {
  const values: Record<string, string | undefined> = {
    DEEPSEEK_API_KEY: 'deepseek-key',
    DEFAULT_DEEPSEEK_MODEL: undefined,
    DEFAULT_GEMINI_MODEL: undefined,
    DEFAULT_LLM_PROVIDER: undefined,
    GEMINI_API_KEY: 'gemini-key',
    SUPABASE_ANON_KEY: 'anon-key',
    SUPABASE_URL: 'https://project.supabase.co',
    ...overrides,
  }

  return {
    get: (name: string) => values[name],
  }
}

function createRequest(body: unknown) {
  return new Request('https://edge.test/llm-proxy', {
    body: JSON.stringify(body),
    headers: {
      Authorization: 'Bearer session-token',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
}

function createFetchMock(
  upstreamResponse: Response | Error = deepSeekResponse('deepseek-v4-flash', 'ok'),
  authUser: Record<string, unknown> = { id: 'auth-user' },
) {
  const calls: FetchCall[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString()
    const headers = new Headers(init?.headers)
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined
    calls.push({ body, headers, url })

    if (url.includes('/auth/v1/user')) {
      return new Response(JSON.stringify(authUser), { status: 200 })
    }

    if (upstreamResponse instanceof Error) {
      throw upstreamResponse
    }

    return upstreamResponse
  })

  return { calls, fetchMock }
}

function deepSeekResponse(model: string, content: string | null) {
  return new Response(
    JSON.stringify({
      choices: [
        {
          message: {
            content,
          },
        },
      ],
      model,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    },
  )
}

function createRequestWithIp(body: unknown, ip: string) {
  return new Request('https://edge.test/llm-proxy', {
    body: JSON.stringify(body),
    headers: {
      Authorization: 'Bearer session-token',
      'CF-Connecting-IP': ip,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
}

async function json(response: Response) {
  return response.json() as Promise<{ error?: { name: string }; model?: string; text?: string }>
}

describe('llm-proxy provider handler', () => {
  it('uses Gemini when no provider or default provider is configured', async () => {
    const { calls, fetchMock } = createFetchMock(
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'gemini text' }] } }] }), {
        status: 200,
      }),
    )
    const handler = createLlmProxyHandler({ env: createEnv(), fetch: fetchMock })
    const response = await handler(createRequest({ messages }))
    const payload = await json(response)

    expect(payload).toEqual({ model: 'gemini-2.5-flash', text: 'gemini text' })
    expect(calls[1].url).toContain('generativelanguage.googleapis.com')
  })

  it('uses explicit DeepSeek provider and default non-deprecated model', async () => {
    const { calls, fetchMock } = createFetchMock(deepSeekResponse('deepseek-v4-flash', 'deepseek text'))
    const handler = createLlmProxyHandler({ env: createEnv(), fetch: fetchMock })
    const response = await handler(createRequest({ messages, provider: 'deepseek' }))
    const payload = await json(response)

    expect(payload).toEqual({ model: 'deepseek-v4-flash', text: 'deepseek text' })
    expect(calls[1].url).toBe('https://api.deepseek.com/chat/completions')
    expect(calls[1].headers?.get('Authorization')).toBe('Bearer deepseek-key')
    expect(calls[1].body).toMatchObject({
      messages,
      model: 'deepseek-v4-flash',
      stream: false,
    })
  })

  it('lets an explicit Gemini provider override a DeepSeek default provider', async () => {
    const { calls, fetchMock } = createFetchMock(
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'gemini text' }] } }] }), {
        status: 200,
      }),
    )
    const handler = createLlmProxyHandler({
      env: createEnv({ DEFAULT_LLM_PROVIDER: 'deepseek' }),
      fetch: fetchMock,
    })
    const response = await handler(createRequest({ messages, provider: 'gemini' }))
    const payload = await json(response)

    expect(payload.text).toBe('gemini text')
    expect(calls[1].url).toContain('generativelanguage.googleapis.com')
  })

  it('rejects unknown providers before calling an upstream model', async () => {
    const { calls, fetchMock } = createFetchMock()
    const handler = createLlmProxyHandler({ env: createEnv(), fetch: fetchMock })
    const response = await handler(createRequest({ messages, provider: 'open-router' }))
    const payload = await json(response)

    expect(response.status).toBe(400)
    expect(payload.error?.name).toBe('LLMInvalidRequestError')
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toContain('/auth/v1/user')
  })

  it('forwards JSON object response format to DeepSeek', async () => {
    const { calls, fetchMock } = createFetchMock()
    const handler = createLlmProxyHandler({ env: createEnv(), fetch: fetchMock })
    await handler(
      createRequest({
        messages,
        provider: 'deepseek',
        responseFormat: 'json_object',
      }),
    )

    expect(calls[1].body).toMatchObject({
      response_format: {
        type: 'json_object',
      },
    })
  })

  it.each([
    [createEnv({ DEEPSEEK_API_KEY: '' }), deepSeekResponse('deepseek-v4-flash', 'ok'), 500, 'ConfigurationError'],
    [createEnv(), new Response('{}', { status: 400 }), 400, 'LLMInvalidRequestError'],
    [createEnv(), new Response('{}', { status: 422 }), 400, 'LLMInvalidRequestError'],
    [createEnv(), new Response('{}', { status: 429 }), 429, 'LLMRateLimitError'],
    [createEnv(), deepSeekResponse('deepseek-v4-flash', null), 502, 'LLMInvalidResponseError'],
    [createEnv(), new Response('{}', { status: 503 }), 502, 'LLMUpstreamError'],
  ])('maps DeepSeek failure to a stable error envelope', async (env, upstreamResponse, status, name) => {
    const { fetchMock } = createFetchMock(upstreamResponse)
    const handler = createLlmProxyHandler({ env, fetch: fetchMock })
    const response = await handler(createRequest({ messages, provider: 'deepseek' }))
    const payload = await json(response)

    expect(response.status).toBe(status)
    expect(payload.error?.name).toBe(name)
  })

  it('maps DeepSeek aborts to timeout errors', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' })
    const { fetchMock } = createFetchMock(abortError)
    const handler = createLlmProxyHandler({ env: createEnv(), fetch: fetchMock })
    const response = await handler(createRequest({ messages, provider: 'deepseek' }))
    const payload = await json(response)

    expect(response.status).toBe(504)
    expect(payload.error?.name).toBe('LLMTimeoutError')
  })

  it('rate limits anonymous sessions before calling the upstream model', async () => {
    const { calls, fetchMock } = createFetchMock(
      deepSeekResponse('deepseek-v4-flash', 'deepseek text'),
      { id: 'anon-user-1', is_anonymous: true },
    )
    const handler = createLlmProxyHandler({
      env: createEnv({ LLM_ANONYMOUS_RATE_LIMIT_PER_WINDOW: '1' }),
      fetch: fetchMock,
    })

    const first = await handler(createRequestWithIp({ messages, provider: 'deepseek' }, '203.0.113.10'))
    const second = await handler(createRequestWithIp({ messages, provider: 'deepseek' }, '203.0.113.10'))
    const secondPayload = await json(second)

    expect(first.status).toBe(200)
    expect(second.status).toBe(429)
    expect(secondPayload.error?.name).toBe('LLMRateLimitError')
    expect(calls.filter((call) => call.url.includes('/chat/completions'))).toHaveLength(1)
  })
})
