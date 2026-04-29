/**
 * [INPUT]: 依赖 @/components/login-page-view 的 AuthMode/AuthFeedback 类型，依赖 Supabase Auth 方法的结构化子集。
 * [OUTPUT]: 对外提供 submitEmailAuth、startAnonymousAuth、startGoogleAuth、getAuthRedirectTo 与 LoginAuthClient 类型，Google redirect 默认落公共 callback 并强制账号选择。
 * [POS]: routes 的登录页动作层，隔离 Supabase Auth 调用、反馈文案与模式跳转，让 login-page.tsx 只负责状态接线。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { AuthFeedback, AuthMode } from '@/components/login-page-view'

export type LoginAuthClient = {
  resetPasswordForEmail: (email: string, options?: { redirectTo?: string }) => Promise<{ error: unknown | null }>
  signInAnonymously: () => Promise<{ error: unknown | null }>
  signInWithOAuth: (input: {
    provider: 'google'
    options?: { queryParams?: { prompt?: 'select_account' }; redirectTo?: string }
  }) => Promise<{ error: unknown | null }>
  signInWithPassword: (input: { email: string; password: string }) => Promise<{ error: unknown | null }>
  signUp: (input: { email: string; password: string }) => Promise<{ data: { session: unknown | null } | null; error: unknown | null }>
}

export type AuthActionResult = {
  clearPassword?: boolean
  feedback: AuthFeedback
  nextMode?: AuthMode
}

type SubmitEmailAuthInput = {
  auth: LoginAuthClient
  email: string
  mode: AuthMode
  password: string
  passwordResetRedirectTo?: string
}

export function getAuthRedirectTo(path: '/app' | '/auth/callback' | '/login' = '/app') {
  if (typeof window === 'undefined') {
    return undefined
  }

  return `${window.location.origin}${path}`
}

function withRedirect(redirectTo?: string) {
  return redirectTo ? { redirectTo } : undefined
}

function withGoogleAccountSelection(redirectTo?: string) {
  return {
    ...withRedirect(redirectTo),
    queryParams: { prompt: 'select_account' as const },
  }
}

export async function submitEmailAuth({
  auth,
  email,
  mode,
  password,
  passwordResetRedirectTo,
}: SubmitEmailAuthInput): Promise<AuthActionResult> {
  if (mode === 'password-reset') {
    const { error } = await auth.resetPasswordForEmail(email, withRedirect(passwordResetRedirectTo))

    if (error) {
      return {
        feedback: { message: '暂时无法发送重置邮件，请稍后再试。', tone: 'error' },
      }
    }

    return {
      feedback: { message: '如果该邮箱已注册，我们会发送重置邮件。', tone: 'success' },
      nextMode: 'login',
    }
  }

  if (mode === 'login') {
    const { error } = await auth.signInWithPassword({ email, password })

    if (error) {
      return {
        feedback: { message: '邮箱或密码错误，请重新确认后再试。', tone: 'error' },
      }
    }

    return {
      feedback: { message: '认证成功，正在进入工作区。', tone: 'neutral' },
    }
  }

  const { data, error } = await auth.signUp({ email, password })

  if (error) {
    return {
      feedback: { message: '暂时无法完成注册，请稍后再试。', tone: 'error' },
    }
  }

  if (data?.session) {
    return {
      clearPassword: true,
      feedback: { message: '注册成功，正在进入工作区。', tone: 'neutral' },
    }
  }

  return {
    clearPassword: true,
    feedback: { message: '注册成功，请查收验证邮件。', tone: 'success' },
    nextMode: 'login',
  }
}

export async function startAnonymousAuth(auth: LoginAuthClient): Promise<AuthActionResult> {
  const { error } = await auth.signInAnonymously()

  if (error) {
    return {
      feedback: { message: '匿名入口暂时不可用，请稍后再试。', tone: 'error' },
    }
  }

  return {
    feedback: { message: '匿名会话已建立，正在进入工作区。', tone: 'neutral' },
  }
}

export async function startGoogleAuth(auth: LoginAuthClient, redirectTo?: string): Promise<AuthActionResult> {
  const { error } = await auth.signInWithOAuth({
    options: withGoogleAccountSelection(redirectTo),
    provider: 'google',
  })

  if (error) {
    return {
      feedback: { message: 'Google 登录暂时不可用，请稍后再试。', tone: 'error' },
    }
  }

  return {
    feedback: { message: '正在前往 Google 登录。', tone: 'neutral' },
  }
}
