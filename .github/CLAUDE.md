# .github/
> L2 | 父级: /CLAUDE.md

成员清单
CLAUDE.md: 说明 GitHub 自动化目录边界与工作流职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
workflows/ci.yml: GitHub Actions CI 工作流，负责 main push 与 main PR 的 lint、type-check、test、build，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
workflows/deploy.yml: GitHub Actions CD 工作流，负责 tag/手动触发的 Cloudflare Pages 发布，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: workflow 先验证再发布，Secrets/Vars 只声明接口不写死敏感值。
