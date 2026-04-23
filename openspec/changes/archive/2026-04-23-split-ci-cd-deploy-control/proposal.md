## Why

当前仓库把 GitHub Actions 与 Cloudflare Pages Git integration 两套自动部署链路并行使用，结果是：

- GitHub Actions 的 `build-and-deploy` 会在检查全部通过后尝试发版，但由于 GitHub 仓库里没有 Cloudflare 相关 secret / variable，部署步骤持续失败；
- Cloudflare Pages 项目又同时直接监听 GitHub 分支，导致站点仍会自动更新；
- 最终形成“代码检查通过、Cloudflare 部署成功、GitHub Actions 仍然红叉”的双真相状态。

现在需要把部署链路重新收束到最初 spec 的语义：GitHub Actions 负责 CI 和显式 CD，Cloudflare Pages 只作为托管目标，不再自己监听 GitHub 分支自动部署。

## What Changes

- 将当前单文件 `ci-cd.yml` 拆成 `ci.yml` 与 `deploy.yml`。
- `ci.yml` 只负责检查：`lint`、`type-check`、`test`、`build`。
- `deploy.yml` 只在 `v*` tag 或手动触发时运行，并将 `dist/` 发布到 Cloudflare Pages。
- Cloudflare Pages 项目保留项目、域名、构建配置与环境变量，但关闭生产/预览分支自动部署。
- 文档与 spec 同步改为“GitHub 是唯一发布入口，Cloudflare 是最终托管目标”。

## Capabilities

### Modified Capabilities
- `deployment`: 从“GitHub Actions + Cloudflare Git integration 并存”收敛为“GitHub Actions 是唯一 CI/CD 编排入口，Cloudflare 仅托管发布结果”。

## Impact

- Affected code/config: `.github/workflows/*.yml`, deployment docs/specs, Cloudflare Pages project settings.
- Affected runtime behavior: `main` 普通 push 不再触发生产部署；只有 tag 发布或手动触发才会生产部署。
