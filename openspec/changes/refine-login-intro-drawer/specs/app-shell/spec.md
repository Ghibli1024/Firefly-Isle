## MODIFIED Requirements

### Requirement: MVP 仅包含三类 Web 页面结构
系统 SHALL 在 MVP 中围绕登录页面、临床工作区、档案详情与独立隐私页组织界面结构，并要求这些页面在 dark / light 主题间共享同一套视觉系统、组件角色与主题语义；登录页面 MAY 在同一路由内使用项目介绍页与身份访问抽屉的组合入口。

#### Scenario: 登录页保持单一路由
- **WHEN** 系统实现项目介绍页与身份访问抽屉
- **THEN** 系统 SHALL 继续使用既有 `/login` 路由
- **AND** 系统 SHALL NOT 为登录抽屉或项目介绍新增单独路由

#### Scenario: 登录页桌面结构包含介绍页与登录抽屉
- **WHEN** 桌面用户访问 `/login`
- **THEN** 页面 SHALL 提供项目介绍区域用于展示产品定位、能力路径与系统状态
- **AND** 页面 SHALL 提供身份访问抽屉用于承载登录、注册、匿名会话、主题切换、语言切换与隐私说明
- **AND** 身份访问抽屉 SHALL 与项目介绍区域处于同一页面结构，而不是独立跳转页面

#### Scenario: 登录抽屉可展开或收起
- **WHEN** 用户触发项目介绍区域中的身份访问入口
- **THEN** 页面 MAY 将身份访问抽屉从收起态转换为展开态
- **AND** 项目介绍区域 MAY 为展开态让出横向空间
- **AND** 该状态变化 SHALL NOT 改变认证业务语义或已输入表单值

#### Scenario: 移动端复用登录卡
- **WHEN** 移动端用户访问 `/login`
- **THEN** 页面 SHALL 优先展示与桌面身份访问抽屉同源的登录卡结构
- **AND** 登录卡 SHALL 保留邮箱登录、注册模式、匿名会话、主题切换、语言切换与隐私说明入口

### Requirement: 视觉重构不得改变业务边界
系统 SHALL 将本次变更限制在视觉系统、theme token、shared shell、页面 composition、组件 styling 与文档同步，不得改变当前业务流程与数据边界。

#### Scenario: 登录抽屉不改变 Auth 行为
- **WHEN** 用户在身份访问抽屉内登录、注册、匿名进入、切换主题或切换语言
- **THEN** 系统 SHALL 保持现有 Supabase Auth、匿名 session、主题偏好、语言偏好与错误反馈行为不变
- **AND** 抽屉展开或收起 SHALL NOT 触发认证请求
