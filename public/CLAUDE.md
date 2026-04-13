# public/
> L2 | 父级: /CLAUDE.md

成员清单
CLAUDE.md: 说明静态资源目录边界与部署期约束，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
favicon.svg: 应用 favicon 静态资源，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
icons.svg: 应用图标 sprite 静态资源，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
_headers: Cloudflare Pages 响应头配置，收敛静态缓存与基础安全头，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
_redirects: Cloudflare Pages SPA 回退规则，确保前端路由刷新可落回 index.html，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: public 只放可直接发布的静态产物与 Pages 平台配置，不混入源码逻辑。
