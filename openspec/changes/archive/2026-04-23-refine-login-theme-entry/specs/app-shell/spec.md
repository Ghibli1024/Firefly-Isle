## MODIFIED Requirements

### Requirement: 页面结构必须复刻设计稿
系统 SHALL 以 `docs/design/dark/` 与 `docs/design/light/` 中对应页面导出的 HTML / screenshot 作为页面结构实现的直接真相源，登录页面、临床工作区、档案详情三类页面在 React 中必须复刻设计稿，同时允许根据用户浏览器评论收敛入口页噪声与错误壳层语义。

#### Scenario: 登录页不显示工作区导航
- **WHEN** 未认证用户访问 `/login`
- **THEN** 登录页 SHALL 不显示工作区侧栏导航项，例如“提取”“病历”“统计”
- **AND** 登录页 SHALL 不因隐藏侧栏而保留侧栏宽度偏移

#### Scenario: 登录页主题切换是页面级控制
- **WHEN** 系统渲染 `/login` 的 Dark 或 Light 页面
- **THEN** 主题切换控件 SHALL 作为页面级 utility 呈现
- **AND** 它 SHALL 不作为认证卡片标题行的一部分呈现

#### Scenario: 临床工作区与档案详情保留应用壳层导航
- **WHEN** 已认证用户访问 `/app` 或 `/record/:id`
- **THEN** 页面 SHALL 保留工作区导航与会话出口能力
