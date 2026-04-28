## MODIFIED Requirements

### Requirement: MVP 仅包含三类 Web 页面结构
系统 SHALL 在 MVP 中围绕登录页面、临床工作区、档案详情与独立隐私页组织界面结构，并要求这些页面在 dark / light 主题间共享同一套视觉系统、组件角色与主题语义；登录页面 SHALL 在同一路由内使用项目介绍页与 CTA 驱动统一登录弹层的组合入口。

#### Scenario: 登录页保持单一路由
- **WHEN** 系统实现项目介绍页与统一登录弹层
- **THEN** 系统 SHALL 继续使用既有 `/login` 路由
- **AND** 系统 SHALL NOT 为登录弹层或项目介绍新增单独路由

#### Scenario: 登录页结构包含介绍页与按需登录弹层
- **WHEN** 用户访问 `/login`
- **THEN** 页面 SHALL 提供全屏双主题海岸介绍区域用于展示产品定位、能力路径与安全状态
- **AND** 页面 SHALL 在用户触发 `登录` 后提供统一登录弹层用于承载登录、注册、匿名会话与隐私说明
- **AND** 页面 SHALL 在项目介绍区域提供主题切换与语言切换工具
- **AND** 登录弹层 SHALL 与项目介绍区域处于同一页面结构，而不是独立跳转页面

#### Scenario: 登录弹层由 CTA 展开或收起
- **WHEN** 用户首次访问 `/login`
- **THEN** 页面 SHALL 默认只展示项目介绍区域与 `登录` CTA
- **AND** 页面 SHALL NOT 默认展示登录表单或右侧窄身份访问抽屉
- **WHEN** 用户触发项目介绍区域中的 `登录` CTA
- **THEN** 页面 SHALL 挂载并展示统一登录弹层
- **AND** 桌面端 SHALL 使用与窄屏一致的居中弹层，而不是右侧抽屉或横向让位布局
- **AND** 该状态变化 SHALL NOT 改变认证业务语义或已输入表单值

#### Scenario: 窄屏按需弹出登录卡
- **WHEN** 窄屏用户访问 `/login`
- **THEN** 页面 SHALL 优先展示项目介绍区域
- **AND** 与桌面统一弹层同源的登录卡 SHALL 默认隐藏
- **WHEN** 用户触发项目介绍区域中的 `登录` CTA
- **THEN** 页面 SHALL 以弹层呈现同源登录卡
- **AND** 登录卡 SHALL 保留邮箱登录、注册模式、匿名会话与隐私说明入口
- **AND** 用户 SHALL 能关闭弹层回到项目介绍区域

### Requirement: 视觉重构不得改变业务边界
系统 SHALL 将本次变更限制在视觉系统、theme token、shared shell、页面 composition、组件 styling 与文档同步，不得改变当前业务流程与数据边界。

#### Scenario: 登录入口不改变 Auth 行为
- **WHEN** 用户在登录入口内登录、注册、匿名进入、切换主题或切换语言
- **THEN** 系统 SHALL 保持现有 Supabase Auth、匿名 session、主题偏好、语言偏好与错误反馈行为不变
- **AND** 弹层展开或收起 SHALL NOT 触发认证请求
