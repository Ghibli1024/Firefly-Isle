# 认证学习专题：邮箱、Google、Supabase 与微信登录

## 1. 基本信息

- 类型: 专题学习日志，不对应单个 commit
- 时间顺序: 0023
- 日期: 2026-04-30
- 主题: 从邮箱/Google 登录到微信开放平台登录的认证体系复盘
- 当前关联 change: `openspec/changes/add-phone-otp-and-wechat-auth/`
- 当前状态: 微信开放平台网站应用审核中；手机号验证码暂缓；公众号关注登录暂不进入当前实现

## 2. 这轮工作真正解决了什么

这轮工作的核心不是“多放几个登录按钮”，而是把所有登录入口收束到同一个身份真相源:

```text
邮箱 / Google / 微信 / 匿名会话
        ↓
Supabase Auth
        ↓
Supabase user.id / auth.uid()
        ↓
patients.user_id 等业务数据隔离
```

前端只负责触发认证动作，不负责发明用户、不保存 token、不判断“这是注册还是登录”。真正的用户创建、会话恢复和身份归属都交给 Supabase Auth。

这件事之所以重要，是因为项目保存的是病历资料。登录便利性不能压过数据隔离。一旦错误合并账号、错误复用上次身份，家庭成员之间的病历就可能串号。

## 3. 时间线复盘

### 3.1 邮箱登录与注册

邮箱路径是最基础的认证路径:

```text
邮箱注册
  -> supabase.auth.signUp()
  -> 如果 Supabase 返回 session，直接进入 /app
  -> 如果没有返回 session，提示先关闭 Supabase 邮箱确认

邮箱登录
  -> supabase.auth.signInWithPassword()
  -> 成功后 AuthProvider 收到 session
  -> /login 自动进入 /app
```

错误处理的原则是: 给用户友好反馈，不暴露 Supabase 原始错误、内部 code 或敏感参数。

### 3.2 Google 登录

Google 不是单独的“注册按钮”和“登录按钮”，而是统一入口:

```text
使用 Google 继续
  -> supabase.auth.signInWithOAuth({ provider: 'google' })
  -> Google 授权
  -> Supabase callback
  -> /auth/callback 恢复 session
  -> /app
```

如果这个 Google 身份第一次出现，Supabase 会创建用户；如果已经存在，则恢复同一个 Supabase 用户。前端不需要也不应该判断“这是注册还是登录”。

后来为了家庭成员场景，Google 登录还加入了账号选择提示:

```text
queryParams: { prompt: 'select_account' }
```

这样共用一台电脑时，用户更容易选择正确的 Google 账号，而不是静默复用浏览器里的上一次身份。

### 3.3 OAuth callback 从 `/app` 改到公共路由

早期问题是: OAuth 回来后直接落到受保护的 `/app`，但此时 session 可能还没有恢复完成。路由守卫先判断“未登录”，把用户送回 `/login`，OAuth code/state 就被打断。

修正后的模型:

```text
OAuth provider
  -> /auth/callback?code=...
  -> exchangeCodeForSession(code)
  -> getSession()
  -> 有 session: 进入 /app
  -> 无 session 或错误: 回到 /login 并显示友好错误
```

关键点: `/auth/callback` 必须是公共页面，不能被 `/app` 的登录守卫提前拦截。

### 3.4 Supabase Redirect URLs

Supabase 的 `redirectTo` 不是前端想填什么都可以。Supabase Dashboard 的 URL Configuration 必须允许这个回调地址。

本项目使用的思路:

```text
生产主域名:
  https://firefly.ghibli1024.com

生产 OAuth callback:
  https://firefly.ghibli1024.com/auth/callback

Cloudflare Pages 预览/默认域:
  https://firefly-isle.pages.dev/auth/callback

本地开发:
  http://localhost:*/**
  http://127.0.0.1:*/**
```

本地用 wildcard 是为了避免 Vite 端口变化导致每次都要改 Supabase；生产环境用精确路径是为了减少不必要的回调面。

### 3.5 微信开放平台网站应用

微信网站登录走的是微信开放平台的“网站应用”。这里填的授权回调域应该是当前真实 Web App 域名:

```text
firefly.ghibli1024.com
```

它不是:

```text
ghibli1024.com
localhost
https://firefly.ghibli1024.com/auth/callback
```

原因是微信这里要的是域名，不是完整 URL。具体路径由后续 OAuth 流程和后端 adapter 决定。

当前状态是网站应用已提交审核。审核通过后才能拿到可用于真实登录链路的 AppID/AppSecret。

### 3.6 微信公众号关注登录

截图里那种“扫码关注公众号登录”不是当前申请的网站应用登录。它是另一套系统:

```text
用户扫公众号带参数二维码
  -> 已关注则触发 SCAN 事件
  -> 未关注则先关注，再触发 subscribe 事件
  -> 公众号服务器收到事件推送
  -> 后端用 scene_id 绑定网页登录会话
  -> 网页轮询或订阅到登录成功
```

它通常需要已认证服务号、公众号服务器配置、带参数二维码接口、事件回调处理。适合运营增长和沉淀公众号粉丝，但不应作为当前主登录路径。

## 4. 当前认证架构

### 4.1 前端分层

当前登录相关职责拆成三层:

```text
src/components/login-page-view.tsx
  只负责 UI:
  邮箱/手机分段、Google/微信按钮、匿名入口、错误展示

src/routes/login-page.tsx
  负责页面状态接线:
  表单 state、按钮 handler、Supabase client 注入

src/routes/login-page.logic.ts
  负责认证动作:
  signUp / signInWithPassword / signInWithOAuth / redirectTo 计算
```

这条边界很关键。展示层不触碰 Supabase，动作层不关心页面长什么样。

### 4.2 全局 session 真相源

`src/lib/auth.tsx` 是 session 的全局真相源。它负责:

- 启动时 `getSession()`
- 监听 `onAuthStateChange(...)`
- 暴露当前 `user` / `session`
- 让路由守卫基于同一份状态判断 `/login` 与 `/app`

`src/lib/supabase.ts` 则负责创建 Supabase client，并启用:

```text
flowType: 'pkce'
detectSessionInUrl: true
persistSession: true
autoRefreshToken: true
```

这些配置让浏览器端 OAuth callback 能够恢复 session，并让刷新页面后仍能保留登录状态。

## 5. 数据流与接口

### 5.1 邮箱登录数据流

```text
LoginPageView submit
  -> login-page.tsx handler
  -> submitEmailAuth()
  -> supabase.auth.signInWithPassword()
  -> AuthProvider 收到 SIGNED_IN/session
  -> AppRoutes: /login 已登录则跳 /app
```

### 5.2 Google 登录数据流

```text
Google button
  -> startGoogleAuth()
  -> supabase.auth.signInWithOAuth({
       provider: 'google',
       options: {
         redirectTo: origin + '/auth/callback',
         queryParams: { prompt: 'select_account' }
       }
     })
  -> Google 授权
  -> Supabase Auth callback
  -> /auth/callback
  -> exchangeCodeForSession()
  -> getSession()
  -> /app
```

### 5.3 微信网站登录目标数据流

微信不能直接当作普通 Supabase 内置 provider 使用。因此当前设计增加 Cloudflare Pages Function OAuth2 adapter:

```text
微信 button
  -> startWechatAuth()
  -> supabase.auth.signInWithOAuth({ provider: 'custom:wechat' })
  -> Supabase custom provider authorization URL
  -> Cloudflare adapter /api/auth/wechat/authorize
  -> WeChat Open Platform QR login
  -> Cloudflare adapter /api/auth/wechat/callback
  -> Cloudflare adapter /api/auth/wechat/token
  -> Cloudflare adapter /api/auth/wechat/userinfo
  -> Supabase 创建/恢复 user.id
  -> /auth/callback 恢复 session
  -> /app
```

Adapter 对 Supabase 暴露标准 OAuth2 语义，对微信处理微信自己的 `openid` / `unionid` / userinfo 形态。

当前 adapter 端点:

```text
Authorization URL: /api/auth/wechat/authorize
Token URL:         /api/auth/wechat/token
Userinfo URL:      /api/auth/wechat/userinfo
WeChat callback:   /api/auth/wechat/callback
```

生产完整域名前缀是:

```text
https://firefly.ghibli1024.com
```

### 5.4 业务数据隔离

登录成功不是结束，真正重要的是后续所有病历数据都绑定当前 Supabase 用户:

```text
auth.users.id
  ↓
auth.uid()
  ↓
patients.user_id
  ↓
treatment_lines.patient_id
```

不要用 email 当主键。email 会变、会重复、会被不同 provider 以不同形式返回。业务数据的唯一归属应该是当前 session 的 `user.id`。

## 6. 外部配置清单

### 6.1 Supabase

需要配置:

- Site URL: 生产主入口
- Redirect URLs: 生产、预览、本地 callback
- Google provider: Client ID / Client Secret
- WeChat custom provider: 指向 Cloudflare adapter 的 OAuth2 endpoints

不能做:

- 不把 provider secret 放进前端环境变量
- 不把 OAuth code/token 打到日志或文档
- 不让 OAuth 回调直接落到受保护 `/app`

### 6.2 Google Cloud

需要配置:

- OAuth Client 类型: Web application
- Authorized JavaScript origins: 生产域名与本地开发 origin
- Authorized redirect URI: Supabase Auth callback

注意: Google Cloud 里的 redirect URI 是 Supabase callback，不是 Firefly 的 `/auth/callback`。Google 先回到 Supabase，Supabase 再按 `redirectTo` 回到应用。

### 6.3 微信开放平台

网站应用需要:

- 网站应用名称
- 应用官网
- 授权回调域
- 网站信息登记表
- 应用图标
- 审核通过后的 AppID/AppSecret

授权回调域填:

```text
firefly.ghibli1024.com
```

审核通过前，真实扫码登录不能宣称完成。

### 6.4 Cloudflare Pages Functions

Cloudflare adapter 需要:

- 非敏感公开配置: provider id、callback URL、client id
- 服务端 secrets: 微信 AppSecret、adapter client secret
- KV namespace: 存短时 state、一次性 code、短时 adapter access token

KV 里只放短生命周期桥接状态，不放长期用户资料。

## 7. 微信开放平台登录 vs 公众号关注登录

这两个名字都像“微信登录”，但不是同一个东西。

| 项目 | 微信开放平台网站登录 | 公众号扫码关注登录 |
| --- | --- | --- |
| 平台 | 微信开放平台 | 微信公众平台 |
| 账号形态 | 网站应用 | 公众号，通常是认证服务号 |
| 用户动作 | 微信扫码授权 | 扫码关注或已关注后扫码 |
| 是否必须关注 | 不需要 | 通常需要 |
| 回调方式 | OAuth redirect | 公众号事件推送 |
| 主要标识 | `unionid` 优先，退到网站应用 `openid` | 公众号 `openid`，绑定开放平台后可有 `unionid` |
| 适合场景 | 标准网页登录 | 运营增长、公众号粉丝沉淀 |

当前 Firefly-Isle 的主路径应继续使用微信开放平台网站登录。公众号关注登录可以作为未来增强能力，但不应替代主登录。

## 8. 手机验证码为什么暂缓

手机号登录不是“加一个输入框”这么简单。它至少需要:

- SMS provider
- 短信费用预算
- 防刷限流
- 图形验证码或其他 bot 防护
- 测试号码策略
- 失败重试和冷却时间
- 滥用监控

因此当前实现只保留手机 Tab，并显示 `敬请期待`。它不发送短信、不展示验证码输入、不创建 phone identity。

## 9. 排错索引

### 9.1 登录后回到 `/login`

常见原因:

- OAuth callback 落到受保护页面
- Supabase session 尚未恢复就被路由守卫重定向
- Redirect URL 未被 Supabase allow list 允许

修复方向:

```text
redirectTo -> /auth/callback
/auth/callback 先 exchangeCodeForSession()
然后 getSession()
最后交给路由守卫进入 /app
```

### 9.2 `bad_oauth_state`

含义: OAuth state 已过期、被重复使用、浏览器会话丢失，或用户从旧授权页继续操作。

处理方式:

- 提示用户重新点击 Google/微信入口
- 不继续使用旧 code
- 不暴露原始 OAuth 参数

### 9.3 `Unable to exchange external code`

含义: provider 返回的 code 无法被 Supabase 换成 session。常见原因:

- provider secret 配错
- redirect URI 不一致
- code 已使用或过期
- provider 与 Supabase 期望的 token/userinfo 形态不兼容

微信场景下，这也是为什么需要标准 OAuth2 adapter，而不是把微信原始接口硬塞进 Supabase custom provider。

### 9.4 `custom provider custom:wechat not found`

含义: 前端已经发起 `custom:wechat`，但 Supabase 里还没有配置这个 custom provider。

处理顺序:

```text
微信开放平台审核通过
  -> 拿 AppID/AppSecret
  -> 配 Cloudflare adapter secrets
  -> 配 Supabase custom provider
  -> 再做端到端扫码验证
```

### 9.5 Google 不弹账号选择

如果浏览器已登录 Google，默认可能静默复用上次账号。当前用:

```text
prompt=select_account
```

让 Google 尽量展示账号选择页，降低家庭成员共用设备时选错账号的风险。

## 10. 当前实现状态

已完成:

- 邮箱注册/登录/重置密码动作层
- Google OAuth 启动与公共 `/auth/callback`
- Google 账号选择提示
- 手机登录占位，不发送短信
- 微信按钮简洁化为 `微信`
- `custom:wechat` provider id 门控
- Cloudflare Pages Function 微信 OAuth2 adapter 代码
- Supabase Redirect URLs 覆盖 `/auth/callback`
- OpenSpec change 中记录外部阻塞与当前设计

未完成或外部阻塞:

- 微信开放平台网站应用审核通过
- 微信 AppID/AppSecret 写入服务端配置
- Supabase custom provider `custom:wechat` 正式配置
- 微信扫码后 Supabase session 端到端验证
- 微信登录后跨 uid 的 RLS 真实验证
- 手机验证码生产级短信服务
- 公众号关注登录

## 11. 审核通过后的下一步

微信开放平台网站应用审核通过后，按这个顺序继续:

1. 在微信开放平台读取网站应用 AppID/AppSecret。
2. 把 AppSecret 写入 Cloudflare secret，不进入前端代码。
3. 确认 Cloudflare adapter 的生产 URL 可访问。
4. 在 Supabase custom provider 创建 `custom:wechat`。
5. 填写 authorization/token/userinfo endpoints。
6. 配置 Supabase client id/client secret。
7. 从登录页点击 `微信`，验证能到微信扫码页。
8. 扫码授权后验证回到 `/auth/callback`。
9. 验证 Supabase session 恢复，并进入 `/app`。
10. 验证病历数据只读取当前 `auth.uid()` 下的数据。

## 12. 这轮工作的设计原则

### 12.1 单一身份真相源

所有登录方式都必须落到 Supabase Auth。只要出现第二套 session、第二套 user id、第二套 token 存储，后续数据隔离就会变成长期债务。

### 12.2 OAuth 是继续入口，不是注册/登录二选一

Google 和微信都应该是“继续”。第一次进入时创建身份，再次进入时恢复身份。前端不应该提前猜。

### 12.3 不自动合并账号

邮箱、Google、微信、匿名用户可能属于同一个人，也可能属于同一台电脑上的不同家庭成员。没有显式绑定设计时，自动合并就是危险行为。

### 12.4 先让半成品消失

手机号登录没有短信服务和风控时，最好的实现不是半接入，而是清楚地显示 `敬请期待`。好系统不靠假按钮骗用户。

## 13. 证据与置信度

证据来源:

- `src/routes/login-page.logic.ts`: 邮箱、Google、微信 OAuth 启动逻辑
- `src/routes/auth-callback-page.logic.ts`: OAuth callback session restore
- `src/lib/supabase.ts`: Supabase client PKCE/session 配置
- `functions/api/auth/wechat/*`: Cloudflare Pages Function OAuth2 adapter
- `openspec/changes/add-phone-otp-and-wechat-auth/design.md`: 手机占位、微信 adapter、账号隔离决策
- `openspec/changes/add-phone-otp-and-wechat-auth/tasks.md`: 当前完成项与外部阻塞项

置信度:

- 当前等级: 高
- 原因: 这篇文档基于当前代码、OpenSpec artifacts、Dashboard 配置过程与实际排错路径整理；未写入密钥值，也未把尚未完成的微信端到端登录描述成已完成。
