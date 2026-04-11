## ADDED Requirements

### Requirement: MVP 仅包含三类 Web 页面结构
系统 SHALL 在 MVP 中仅围绕登录页面、临床工作区、档案详情三类 Web 页面组织界面结构。

#### Scenario: 页面结构范围
- **WHEN** 实现 MVP 前端页面结构
- **THEN** 系统 SHALL 仅以登录页面、临床工作区、档案详情作为基础页面结构，不要求实现 Mobile 页面结构

### Requirement: 页面结构必须复刻设计稿
系统 SHALL 以 `docs/design/dark/` 与 `docs/design/light/` 中对应页面导出的 HTML / screenshot 作为页面结构实现的直接真相源，登录页面、临床工作区、档案详情三类页面在 React 中必须复刻设计稿，而不是仅提供松散相似的工程骨架。

#### Scenario: 登录页复刻 Dark / Light 页面结构
- **WHEN** 系统实现 `/login` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 对齐 `docs/design/dark/_1/code.html` 或 `docs/design/light/_1/code.html` 的分栏结构、标题层级、表单区位置、导航与主题切换位置

#### Scenario: 临床工作区复刻 Dark / Light 页面结构
- **WHEN** 系统实现 `/app` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 对齐 `docs/design/dark/_2/code.html` 或 `docs/design/light/_2/code.html` 的主画布、导航脊柱、信息栏与关键装饰规则

#### Scenario: 档案详情复刻 Dark / Light 页面结构
- **WHEN** 系统实现 `/record/:id` 的 Dark 或 Light 页面
- **THEN** 页面 SHALL 对齐 `docs/design/dark/_3/code.html` 或 `docs/design/light/_3/code.html` 的病历概览区、主表格区、侧栏结构与标题编排

系统 SHALL 将主题切换能力放置在应用壳层中，而不是绑定到单个业务页面的局部实现中。

#### Scenario: 主题切换作用于全局页面结构
- **WHEN** 用户切换主题
- **THEN** 主题变化 SHALL 作用于登录页面、临床工作区和档案详情等全局页面结构，而不是仅作用于局部组件
