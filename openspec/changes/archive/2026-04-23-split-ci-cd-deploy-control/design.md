## Context

当前实际部署存在两条线：

1. GitHub Actions：`lint -> type-check -> test -> build -> wrangler pages deploy`
2. Cloudflare Pages Git integration：`main` 自动生产部署，非生产分支自动预览部署

由于 GitHub 仓库目前没有 `CLOUDFLARE_API_TOKEN` 等配置，路线 1 的 deploy 持续失败；但路线 2 仍在生效，所以 production 实际在更新。这使得 GitHub Checks 的红叉不再能准确表达“当前发布状态”。

## Decisions

### 1. CI 与 CD 拆成两个 workflow

- **Decision**: 删除 `ci-cd.yml`，改为 `ci.yml` 与 `deploy.yml`。
- **Rationale**: 检查与发布是两件不同的事；把它们拆开后，日常提交只承受 CI 成本，生产发布只在显式时刻发生。

### 2. CI 保持分支开发友好，CD 只认显式发布

- **Decision**:
  - `ci.yml` 触发：`push main`、`pull_request opened/synchronize/reopened -> main`
  - `deploy.yml` 触发：`push tags: v*`、`workflow_dispatch`
- **Rationale**: PR 需要及时收到检查反馈；生产部署不应跟普通 `main` push 绑定。

### 3. 生产发布必须来自 main

- **Decision**: `deploy.yml` 在 tag 和手动触发两条路径上都校验“待部署 commit 必须可从 `origin/main` 到达”。
- **Rationale**: 防止错误地把 feature 分支 tag 或临时 SHA 发到生产。

### 4. Cloudflare Pages 继续托管，但不再自己监听 GitHub 分支

- **Decision**: 保留当前 Pages 项目、域名、构建命令、输出目录、环境变量，但关闭：
  - `production_deployments_enabled`
  - `preview_deployment_setting = none`
- **Rationale**: Pages 继续负责托管与域名，不再保留第二套自动部署真源。

### 5. GitHub Actions 构建期环境从 `wrangler.jsonc` 读取

- **Decision**: CI / CD 两个 workflow 都从 repo 中已提交的 `wrangler.jsonc` 读取公开的 `VITE_SUPABASE_*` 值注入构建环境。
- **Rationale**: 这些值已经被视为公开构建期配置真源，不必再复制一份到 GitHub secrets/variables；PR CI 也能无阻塞运行。

## Risks

- 在 Cloudflare 自动部署关闭、GitHub secret 尚未写入前，生产将失去自动发布能力。
- `CLOUDFLARE_API_TOKEN` 仍必须由用户提供并写入 GitHub repo secret，否则新的 `deploy.yml` 无法真正对 Cloudflare 发布。
- `add-language-toggle` 等当前在途改动不应被本次 workflow / deployment 变更顺手提交。

## Verification

- YAML 语法正确，workflow 可被 GitHub 解析。
- `npm run lint`、`npm run type-check`、`npm run test`、`npm run build` 全部通过。
- Cloudflare Pages 项目 API 返回：
  - `production_branch = main`
  - `production_deployments_enabled = false`
  - `preview_deployment_setting = none`
- GitHub repo 配置中最终存在 `CLOUDFLARE_API_TOKEN` secret 后，`deploy.yml` 可通过 tag 或手动触发成功发版。
