## MODIFIED Requirements

### Requirement: 侧栏统计入口进入真实统计页面
系统 SHALL 将已登录壳层中的 `统计` 入口连接到当前用户真实指标管理页面；没有当前真实病历时，入口必须明确不可用，而不是把用户带到示例数据。

#### Scenario: 用户点击存在真实病历的统计入口
- **WHEN** 用户在已登录壳层中已有当前真实病历并点击 `统计`
- **THEN** 系统 SHALL 导航到 `/analytics/:id`
- **AND** 系统 SHALL NOT 弹出 `敬请期待` 提示作为该入口的最终行为

#### Scenario: 无真实病历时统计入口不可用
- **WHEN** 已认证或匿名用户在 `/app` 中尚无可访问的用户自有病历
- **THEN** 侧栏 `统计` 项 SHALL 为不可交互的禁用状态
- **AND** 系统 SHALL 呈现本地化的“先提取” / “Extract first”说明
- **AND** 系统 SHALL NOT 将该项链接到 `/demo/analytics`、`/analytics/demo` 或任何其他 Demo 路由

#### Scenario: 统计入口激活态
- **WHEN** 用户位于真实指标管理统计页面
- **THEN** 侧栏 `统计` 项 SHALL 呈现激活态
- **AND** 激活态 SHALL 复用现有 V3 侧栏语义，而不是引入新的导航样式

### Requirement: 壳层区分真实数据入口与 Demo 入口
系统 SHALL 在应用壳层中明确区分真实用户数据入口和 Demo 入口，避免无记录状态把演示数据伪装成用户自己的病历。

#### Scenario: 无真实病历时侧栏不进入 Demo
- **WHEN** 已认证或匿名用户在 `/app` 中尚无用户自有病历
- **THEN** 侧栏病历和统计入口 SHALL 保持在真实空工作区上下文中且不可交互
- **AND** 两个入口 SHALL 显示“先提取” / “Extract first”可访问提示
- **AND** 工作区主内容 SHALL 继续保持空白输入/预览状态
- **AND** 壳层 SHALL NOT 将这两个入口链接到公开 `/demo/*` 路由

#### Scenario: 有真实病历时侧栏进入真实记录
- **WHEN** 已认证或匿名用户在 `/app` 中已有用户自有病历
- **THEN** 侧栏病历入口 SHALL 指向 `/record/:id`
- **AND** 侧栏统计入口 SHALL 指向 `/analytics/:id`

#### Scenario: 公共 Demo 模式保持独立闭环
- **WHEN** 用户位于公开 Demo 模式
- **THEN** 壳层病历和统计入口 SHALL 保持在 `/demo/*` 路由内
- **AND** 只有这些显式 `/demo/*` 入口 SHALL 显示 Demo 标识
- **AND** 壳层 SHALL NOT 使用 `/record/demo` 或 `/analytics/demo` 作为公开 Demo 的模式内导航目标
