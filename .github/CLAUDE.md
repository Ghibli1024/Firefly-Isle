# .github/
> L2 | 父级: /CLAUDE.md

成员清单
CLAUDE.md: 说明 GitHub 自动化目录边界与工作流职责，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
workflows/ci-cd.yml: GitHub Actions CI/CD 工作流，串联 lint、type-check、test、build 与 Cloudflare Pages 发布，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: workflow 先验证再发布，Secrets/Vars 只声明接口不写死敏感值。
