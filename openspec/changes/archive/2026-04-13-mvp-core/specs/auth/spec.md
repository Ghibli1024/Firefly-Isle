## ADDED Requirements

### Requirement: 邮箱登录
系统 SHALL 支持用户通过邮箱和密码注册、登录，使用 Supabase Auth 邮箱认证流程。

#### Scenario: 邮箱注册
- **WHEN** 用户填写邮箱和密码并提交注册表单
- **THEN** 系统 SHALL 调用 Supabase Auth signUp，向用户邮箱发送确认邮件，并提示用户查收

#### Scenario: 邮箱登录成功
- **WHEN** 用户输入正确的邮箱和密码
- **THEN** 系统 SHALL 获取有效 session，用户进入已认证状态，跳转到主界面

#### Scenario: 邮箱登录失败
- **WHEN** 用户输入错误的邮箱或密码
- **THEN** 系统 SHALL 展示可读错误信息（如「邮箱或密码错误」），不暴露具体原因

### Requirement: 匿名模式
系统 SHALL 支持用户在不注册的情况下以匿名身份使用，并通过 Supabase `signInAnonymously()` 创建匿名 session，将数据关联到匿名用户 uid。

#### Scenario: 匿名模式进入
- **WHEN** 用户点击「无需登录，直接使用」或类似入口
- **THEN** 系统 SHALL 创建 Supabase 匿名用户 session（signInAnonymously），用户可正常使用提取和导出功能

#### Scenario: 匿名用户数据隔离
- **WHEN** 匿名用户创建患者记录
- **THEN** 记录的 user_id SHALL 为匿名用户的 uid，RLS 策略同等生效，其他用户不可访问

### Requirement: 首次使用显示隐私条款
系统 SHALL 在用户首次进入应用时展示隐私条款，用户确认后方可继续使用。

#### Scenario: 首次使用隐私条款展示
- **WHEN** 用户首次访问应用（本地无已确认记录）
- **THEN** 系统 SHALL 在进入主功能前展示隐私条款弹窗或页面，包含数据使用说明

#### Scenario: 用户拒绝隐私条款
- **WHEN** 用户拒绝或关闭隐私条款而未确认
- **THEN** 系统 SHALL 不允许用户进入主功能，停留在隐私条款页面

#### Scenario: 已确认用户不重复展示
- **WHEN** 用户已确认过隐私条款（本地有确认记录）
- **THEN** 系统 SHALL 跳过隐私条款展示，直接进入主界面

### Requirement: Session 持久化
系统 SHALL 在用户关闭并重新打开浏览器后保持登录状态，直到用户主动退出。

#### Scenario: Session 自动恢复
- **WHEN** 已登录用户关闭浏览器后重新打开应用
- **THEN** 系统 SHALL 自动恢复 Supabase session，用户无需重新登录

#### Scenario: 主动退出登录
- **WHEN** 用户点击退出登录
- **THEN** 系统 SHALL 调用 Supabase Auth signOut，清除本地 session，跳转到登录页
