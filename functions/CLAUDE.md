# functions/
> L2 | 父级: /CLAUDE.md

成员清单
api/auth/wechat/: Cloudflare Pages Functions 微信 OAuth2 适配层，把 Supabase custom provider 请求翻译到微信开放平台扫码登录，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 边缘函数只承载服务器侧密钥与协议适配；不得创建第二套登录态，不得替代 Supabase Auth。
