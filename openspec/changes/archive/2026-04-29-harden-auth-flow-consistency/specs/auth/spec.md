## MODIFIED Requirements

### Requirement: 邮箱登录
系统 SHALL 支持用户通过邮箱和密码注册、登录，使用 Supabase Auth 邮箱认证流程，并保证认证弹层的可见文案与当前认证模式一致。

#### Scenario: 登录模式显示一致
- **WHEN** 用户打开认证弹层并处于登录模式
- **THEN** 弹层标题、dialog label、主按钮、辅助文案 SHALL 表达登录语义
- **AND** 系统 SHALL NOT 在登录模式中显示注册主动作标题

#### Scenario: 注册模式显示一致
- **WHEN** 用户在认证弹层中切换到注册模式
- **THEN** 弹层标题、dialog label、主按钮、辅助文案 SHALL 全部表达注册语义
- **AND** 系统 SHALL NOT 同时显示注册动作和登录标题的混合状态

#### Scenario: 邮箱注册需要确认
- **WHEN** 用户提交注册表单且 Supabase 未返回有效 session
- **THEN** 系统 SHALL 提示用户查收验证邮件
- **AND** 系统 SHALL 保持在未认证入口状态

#### Scenario: 邮箱注册立即认证
- **WHEN** 用户提交注册表单且 Supabase 返回有效 session
- **THEN** 系统 SHALL 进入已认证状态
- **AND** 路由 SHALL 通过统一 session 恢复路径进入 `/app`

#### Scenario: 邮箱登录失败
- **WHEN** 用户输入错误的邮箱或密码
- **THEN** 系统 SHALL 展示可读错误信息
- **AND** 系统 SHALL NOT 暴露账户存在性、密码校验细节或后端原始错误

### Requirement: 匿名模式
系统 SHALL 支持用户在不注册的情况下以匿名身份使用，并通过 Supabase `signInAnonymously()` 创建匿名 session，将数据关联到匿名用户 uid。

#### Scenario: 匿名入口说明真实身份边界
- **WHEN** 用户查看匿名会话入口
- **THEN** 系统 SHALL 说明匿名会话会创建 Supabase 匿名身份
- **AND** 系统 SHALL 说明用户创建的数据会绑定到该匿名 uid

#### Scenario: 匿名模式进入
- **WHEN** 用户触发匿名会话入口
- **THEN** 系统 SHALL 调用 Supabase `signInAnonymously()`
- **AND** 成功后用户 SHALL 通过统一 session 路径进入主界面

### Requirement: Session 持久化
系统 SHALL 在用户关闭并重新打开浏览器后保持登录状态，直到用户主动退出。

#### Scenario: 不展示未实现的记住我控制
- **WHEN** 系统没有实现可切换的 session 持久化策略
- **THEN** 登录表单 SHALL NOT 展示可交互的 `记住我` 控件

#### Scenario: Session 自动恢复
- **WHEN** 已登录用户关闭浏览器后重新打开应用
- **THEN** 系统 SHALL 自动恢复 Supabase session
- **AND** 已认证用户访问 `/login` SHALL 被导向 `/app`

## ADDED Requirements

### Requirement: 密码重置入口
系统 SHALL 为邮箱密码用户提供真实密码重置入口，并使用 Supabase Auth 的 password reset 能力。

#### Scenario: 密码重置模式显示一致
- **WHEN** 用户从登录模式进入密码重置模式
- **THEN** 弹层标题、dialog label、主按钮、辅助文案 SHALL 表达密码重置语义
- **AND** 系统 SHALL 只要求用户输入邮箱

#### Scenario: 请求密码重置
- **WHEN** 用户提交密码重置请求
- **THEN** 系统 SHALL 调用 Supabase `resetPasswordForEmail()`
- **AND** 系统 SHALL 提供中性反馈，说明如果该邮箱已注册则会发送重置邮件
- **AND** 系统 SHALL NOT 暴露该邮箱是否存在

#### Scenario: 密码重置配置错误
- **WHEN** Supabase 拒绝密码重置请求或 redirect URL 配置无效
- **THEN** 系统 SHALL 显示可读失败反馈
- **AND** 系统 SHALL NOT 显示后端原始错误或敏感配置值

### Requirement: Google OAuth 登录
系统 SHALL 在 Google provider 配置完成后提供真实 Google OAuth 登录入口。

#### Scenario: Google provider 可见
- **WHEN** Google OAuth 在本环境中被配置为可用
- **THEN** 认证弹层 MAY 展示 Google 登录入口
- **AND** 该入口 SHALL 表达真实可用的 OAuth 登录，而不是禁用占位

#### Scenario: Google 登录启动
- **WHEN** 用户触发 Google 登录入口
- **THEN** 系统 SHALL 调用 Supabase `signInWithOAuth()` 并使用 `google` provider
- **AND** 系统 SHALL 使用公共 `/auth/callback` 作为 OAuth 回调落点，避免受保护路由在 session 恢复前丢弃回调参数
- **AND** 系统 SHALL 请求 Google 显示账号选择器，避免浏览器复用上一次 Google 会话而跳过家庭成员身份选择
- **AND** OAuth 回调成功后 SHALL 进入统一 session 恢复路径

#### Scenario: Google 首次登录即注册
- **WHEN** 用户从登录模式或注册模式触发 Google OAuth
- **THEN** 系统 SHALL 将 Google OAuth 作为统一登录/注册入口处理
- **AND** 已存在的 Supabase Google 身份 SHALL 恢复同一个用户 uid 并读取该 uid 绑定的数据
- **AND** 尚不存在的 Google 身份 SHALL 在第一次成功 OAuth 回调后创建新的 Supabase 用户

#### Scenario: Google provider 未配置
- **WHEN** Google OAuth 在本环境中尚未配置
- **THEN** 系统 SHALL NOT 将 Google 展示为可用主认证动作

### Requirement: 未启用社交登录不得伪装成入口
系统 SHALL 只展示真实可用的认证入口，不得把未接通 provider 放在主路径里制造可用错觉。

#### Scenario: 微信 provider 未接入
- **WHEN** 微信登录未完成 provider、回调域名与产品配置
- **THEN** 系统 SHALL NOT 在认证弹层主路径展示微信登录按钮

#### Scenario: 第三方入口禁用态
- **WHEN** 任意第三方 provider 只作为未来计划存在
- **THEN** 系统 SHALL 隐藏该入口或明确标记为不可用
- **AND** 系统 SHALL NOT 让它看起来像当前可点击的主登录方式
