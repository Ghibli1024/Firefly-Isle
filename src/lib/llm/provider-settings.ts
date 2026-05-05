/**
 * [INPUT]: 依赖 @/lib/supabase 的 Supabase session 与 Edge Function URL，依赖 ./types 的 ChatError。
 * [OUTPUT]: 对外提供 LLM provider 设置读取、保存、重置 API 与公开设置类型，preset/custom 均保存模型名但不回读明文 key。
 * [POS]: src/lib/llm 的 provider 设置客户端，只负责浏览器到 llm-proxy/settings 的认证请求协议。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { getSupabaseClient, hasSupabaseEnv, hasSupabaseFunctionEnv, supabaseEdgeFunctionUrl } from '@/lib/supabase'

import { ChatError, type ChatErrorPayload } from './types'

export type LlmProviderId = 'gemini' | 'claude' | 'openai' | 'glm' | 'deepseek' | 'kimi' | 'custom_openai'

export type LlmProviderSettingView = {
  baseUrl?: string
  keySet: boolean
  mode: 'system' | 'user'
  model?: string
  provider: LlmProviderId
}

export type SaveLlmProviderSettingInput =
  | {
      apiKey: string
      model: string
      provider: Exclude<LlmProviderId, 'custom_openai'>
    }
  | {
      apiKey: string
      baseUrl: string
      model: string
      provider: 'custom_openai'
    }

function buildSettingsUrl() {
  return `${supabaseEdgeFunctionUrl.replace(/\/$/, '')}/llm-proxy/settings`
}

function ensureConfigured() {
  if (!hasSupabaseEnv || !hasSupabaseFunctionEnv) {
    throw new ChatError('ConfigurationError', 'Missing Supabase LLM environment variables.')
  }
}

async function getAccessToken() {
  const { data, error } = await getSupabaseClient().auth.getSession()

  if (error || !data.session?.access_token) {
    throw new ChatError('AuthError', 'Missing Supabase session for LLM provider settings.')
  }

  return data.session.access_token
}

async function parsePayload(response: Response) {
  try {
    return await response.json()
  } catch {
    throw new ChatError('LLMInvalidResponseError', 'LLM provider settings returned non-JSON content.', response.status)
  }
}

function toChatError(payload: ChatErrorPayload, status: number) {
  const name = payload?.error?.name
  const message = payload?.error?.message

  if (typeof name === 'string' && typeof message === 'string') {
    return new ChatError(name as ChatError['name'], message, status)
  }

  return new ChatError('LLMInvalidResponseError', 'LLM provider settings returned an invalid error payload.', status)
}

function sanitizeSetting(payload: Record<string, unknown>): LlmProviderSettingView {
  const mode = payload.mode === 'user' ? 'user' : 'system'
  const provider = typeof payload.provider === 'string' ? payload.provider : 'deepseek'

  if (!isProvider(provider)) {
    throw new ChatError('LLMInvalidResponseError', 'LLM provider settings returned an invalid provider.')
  }

  return {
    baseUrl: typeof payload.baseUrl === 'string' ? payload.baseUrl : undefined,
    keySet: payload.keySet === true,
    mode,
    model: typeof payload.model === 'string' ? payload.model : undefined,
    provider,
  }
}

function isProvider(provider: string): provider is LlmProviderId {
  return provider === 'gemini'
    || provider === 'claude'
    || provider === 'openai'
    || provider === 'glm'
    || provider === 'deepseek'
    || provider === 'kimi'
    || provider === 'custom_openai'
}

async function requestProviderSetting(method: 'DELETE' | 'GET' | 'PUT', body?: SaveLlmProviderSettingInput) {
  ensureConfigured()

  const accessToken = await getAccessToken()
  const response = await fetch(buildSettingsUrl(), {
    body: body ? JSON.stringify(body) : undefined,
    headers: body
      ? {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      : {
          Authorization: `Bearer ${accessToken}`,
        },
    method,
  })
  const payload = await parsePayload(response)

  if (!response.ok) {
    throw toChatError(payload as ChatErrorPayload, response.status)
  }

  return sanitizeSetting(payload as Record<string, unknown>)
}

export function getLlmProviderSetting() {
  return requestProviderSetting('GET')
}

export function saveLlmProviderSetting(input: SaveLlmProviderSettingInput) {
  return requestProviderSetting('PUT', input)
}

export function resetLlmProviderSetting() {
  return requestProviderSetting('DELETE')
}
