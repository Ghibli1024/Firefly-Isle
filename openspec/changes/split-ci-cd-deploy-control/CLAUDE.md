# split-ci-cd-deploy-control/
> L2 | 父级: /CLAUDE.md

成员清单
proposal.md: 说明为什么要拆分 GitHub CI/CD、关闭 Cloudflare Git 自动部署，并把 GitHub Actions 收敛为唯一发布入口，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
design.md: 记录 CI / CD 工作流拆分、tag/手动触发约束、Cloudflare Pages 分支自动部署关闭策略与 GitHub Secret 依赖，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
tasks.md: 执行清单，跟踪 workflow 重构、文档同步、Cloudflare 配置切换与验证状态，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
specs/: deployment delta spec，定义 GitHub Actions 负责 CI 与显式 CD、Cloudflare 不再作为自动部署真源，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: CI 证明代码可被信任，CD 只在显式发布时触发，Cloudflare Pages 只是托管目标而不是第二套自动部署真源。
