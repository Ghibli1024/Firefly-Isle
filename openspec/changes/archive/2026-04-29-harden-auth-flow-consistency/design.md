## Context

认证系统最危险的坏味道，是页面承诺了一个入口，但系统没有对应能力。当前 `/login` 的认证内核已经可靠地落在 Supabase Auth 上；问题集中在入口一致性:

- `记住我` 看起来能控制 session，但 Supabase client 固定持久化 session。
- `忘记密码?` 看起来是功能入口，但没有 password reset flow。
- 微信和 Google 看起来像社交登录，但微信未计划接入，Google 尚未真实调用 OAuth。
- 注册模式执行 `signUp()`，但弹层仍用登录标题。
- 匿名会话文案像临时体验，但后端实际创建匿名用户并持久绑定数据。

这不是补几个 if/else，而是要让认证状态成为单一真相源。

## Decisions

### 1. 保留 Supabase Auth 作为认证内核

- **Decision**: 本 change 不迁移认证系统，不引入新的 Auth framework。
- **Rationale**: 当前数据库授权模型依赖 Supabase JWT 与 `auth.uid()`。替换认证内核会扩大风险，并迫使 RLS、session、OAuth callback 与用户 ID 映射全部重接。
- **Trade-off**: UI 和前端状态仍需要自己收口，Supabase 不会自动修复本地组件的语义漂移。

### 2. Auth mode 是 UI 文案和动作的唯一来源

- **Decision**: 认证弹层只允许 `login`、`sign-up`、`password-reset` 三种显式模式；标题、dialog label、主按钮、辅助文案和反馈都从 mode 推导。
- **Rationale**: 按钮是注册但标题是登录，说明状态源已经分裂。把 mode 变成唯一来源，可以消除特殊情况。
- **Trade-off**: 需要整理当前展示层的文案生成逻辑，但不需要重写页面结构。

### 3. 删除 `记住我`

- **Decision**: 本 change 删除 `记住我` 控件，不实现可切换 session 持久化。
- **Rationale**: Supabase client 当前使用 `persistSession: true`，用户勾选不会改变行为。假控件比没有控件更坏。
- **Trade-off**: 用户暂时不能选择临时 session。若未来需要无痕/临时模式，应另开 change 设计 session storage 策略。

### 4. 接入密码重置

- **Decision**: `忘记密码?` 从假入口变成真实 password reset mode，调用 Supabase `resetPasswordForEmail()`。
- **Rationale**: 邮箱密码登录的自然配套能力就是密码重置；Supabase 已经提供现成 API。
- **Trade-off**: 需要配置 redirect URL，并提供一个后续修改密码的落点；反馈不能暴露邮箱是否存在。

### 5. 隐藏微信，接入 Google

- **Decision**: 微信登录入口隐藏；Google 登录入口接入 Supabase `signInWithOAuth({ provider: 'google' })`。
- **Rationale**: Google OAuth 是 Supabase 的成熟路径。微信 Web 登录涉及开放平台、回调域名、审核与区域产品决策，不适合作为本 change 的主线。
- **Trade-off**: 视觉上少一个社交按钮，但减少了一个假入口。

### 6. Google OAuth 是统一登录/注册入口

- **Decision**: Google OAuth 不区分登录页或注册页来源，统一交给 Supabase provider 处理；已有 Supabase 用户恢复同一个 uid，没有对应用户时以第一次成功 Google OAuth 回调创建新用户。
- **Rationale**: OAuth provider 已经是身份真相源，前端不应该在进入 Google 前预判“登录”还是“注册”。业务数据通过 `auth.uid()` 绑定，复用同一个 uid 才能恢复原有记录。
- **Account chooser**: Google OAuth 请求带 `prompt=select_account`，让家庭成员、多账号浏览器和共享设备每次都由 Google 显示账号选择器，而不是静默复用上一次 Google 会话。
- **Trade-off**: 前端只表达 `使用 Google 继续` 的统一动作；是否允许新用户创建必须由 Supabase Auth 的注册配置保证。多一次账号选择比误进错账号更符合病历隔离场景。

### 7. Google OAuth 回调落在公共入口

- **Decision**: Google OAuth 的 `redirectTo` 使用公共 `/auth/callback`，而不是受保护的 `/app`。
- **Rationale**: `/app` 会在 session 恢复完成前被路由守卫判定为未认证并重定向，可能把 OAuth callback URL 中的 token/code 清掉。`/auth/callback` 是公共入口，专门负责让 Supabase 完成 PKCE code exchange 与 session restore；恢复成功后 `AppRoutes` 再把已认证用户导向 `/app`。
- **Trade-off**: 多一个很小的公共回调页，但 session 恢复不再隐含在登录页渲染副作用里，Google 首次注册和再次登录走同一条可测路径。

### 8. 注册后根据 session 分流

- **Decision**: `signUp()` 后检查返回结果是否包含 session。
- **Rationale**: Supabase 的邮箱确认配置会影响注册后是否立即认证。代码不能固定假设一定要查收邮件。
- **Trade-off**: 反馈文案和测试要覆盖两条路径。

```
signUp()
  ├─ data.session exists -> 已认证 -> AuthProvider -> /app
  └─ no session          -> 待邮箱确认 -> 留在入口并提示查收邮件
```

### 9. 匿名会话文案必须诚实

- **Decision**: 匿名入口说明它会创建 Supabase 匿名身份，并将当前会话数据绑定到匿名 uid。
- **Rationale**: 匿名不是无状态。用户不需要邮箱，但系统仍创建身份、保存 session、执行 RLS。
- **Trade-off**: 文案比 `无需登录，直接使用` 稍重，但减少隐私和数据持久化误解。

## Target Flow

```
/login intro
  -> open auth overlay
     -> login mode
        -> signInWithPassword()
     -> sign-up mode
        -> signUp()
     -> password-reset mode
        -> resetPasswordForEmail()
     -> Google
        -> signInWithOAuth({ redirectTo: /auth/callback })
        -> /auth/callback restores Supabase session
        -> Supabase creates or reuses auth user
     -> anonymous
        -> signInAnonymously()
  -> AuthProvider
     -> getSession() / onAuthStateChange()
  -> AppRoutes
     -> /app or /login
  -> Workspace persistence
     -> patients.user_id = auth.uid()
     -> treatment_lines scoped through patients
```

## Verification Philosophy

本 change 的测试不应只盯 markup。真正要锁住的是三件事:

1. UI mode 与可见文案一致。
2. 每个可见入口都有对应 Supabase Auth 调用。
3. 登录后的业务数据仍通过 `auth.uid()` 进入 RLS 保护域。

## External Configuration Checklist

Google OAuth live verification requires configuration outside the React app:

- Google Cloud OAuth client type: Web application.
- Authorized JavaScript origins include the production origin, preview origin, and local dev origin such as `http://localhost:5173`.
- Supabase Auth Google provider has the Google Client ID and Client Secret configured.
- Supabase Auth Site URL / Additional Redirect URLs include the public `/auth/callback` OAuth callback target for local, preview, and production origins.

Password reset live verification requires:

- Supabase Auth redirect allow list includes the app origin and the password reset redirect target.
- The app sends `redirectTo` to a route capable of receiving the recovery session and guiding the user to update their password.
- SMTP/email delivery is configured enough for the target environment; hosted defaults may be rate-limited and should not be treated as production-grade email delivery.
