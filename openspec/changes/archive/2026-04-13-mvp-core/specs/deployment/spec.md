## ADDED Requirements

### Requirement: 部署链路可重复执行
系统 SHALL 为当前 MVP 提供可重复执行的部署链路，使用 GitHub Actions 驱动检查与发布，并将前端部署到 Cloudflare Pages。

#### Scenario: GitHub Actions 触发部署链路
- **WHEN** 当前 change 对应分支发生满足发布条件的提交或手动触发部署
- **THEN** 系统 SHALL 通过 GitHub Actions 依次执行当前 MVP 所需的 lint、type-check、test 与 deploy 步骤，不依赖纯手工发布

#### Scenario: Cloudflare Pages 发布成功
- **WHEN** 部署链路执行成功
- **THEN** 当前前端产物 SHALL 被发布到 Cloudflare Pages，并可通过部署环境访问

### Requirement: 隐私条款页面可访问
系统 SHALL 提供独立的隐私条款页面，并保证该页面与应用内隐私门控使用一致的内容来源或受同一真相源约束。

#### Scenario: 产品入口可访问隐私条款
- **WHEN** 用户在部署后的应用中寻找隐私条款
- **THEN** 系统 SHALL 提供可访问的隐私条款页面或链接，而不只是在首次启动弹窗中展示

### Requirement: 部署前发布检查
系统 SHALL 在上线前完成与当前 MVP 能力直接相关的发布检查。

#### Scenario: 上线前复核
- **WHEN** 准备发布 MVP
- **THEN** 系统 SHALL 完成导出跨浏览器验证、核心链路手动验收，以及与当前发布环境一致的安全与可用性复核
