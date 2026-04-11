/**
 * [INPUT]: 依赖 react 的 Context、hooks，依赖 @supabase/supabase-js 的 Session/User，依赖 @/lib/supabase 的客户端入口。
 * [OUTPUT]: 对外提供 AuthProvider 与 useAuth。
 * [POS]: lib 的认证状态中心，统一管理 session 恢复、认证状态广播与登出动作。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { getSupabaseClient, hasSupabaseEnv } from '@/lib/supabase'

type AuthContextValue = {
  authError: string | null
  isAuthenticated: boolean
  isAuthReady: boolean
  isSigningOut: boolean
  session: Session | null
  signOut: () => Promise<boolean>
  user: User | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setAuthError('缺少 Supabase 认证环境变量，请检查 .env.local。')
      setIsAuthReady(true)
      return
    }

    const supabase = getSupabaseClient()
    let active = true

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) {
          return
        }

        if (error) {
          setAuthError('无法恢复登录状态，请刷新后重试。')
          setSession(null)
        } else {
          setAuthError(null)
          setSession(data.session ?? null)
        }

        setIsAuthReady(true)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setAuthError('无法恢复登录状态，请刷新后重试。')
        setSession(null)
        setIsAuthReady(true)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return
      }

      setSession(nextSession ?? null)
      setAuthError(null)
      setIsAuthReady(true)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!hasSupabaseEnv) {
      setAuthError('缺少 Supabase 认证环境变量，请检查 .env.local。')
      return false
    }

    setIsSigningOut(true)

    try {
      const { error } = await getSupabaseClient().auth.signOut()

      if (error) {
        setAuthError('退出失败，请稍后再试。')
        return false
      }

      setSession(null)
      setAuthError(null)
      return true
    } finally {
      setIsSigningOut(false)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      authError,
      isAuthenticated: session !== null,
      isAuthReady,
      isSigningOut,
      session,
      signOut,
      user: session?.user ?? null,
    }),
    [authError, isAuthReady, isSigningOut, session, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
