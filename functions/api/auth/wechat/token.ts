/**
 * [INPUT]: 依赖 ./shared 的 issueWechatAdapterToken 消费一次性 adapter code。
 * [OUTPUT]: 对外提供 onRequestPost，对应 /api/auth/wechat/token。
 * [POS]: functions/api/auth/wechat 的 token endpoint，被 Supabase Auth 服务端调用以换取短时 adapter access token。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { issueWechatAdapterToken, methodNotAllowed, type WechatOAuthContext } from './shared'

export async function onRequestPost(context: WechatOAuthContext) {
  return issueWechatAdapterToken(context.request, context.env)
}

export async function onRequestGet() {
  return methodNotAllowed('POST')
}
