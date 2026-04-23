## MODIFIED Requirements

### Requirement: 页面结构必须复刻设计稿
系统 SHALL 以 `docs/design/dark/` 与 `docs/design/light/` 中对应页面导出的 HTML / screenshot 作为页面结构实现的设计证据源，并允许根据用户浏览器评论去掉工作区报告区的冗余标题壳。

#### Scenario: 工作区报告区直接进入时间线表格
- **WHEN** 系统在 `/app` 渲染报告预览区
- **THEN** 页面 SHALL 直接展示治疗时间线表格主表面
- **AND** 页面 SHALL NOT 在 `TimelineTable` 外额外渲染“临床结构化报告”总标题壳
