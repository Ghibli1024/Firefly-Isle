## ADDED Requirements

### Requirement: MVP 仅包含三类 Web 页面结构
系统 SHALL 在 MVP 中仅围绕登录页面、临床工作区、档案详情三类 Web 页面组织界面结构。

#### Scenario: 页面结构范围
- **WHEN** 实现 MVP 前端页面结构
- **THEN** 系统 SHALL 仅以登录页面、临床工作区、档案详情作为基础页面结构，不要求实现 Mobile 页面结构

### Requirement: Stitch 仅作为设计输入
系统 SHALL 将 Stitch 原型作为设计输入来源，而不是运行时依赖。

#### Scenario: 运行时不连接 Stitch
- **WHEN** 应用在浏览器中运行
- **THEN** 前端 SHALL 不依赖 Stitch MCP 或 Stitch 运行时 API 提供页面结构或数据

#### Scenario: 设计读取真相源
- **WHEN** 需要读取当前设计原型的页面名称或底层页面资源
- **THEN** 系统 SHALL 以 `screenInstances.label` 作为页面名称真相源，并通过 `sourceScreen -> get_screen(...)` 读取底层资源

### Requirement: 主题切换入口位于应用壳层
系统 SHALL 将主题切换能力放置在应用壳层中，而不是绑定到单个业务页面的局部实现中。

#### Scenario: 主题切换作用于全局页面结构
- **WHEN** 用户切换主题
- **THEN** 主题变化 SHALL 作用于登录页面、临床工作区和档案详情等全局页面结构，而不是仅作用于局部组件
