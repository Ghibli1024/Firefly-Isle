## MODIFIED Requirements

### Requirement: MVP 仅包含三类 Web 页面结构
系统 SHALL 围绕登录页面、临床工作区、档案详情、指标管理统计页面、指标管理演示页面与独立隐私页组织界面结构，并要求这些页面在 dark / light 主题间共享同一套视觉系统、组件角色与主题语义；登录页面 SHALL 在同一路由内使用纵向滚动叙事结构与 CTA 驱动统一登录弹层的组合入口。

#### Scenario: 登录页保持单一路由
- **WHEN** 系统实现纵向滚动叙事结构与统一登录弹层
- **THEN** 系统 SHALL 继续使用既有 `/login` 路由
- **AND** 系统 SHALL NOT 为登录弹层或任一叙事章节新增单独路由

#### Scenario: 登录页结构包含滚动叙事与按需登录弹层
- **WHEN** 用户访问 `/login`
- **THEN** 页面 SHALL 提供全屏双主题海岸首屏用于展示产品定位与安全状态
- **AND** 页面 SHALL 在首屏之后提供按滚动顺序推进的产品叙事章节
- **AND** 页面 SHALL 在用户触发 `登录` 后提供统一登录弹层用于承载登录、注册、匿名会话与隐私说明
- **AND** 页面 SHALL 在首屏区域提供主题切换与语言切换工具
- **AND** 登录弹层 SHALL 与滚动叙事结构处于同一页面结构，而不是独立跳转页面

#### Scenario: 登录弹层由 CTA 展开或收起
- **WHEN** 用户首次访问 `/login`
- **THEN** 页面 SHALL 默认只展示首屏叙事区域与 `登录` CTA
- **AND** 页面 SHALL NOT 默认展示登录表单或右侧窄身份访问抽屉
- **WHEN** 用户触发任一叙事章节中的 `登录` CTA
- **THEN** 页面 SHALL 挂载并展示统一登录弹层
- **AND** 桌面端 SHALL 使用与窄屏一致的居中弹层，而不是右侧抽屉或横向让位布局
- **AND** 该状态变化 SHALL NOT 改变认证业务语义或已输入表单值

#### Scenario: 登录页不再提供 Demo CTA
- **WHEN** 用户访问 `/login`
- **THEN** 页面 SHALL NOT 提供跳转到 Demo 路由的 CTA
- **AND** 产品解释责任 SHALL 由滚动叙事章节承担

## ADDED Requirements

### Requirement: 登录页滚动叙事不侵入已登录壳层
系统 SHALL 把滚动叙事限定在未登录登录页，SHALL NOT 改变已登录应用壳层的导航与滚动行为。

#### Scenario: 已登录壳层保持既有滚动行为
- **WHEN** 用户进入 `/app`、`/record/:id` 或 `/analytics/:id`
- **THEN** 页面 SHALL 保持既有壳层、侧栏与滚动行为
- **AND** 系统 SHALL NOT 在这些路由注册登录页叙事滚动动画
