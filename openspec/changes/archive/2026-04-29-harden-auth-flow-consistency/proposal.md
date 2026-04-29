## Why

当前项目已经把认证内核放在 Supabase Auth 上，并让业务数据通过 `auth.uid()` 与 PostgreSQL RLS 绑定。这个方向是正确的，不需要替换成 Auth.js、Better Auth、Keycloak 或自研认证系统。

真正的问题不是认证内核缺失，而是认证入口在三层出现漂移:

- UI 层展示了 `注册`、`记住我`、`忘记密码?`、微信、Google、匿名会话等入口。
- 前端状态机只接通了邮箱登录、注册和匿名会话。
- Supabase Auth 现成能力没有被完整、诚实地映射到 UI。

最明显的问题是用户切换到注册后，提交按钮已经变成注册动作，但弹层标题和 dialog 语义仍是 `登录`。这不是样式问题，而是状态模型不干净: 一个界面同时说两件互相矛盾的事。

本 change 的目标是让认证入口回到一个稳定模型:

```
UI auth mode
  -> Supabase Auth API
  -> AuthProvider session
  -> AppRoutes
  -> auth.uid() / RLS
```

## What Changes

- 删除无效的 `记住我` 控件，避免给用户一个不会改变 session 行为的假选择。
- 增加密码重置模式，接入 Supabase `resetPasswordForEmail()`，并使用不泄露账户存在性的反馈。
- 隐藏微信登录入口，直到真实 provider 与产品配置完成。
- 接入 Google 登录入口，使用 Supabase `signInWithOAuth({ provider: 'google' })`。
- 修正登录、注册、密码重置三种模式的标题、dialog label、主按钮、辅助文案与反馈状态。
- 修正 `signUp()` 后的分流: 如果 Supabase 返回 session，则进入已认证路径；如果未返回 session，则提示用户查收验证邮件。
- 改善匿名会话文案，说明匿名不是无身份，而是 Supabase 创建的匿名 session，后续数据会绑定匿名 uid。
- 补齐 Auth 调用、session 恢复、路由守卫、密码重置、Google OAuth 入口与基础持久化测试。

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `auth`: 邮箱登录、注册、匿名模式、密码重置、Google OAuth、session 恢复和退出登录的 UI/状态/API 一致性。
- `app-shell`: `/login` 的认证弹层在不同 auth mode 下必须表达一致的入口语义。
- `supabase-schema`: schema 不变，但验证范围需要覆盖匿名/邮箱用户通过 `auth.uid()` 写入和隔离业务数据。

## Out of Scope

- 不替换 Supabase Auth。
- 不自研密码、token、session、邮件验证或 OAuth 服务器。
- 不接微信登录。
- 不做 MFA、企业 SSO、组织权限或用户中心。
- 不重构数据库 schema。
- 不改变 PatientRecord、信息提取、时间线、导出或 LLM 业务流程。

## Impact

- Affected code later: `src/routes/login-page.tsx`, `src/components/login-page-view.tsx`, `src/lib/auth.tsx`, `src/lib/supabase.ts`, `src/App.tsx`, login/auth tests, and possibly focused helpers extracted from login state.
- Affected docs later: `openspec/specs/auth/spec.md`, `src/routes/CLAUDE.md`, `src/components/CLAUDE.md`, `src/lib/CLAUDE.md`, and change-local task status.
- External configuration later: Supabase Google provider, Auth redirect URLs, password reset redirect URL, and local/preview origins.
