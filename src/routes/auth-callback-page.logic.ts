/**
 * [INPUT]: 依赖 Supabase Auth 的 exchangeCodeForSession 与 getSession 方法，依赖浏览器回调 URL。
 * [OUTPUT]: 对外提供 restoreAuthCallbackSession、getOAuthCallbackErrorMessage 与 AuthCallbackClient 类型。
 * [POS]: routes 的 OAuth 回调动作层，把 URL code 或错误参数归一为 Supabase session/友好反馈，供 /auth/callback 与路由入口消费。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export type AuthCallbackClient = {
  exchangeCodeForSession: (code: string) => Promise<{ error: unknown | null }>
  getSession: () => Promise<{ data: { session: unknown | null }; error: unknown | null }>
}

export type AuthCallbackResult =
  | { status: 'authenticated' }
  | { status: 'anonymous' }
  | { message: string; status: 'error' }

function getCallbackHref() {
  return typeof window === 'undefined' ? undefined : window.location.href
}

function readCallbackCode(href = getCallbackHref()) {
  if (!href) {
    return null
  }

  try {
    return new URL(href).searchParams.get('code')
  } catch {
    return null
  }
}

export function getOAuthCallbackErrorMessage(href = getCallbackHref()) {
  if (!href) {
    return null
  }

  try {
    const params = new URL(href, 'https://firefly.local').searchParams
    const errorCode = params.get('error_code')
    const errorDescription = params.get('error_description') ?? ''

    if (errorCode === 'bad_oauth_state' || errorDescription.includes('OAuth state has expired')) {
      return 'Google 登录请求已过期，请重新使用 Google 继续。'
    }

    return params.has('error') ? 'Google 登录没有完成，请重新使用 Google 继续。' : null
  } catch {
    return null
  }
}

export async function restoreAuthCallbackSession(auth: AuthCallbackClient, href?: string): Promise<AuthCallbackResult> {
  const callbackErrorMessage = getOAuthCallbackErrorMessage(href)

  if (callbackErrorMessage) {
    return { message: callbackErrorMessage, status: 'error' }
  }

  const code = readCallbackCode(href)

  if (code) {
    const { error } = await auth.exchangeCodeForSession(code)

    if (error) {
      return { message: '登录回调已失效，请重新使用 Google 继续。', status: 'error' }
    }
  }

  const { data, error } = await auth.getSession()

  if (error) {
    return { message: '无法恢复登录状态，请刷新后重试。', status: 'error' }
  }

  return data.session ? { status: 'authenticated' } : { status: 'anonymous' }
}
