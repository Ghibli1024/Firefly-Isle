/**
 * [INPUT]: 依赖 react 的表单状态 hooks，依赖 @/components/login-page-view 的展示层，依赖 ./login-page.logic 的认证动作，依赖 @/lib/theme 与 @/lib/supabase 的认证边界。
 * [OUTPUT]: 对外提供 LoginPage 组件，对应 /login。
 * [POS]: routes 的登录页容器，管理邮箱登录、注册、重置密码、Google OAuth 启动、匿名进入与主题切换，不承载大段设计复刻 markup。
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

import {
  getAuthRedirectTo,
  startAnonymousAuth,
  startGoogleAuth,
  submitEmailAuth,
  type AuthActionResult,
} from './login-page.logic'

function missingEnvFeedback(mode: AuthMode): AuthFeedback {
  if (mode === 'password-reset') {
    return { tone: 'error', message: '缺少 Supabase 环境变量，当前无法发送重置邮件。' }
  }

  return { tone: 'error', message: '缺少 Supabase 环境变量，当前无法完成认证。' }
}

function unexpectedFeedback(mode: AuthMode): AuthFeedback {
  if (mode === 'password-reset') {
    return { tone: 'error', message: '暂时无法发送重置邮件，请稍后再试。' }
  }

  return { tone: 'error', message: '认证服务暂时不可用，请稍后再试。' }
}

export function LoginPage({ authError = null }: { authError?: string | null }) {
  const { theme, toggleTheme } = useTheme()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const applyAuthResult = (result: AuthActionResult) => {
    if (result.clearPassword) {
      setPassword('')
    }

    if (result.nextMode) {
      setMode(result.nextMode)
    }

    setFeedback(result.feedback)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!hasSupabaseEnv) {
      setFeedback(missingEnvFeedback(mode))
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      applyAuthResult(
        await submitEmailAuth({
          auth: getSupabaseClient().auth,
          email,
          mode,
          password,
          passwordResetRedirectTo: getAuthRedirectTo('/login'),
        }),
      )
    } catch {
      setFeedback(unexpectedFeedback(mode))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnonymousLogin = async () => {
    if (!hasSupabaseEnv) {
      setFeedback({ tone: 'error', message: '缺少 Supabase 环境变量，当前无法进入匿名模式。' })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      applyAuthResult(await startAnonymousAuth(getSupabaseClient().auth))
    } catch {
      setFeedback({ tone: 'error', message: '匿名入口暂时不可用，请稍后再试。' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!hasSupabaseEnv) {
      setFeedback({ tone: 'error', message: '缺少 Supabase 环境变量，当前无法使用 Google 登录。' })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      applyAuthResult(await startGoogleAuth(getSupabaseClient().auth, getAuthRedirectTo('/auth/callback')))
    } catch {
      setFeedback({ tone: 'error', message: 'Google 登录暂时不可用，请稍后再试。' })
    } finally {
      setIsSubmitting(false)
    }
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
      onGoogleLogin={handleGoogleLogin}
      onModeChange={setMode}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onToggleTheme={toggleTheme}
      password={password}
      theme={theme}
    />
  )
}
