## ADDED Requirements

### Requirement: 壳层区分真实数据入口与 Demo 入口
系统 SHALL 在应用壳层中明确区分真实用户数据入口和 Demo 入口，避免无记录状态把演示数据伪装成用户自己的病历。

#### Scenario: 无真实病历时侧栏进入 Demo
- **WHEN** 已认证或匿名用户在 `/app` 中尚无用户自有病历
- **THEN** 侧栏病历入口 SHALL 指向 Demo 病历页
- **AND** 侧栏统计入口 SHALL 指向 Demo 统计页
- **AND** 工作区主内容 SHALL 继续保持空白输入/预览状态

#### Scenario: 有真实病历时侧栏进入真实记录
- **WHEN** 已认证或匿名用户在 `/app` 中已有用户自有病历
- **THEN** 侧栏病历入口 SHALL 指向 `/record/:id`
- **AND** 侧栏统计入口 SHALL 指向 `/analytics/:id`

#### Scenario: Demo 模式侧栏不跳回受保护 fallback
- **WHEN** 用户位于公开 Demo 模式
- **THEN** 壳层病历和统计入口 SHALL 保持在 `/demo/*` 路由内
- **AND** 壳层 SHALL NOT 使用 `/record/demo` 或 `/analytics/demo` 作为公开 Demo 的模式内导航目标
