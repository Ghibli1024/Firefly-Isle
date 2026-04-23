# .github/workflows/
> L2 | 父级: /Users/Totoro/Desktop/Firefly-Isle/.github/CLAUDE.md

成员清单
ci.yml: 当前主线 CI 工作流，覆盖 main push、main PR opened/synchronize/reopened、lint、type-check、test 与 build，不负责部署，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
deploy.yml: 当前主线 CD 工作流，仅在 `v*` tag 或手动触发时构建并发布到 Cloudflare Pages，并校验待部署 commit 来自 main，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 工作流名和步骤名直白可查，失败点必须能一眼定位。
