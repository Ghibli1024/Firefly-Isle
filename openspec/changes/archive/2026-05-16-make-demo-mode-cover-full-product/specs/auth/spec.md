## ADDED Requirements

### Requirement: 公开 Demo 不需要认证
系统 SHALL 允许用户在未登录状态访问公开 Demo 路由，同时保持真实工作区、真实病历和真实统计路由的认证保护。

#### Scenario: 登录页提供 Demo 入口
- **WHEN** 未登录用户访问 `/login`
- **THEN** 页面 SHALL 提供可见的 Demo 入口
- **AND** Demo 入口 SHALL 直接导航到 `/demo/record`
- **AND** Demo 入口 SHALL NOT 打开登录弹层或创建 Supabase session

#### Scenario: 未登录访问 Demo
- **WHEN** 未登录用户访问 `/demo`、`/demo/record` 或 `/demo/analytics`
- **THEN** 系统 SHALL 渲染 Demo 模式
- **AND** 系统 SHALL NOT 跳转到 `/login`

#### Scenario: 未登录访问真实工作区
- **WHEN** 未登录用户访问 `/app`
- **THEN** 系统 SHALL 跳转到 `/login`

#### Scenario: 未登录访问真实病历
- **WHEN** 未登录用户访问非 Demo 的 `/record/:id`
- **THEN** 系统 SHALL 跳转到 `/login`

#### Scenario: 未登录访问真实统计
- **WHEN** 未登录用户访问非 Demo 的 `/analytics/:id`
- **THEN** 系统 SHALL 跳转到 `/login`

#### Scenario: 分享授权码路由保持公开
- **WHEN** 未登录用户访问 `/share/:code`
- **THEN** 系统 SHALL 继续通过授权码边界加载只读分享页
- **AND** 此行为 SHALL 独立于公开 Demo 路由
