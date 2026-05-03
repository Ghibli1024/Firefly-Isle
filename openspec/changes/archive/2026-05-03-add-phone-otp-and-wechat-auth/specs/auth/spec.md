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

#### Scenario: 邮箱注册直接认证
- **WHEN** 用户提交注册表单且 Supabase 返回有效 session
- **THEN** 系统 SHALL 进入已认证状态
- **AND** 路由 SHALL 通过统一 session 恢复路径进入 `/app`
- **AND** 系统 SHALL NOT 提示用户查收验证邮件

#### Scenario: 邮箱确认配置未关闭
- **WHEN** 用户提交注册表单且 Supabase 未返回有效 session
- **THEN** 系统 SHALL 显示 Supabase 邮箱确认配置错误提示
- **AND** 系统 SHALL 保持在未认证入口状态
- **AND** 系统 SHALL NOT 提示用户查收验证邮件
- **AND** 系统 SHALL NOT 自动切回登录模式

#### Scenario: 邮箱登录成功
- **WHEN** 用户输入正确的邮箱和密码
- **THEN** 系统 SHALL 获取有效 session，用户进入已认证状态，跳转到主界面

#### Scenario: 邮箱登录失败
- **WHEN** 用户输入错误的邮箱或密码
- **THEN** 系统 SHALL 展示可读错误信息
- **AND** 系统 SHALL NOT 暴露账户存在性、密码校验细节或后端原始错误

#### Scenario: 邮箱与手机占位模式分离
- **WHEN** 用户打开认证弹层
- **THEN** 系统 SHALL 提供清晰的邮箱认证模式与手机认证模式切换
- **AND** 邮箱模式 SHALL 保留邮箱、密码、登录、注册和密码重置语义
- **AND** 手机模式 SHALL 显示 `敬请期待`
- **AND** 手机模式 SHALL NOT 显示邮箱密码字段、验证码字段、发送验证码动作或邮箱密码主动作

### Requirement: 未启用社交登录不得伪装成入口
系统 SHALL 只展示真实可用的认证入口，并只通过 Supabase Auth provider 建立 OAuth session；不得把未接通 provider 放在主路径里制造可用错觉，也不得伪造登录成功或自建微信 session。

#### Scenario: 微信 provider 未接通
- **WHEN** 微信登录未完成微信平台配置、Supabase provider 配置、回调域名或 session 恢复验证
- **THEN** 系统 MAY 展示微信占位以表达当前主攻方向
- **AND** 该占位 SHALL 显示 `敬请期待`
- **AND** 该占位 SHALL NOT 作为可点击 OAuth 主动作
- **AND** 系统 SHALL NOT 创建本地用户、伪造 session、保存微信 token 或把用户手动送入 `/app`

#### Scenario: 第三方入口禁用态
- **WHEN** 任意第三方 provider 只作为未来计划存在
- **THEN** 系统 SHALL 隐藏该入口或明确标记为不可用
- **AND** 系统 SHALL NOT 让它看起来像当前可点击的主登录方式

## ADDED Requirements

### Requirement: 手机登录占位
系统 SHALL 在短信服务、防刷策略和成本策略完成前，将手机登录作为占位能力展示，不得发起真实短信认证。

#### Scenario: 手机模式占位显示
- **WHEN** 用户切换到手机认证模式
- **THEN** 系统 SHALL 显示 `敬请期待`
- **AND** 系统 SHALL 告知用户当前可使用 Google 或邮箱
- **AND** 系统 SHALL NOT 要求用户输入密码
- **AND** 系统 SHALL NOT 显示手机号输入、验证码输入、发送验证码动作或进入工作区主动作

#### Scenario: 手机短信不被调用
- **WHEN** 手机登录仍处于占位状态
- **THEN** 系统 SHALL NOT 调用 Supabase Phone OTP 发送能力
- **AND** 系统 SHALL NOT 调用 Supabase Phone OTP 验证能力
- **AND** 系统 SHALL NOT 生成 phone identity

### Requirement: 微信登录占位
系统 SHALL 在微信开放平台、Supabase provider、回调域名与 session 恢复完成 live verification 前，将微信登录作为占位能力展示，不得发起真实微信 OAuth。

#### Scenario: 微信占位显示
- **WHEN** 用户打开认证弹层并查看社交入口
- **THEN** 系统 MAY 展示微信占位
- **AND** 该占位 SHALL 显示 `微信` 与 `敬请期待`
- **AND** 微信图标 SHALL 直接使用自身绿色图标，不套用白色圆底

#### Scenario: 微信 OAuth 不启动
- **WHEN** 微信登录仍处于占位状态
- **THEN** 系统 SHALL NOT 调用 Supabase `signInWithOAuth()` 的微信 provider
- **AND** 系统 SHALL NOT 读取前端 provider id 来决定微信入口是否可点击
- **AND** 系统 SHALL NOT 跳转公共 callback 或手动进入 `/app`

#### Scenario: 微信 provider 兼容性预研
- **WHEN** 微信原始 OAuth2 端点不能满足 Supabase custom provider 的标准 OAuth2/OIDC code exchange、userinfo 或 identity mapping 要求
- **THEN** 未来恢复微信登录前 SHALL route WeChat through a server-side standard OAuth2 adapter before enabling the provider
- **AND** 系统 SHALL NOT put WeChat AppSecret, adapter signing keys, or provider client secrets into frontend-exposed Vite variables

#### Scenario: 微信 adapter 短时桥接预研
- **WHEN** Supabase custom provider calls the WeChat adapter
- **THEN** adapter SHALL preserve Supabase OAuth `state` and PKCE parameters while sending the user to WeChat QR login
- **AND** adapter SHALL consume authorization codes once
- **AND** adapter SHALL store only short-lived state/code/access-token bridge records
- **AND** adapter SHALL return userinfo with a stable `sub` derived from WeChat `unionid` when available, otherwise from current application `openid`

#### Scenario: 微信首次登录即注册
- **WHEN** 未来用户首次通过微信 OAuth 完成授权
- **THEN** 系统 SHALL 由 Supabase Auth 创建新的用户 uid
- **AND** 新用户业务数据 SHALL 绑定该 Supabase uid

#### Scenario: 微信再次登录恢复同一用户
- **WHEN** 未来用户再次使用同一微信身份完成授权
- **THEN** 系统 SHALL 恢复同一个 Supabase 用户 uid
- **AND** 系统 SHALL 读取该 uid 绑定的原有业务数据

#### Scenario: 微信 OAuth 失败
- **WHEN** 未来微信授权取消、回调错误、provider 配置错误或 code exchange 失败
- **THEN** 系统 SHALL 显示可读失败反馈
- **AND** 系统 SHALL 提供回到登录入口的路径
- **AND** 系统 SHALL NOT 暴露 OAuth code、token、AppSecret 或后端原始敏感错误

### Requirement: 多身份数据隔离
系统 SHALL 将邮箱、Google、匿名会话和未来微信会话都收敛到 Supabase `user.id`，并以当前 session 的 `auth.uid()` 隔离业务数据；手机与微信身份在占位阶段 SHALL NOT 创建。

#### Scenario: 登录成功后使用当前 uid
- **WHEN** 任意认证方式成功得到 Supabase session
- **THEN** 系统 SHALL 使用当前 session 的 Supabase `user.id` 作为唯一用户标识
- **AND** 新建业务数据 SHALL 绑定当前 `auth.uid()`

#### Scenario: 不自动合并不同身份
- **WHEN** 同一自然人分别使用邮箱、Google 或未来微信登录但尚未完成显式账号绑定
- **THEN** 系统 SHALL NOT 自动合并这些 Supabase 用户
- **AND** 系统 SHALL NOT 把一个 uid 下的数据展示给另一个 uid

#### Scenario: 家庭成员身份不串号
- **WHEN** 同一设备上不同家庭成员使用不同认证身份进入系统
- **THEN** 系统 SHALL 只展示当前 Supabase uid 绑定的数据
- **AND** 系统 SHALL NOT 因浏览器历史 session 或前端缓存读取其他家庭成员的数据
