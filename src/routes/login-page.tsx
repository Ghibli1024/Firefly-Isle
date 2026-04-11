/**
 * [INPUT]: 依赖 react 的表单状态 hooks，依赖 @/components/login-page-view 的展示层，依赖 @/lib/theme 与 @/lib/supabase 的认证边界。
 * [OUTPUT]: 对外提供 LoginPage 组件，对应 /login。
 * [POS]: routes 的登录页容器，管理邮箱登录、注册、匿名进入与主题切换，不承载大段设计复刻 markup。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { type FormEvent, useState } from 'react'

import {
  type AuthFeedback,
  type AuthMode,
  LoginPageView,
} from '@/components/login-page-view'
import { getSupabaseClient, hasSupabaseEnv } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'

export function LoginPage({ authError = null }: { authError?: string | null }) {
  const { theme, toggleTheme } = useTheme()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!hasSupabaseEnv) {
      setFeedback({ tone: 'error', message: '缺少 Supabase 环境变量，当前无法完成认证。' })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    const supabase = getSupabaseClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setFeedback({ tone: 'error', message: '邮箱或密码错误，请重新确认后再试。' })
        setIsSubmitting(false)
        return
      }

      setFeedback({ tone: 'neutral', message: '认证成功，正在进入工作区。' })
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      setFeedback({ tone: 'error', message: '暂时无法完成注册，请稍后再试。' })
      setIsSubmitting(false)
      return
    }

    setPassword('')
    setMode('login')
    setFeedback({ tone: 'success', message: '注册成功，请查收验证邮件。' })
    setIsSubmitting(false)
  }

  const handleAnonymousLogin = async () => {
    if (!hasSupabaseEnv) {
      setFeedback({ tone: 'error', message: '缺少 Supabase 环境变量，当前无法进入匿名模式。' })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    const { error } = await getSupabaseClient().auth.signInAnonymously()

    if (error) {
      setFeedback({ tone: 'error', message: '匿名入口暂时不可用，请稍后再试。' })
      setIsSubmitting(false)
      return
    }

    setFeedback({ tone: 'neutral', message: '匿名会话已建立，正在进入工作区。' })
    setIsSubmitting(false)
  }

  return (
    <LoginPageView
      authError={authError}
      email={email}
      feedback={feedback}
      isSubmitting={isSubmitting}
      mode={mode}
      onAnonymousLogin={handleAnonymousLogin}
      onEmailChange={setEmail}
      onModeChange={setMode}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onToggleTheme={toggleTheme}
      password={password}
      theme={theme}
    />
  )
}
