## MODIFIED Requirements

### Requirement: 公开 Demo 不需要认证
系统 SHALL 允许用户在未登录状态访问公开 Demo 路由，同时保持真实工作区、真实病历和真实统计路由的认证保护。

#### Scenario: 登录页不再提供 Demo 入口
- **WHEN** 未登录用户访问 `/login`
- **THEN** 页面 SHALL NOT 提供 Demo 入口 CTA
- **AND** 页面 SHALL 通过滚动叙事章节说明产品能力

#### Scenario: 公开 Demo 路由保持可直接访问
- **WHEN** 未登录用户直接访问 `/demo`、`/demo/record` 或 `/demo/analytics`
- **THEN** 系统 SHALL 正常进入公开 Demo 模式
- **AND** 系统 SHALL NOT 要求创建、恢复或伪造 Supabase session
- **AND** Demo 页面既有提醒、只读语义与数据边界 SHALL 保持不变
