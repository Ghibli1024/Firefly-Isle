## MODIFIED Requirements

### Requirement: GitHub Actions 负责持续集成
系统 SHALL 使用 GitHub Actions 在主线 push 和主线 PR 上执行前端检查链路，不依赖 Cloudflare Pages 的 Git 自动构建来判断代码健康度。

#### Scenario: main push 触发 CI
- **WHEN** 有新提交 push 到 `main`
- **THEN** GitHub Actions SHALL 依次执行 `lint`、`type-check`、`test` 与 `build`
- **AND** CI SHALL NOT 触发 Cloudflare Pages 发布

#### Scenario: main PR 触发 CI
- **WHEN** 有目标分支为 `main` 的 pull request 被 `opened`、`synchronize` 或 `reopened`
- **THEN** GitHub Actions SHALL 依次执行 `lint`、`type-check`、`test` 与 `build`
- **AND** CI SHALL NOT 触发生产部署

### Requirement: GitHub Actions 负责显式发布
系统 SHALL 仅在显式发布时通过 GitHub Actions 将当前前端产物发布到 Cloudflare Pages。

#### Scenario: 版本 tag 触发生产部署
- **WHEN** 有匹配 `v*` 的 Git tag 被 push
- **THEN** GitHub Actions SHALL 构建当前前端产物并发布到 Cloudflare Pages 生产环境

#### Scenario: 手动触发部署
- **WHEN** 维护者手动触发部署工作流
- **THEN** GitHub Actions SHALL 构建指定 ref 并发布到 Cloudflare Pages 生产环境

#### Scenario: 生产部署来源必须属于 main
- **WHEN** GitHub Actions 准备执行版本 tag 或手动部署
- **THEN** 工作流 SHALL 校验待部署 commit 可从 `origin/main` 到达
- **AND** 不满足时 SHALL 终止部署

### Requirement: Cloudflare Pages 不再自动监听 Git 分支发布
系统 SHALL 保留当前 Cloudflare Pages 项目、域名、构建配置与环境变量，但关闭基于 Git 分支的自动生产与自动预览部署。

#### Scenario: main 普通提交不再自动生产部署
- **WHEN** 有普通提交进入 `main`
- **THEN** Cloudflare Pages SHALL NOT 因 Git integration 自动生成新的生产部署

#### Scenario: 非生产分支不再自动预览部署
- **WHEN** 有提交进入非 `main` 分支
- **THEN** Cloudflare Pages SHALL NOT 因 Git integration 自动生成新的预览部署
