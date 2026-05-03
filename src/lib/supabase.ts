/**
 * [INPUT]: 依赖 @supabase/supabase-js 的 createClient，依赖 Vite 注入的 Supabase 环境变量。
 * [OUTPUT]: 对外提供 getSupabaseClient、hasSupabaseEnv、hasSupabaseFunctionEnv、hasWechatAuthProvider、supabaseEnv、supabaseEdgeFunctionUrl 与 wechatAuthProvider，Auth 使用 PKCE URL 回调恢复。
 * [POS]: lib 的 BaaS 边界入口，把客户端初始化与环境变量读取锁在一处。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''
const supabaseEdgeFunctionUrl = import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL?.trim() ?? ''
const wechatAuthProvider = import.meta.env.VITE_SUPABASE_WECHAT_PROVIDER?.trim() ?? ''

let client: SupabaseClient | null = null

export const hasSupabaseEnv = supabaseUrl.length > 0 && supabaseAnonKey.length > 0
export const hasSupabaseFunctionEnv = supabaseEdgeFunctionUrl.length > 0
export const hasWechatAuthProvider = /^custom:[a-z0-9][a-z0-9_-]*$/i.test(wechatAuthProvider)

export const supabaseEnv = {
  supabaseUrl,
  supabaseAnonKey,
  supabaseEdgeFunctionUrl,
  wechatAuthProvider,
}

export { supabaseEdgeFunctionUrl }
export { wechatAuthProvider }

export function getSupabaseClient() {
  if (!hasSupabaseEnv) {
    throw new Error('Missing Supabase environment variables in .env.local')
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
      },
    })
  }

  return client
}
