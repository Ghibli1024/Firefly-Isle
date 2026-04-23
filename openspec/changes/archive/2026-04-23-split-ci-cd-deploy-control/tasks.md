## 1. Spec and docs

- [x] 1.1 创建 change proposal，记录 CI/CD 拆分与 Cloudflare Git 自动部署关闭方案
- [x] 1.2 更新 deployment spec、README 与相关 CLAUDE 文档，使“GitHub 是唯一发布入口”成为当前真相

## 2. Workflow split

- [x] 2.1 删除或停用旧 `.github/workflows/ci-cd.yml`
- [x] 2.2 新增 `.github/workflows/ci.yml`，负责 `lint`、`type-check`、`test`、`build`
- [x] 2.3 新增 `.github/workflows/deploy.yml`，负责 tag / 手动触发部署到 Cloudflare Pages
- [x] 2.4 为 deploy 增加“待部署 commit 必须来自 main”的保护逻辑

## 3. Cloudflare / GitHub cutover

- [x] 3.1 关闭 Cloudflare Pages 的生产分支自动部署
- [x] 3.2 关闭 Cloudflare Pages 的预览分支自动部署
- [x] 3.3 确认 GitHub repo 的 `CLOUDFLARE_API_TOKEN` secret 已准备好或记录为外部阻塞

## 4. Verification

- [x] 4.1 校验 workflow YAML 语法
- [x] 4.2 运行 `npm run lint`
- [x] 4.3 运行 `npm run type-check`
- [x] 4.4 运行 `npm run test`
- [x] 4.5 运行 `npm run build`
- [x] 4.6 通过 Cloudflare API 确认自动部署已关闭
