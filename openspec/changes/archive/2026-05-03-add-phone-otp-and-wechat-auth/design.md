## Context

认证入口的复杂度不来自按钮数量，而来自身份真相源。当前系统已经把邮箱、Google、匿名会话都收敛到 Supabase Auth，并让业务数据绑定 `auth.uid()`。新增手机和微信时，核心原则不变:

- Supabase Auth 仍是唯一认证系统。
- 前端只触发认证动作，不伪造用户、不保存自定义 token、不自行判断“注册还是登录”。
- 登录成功后只有一个用户标识: Supabase `user.id`。
- 手机短信暂缓，界面只显示“敬请期待”，避免把付费短信链路包装成半成品功能。
- 微信登录暂缓，界面只显示“敬请期待”，避免把未完成 provider 包装成可点击能力。

## Decisions

### 1. 手机登录先占位，不接短信 OTP

- **Decision**: 手机模式保留在认证弹层中，但只显示 `敬请期待`，不调用 Supabase Phone OTP，不发送短信，不展示验证码输入。
- **Rationale**: 短信验证码是付费且易被滥用的基础设施，需要 SMS provider、限流、防刷和测试号码策略。未完成这些外部条件前，最干净的实现是占位，而不是半成品。
- **Trade-off**: 中国区登录体验还缺少本地化主路径；手机号登录以后需要另开短信服务与风控 change。

```
手机 Tab
  -> 敬请期待
  -> 不发送短信
  -> 不创建 phone identity
  -> 不影响现有邮箱 / Google / 匿名入口
```

### 2. 手机模式是邮箱模式的兄弟，但当前只是未来入口

- **Decision**: 登录弹层提供 `邮箱` / `手机` 分段切换；邮箱保持真实登录/注册/重置，手机显示未来入口说明。
- **Rationale**: 手机登录未来仍是表单认证，不应挤进 Google/微信社交按钮；当前不具备短信条件时，UI 应清楚表达不可用。
- **Trade-off**: 用户会看到手机入口但不能使用；这比隐藏后让中国用户不知道规划方向更透明。

```
Auth overlay
  ├─ 邮箱
  │   ├─ 登录
  │   ├─ 注册
  │   └─ 忘记密码
  ├─ 手机
  │   └─ 敬请期待
  └─ 社交
      ├─ Google
      └─ 微信 敬请期待
```

### 3. 微信先作为占位，不启动 OAuth

- **Decision**: 微信入口在认证弹层中展示为 `微信 敬请期待`，不读取 provider 门控，不调用 Supabase OAuth，不跳转 `/auth/callback`。
- **Rationale**: 微信不是当前 Supabase 内置 social provider，不能在前端自研 token/session；在 provider、开放平台、回调域名和 session 恢复未验证前，点击入口只会制造可用错觉。
- **Trade-off**: 用户能看到微信规划，但暂时不能使用；这比隐藏规划或暴露半成品 OAuth 更诚实。
- **Current finding**: Supabase custom provider 表单支持标准 OAuth2/OIDC 字段；微信网站扫码登录使用微信自己的 `appid`/`secret`、`openid`、`unionid` 和 userinfo 形态。不要把原始微信端点硬塞进 Supabase 并点击保存，除非先用真实 code exchange 证明 Supabase 能完成 token 与 userinfo 映射。
- **Implementation choice**: 当前 Web SPA 只保留微信占位和 adapter 预研资产；前端不保存微信 AppSecret，也不启动微信 provider。

```
微信入口
  ├─ 显示: 微信 + 敬请期待
  ├─ 图标: 直接使用微信绿色图标，不套白色圆底
  ├─ 行为: 不可点击、不跳转、不调用 signInWithOAuth
  └─ 真实接入: 后续 change 再恢复 provider 与 live verification
```

### 3.1 微信接入的未来正确形态

- **Decision**: 保留 Cloudflare Pages Functions 标准 OAuth2 adapter 预研资产；未来若恢复微信登录，应让 Supabase 面向标准 provider，adapter 面向微信。
- **Rationale**: Supabase 应继续负责最终 Auth session、`auth.users` 与 `auth.uid()`；adapter 只负责把微信登录翻译成标准授权码、token、userinfo/JWKS 语义。
- **Trade-off**: adapter 资产会存在但不在当前登录页主路径使用；好处是未来接入不必重新学习微信与 Supabase 的协议边界。

```
App
  -> Supabase authorize provider=custom:wechat
  -> WeChat OAuth2 adapter
  -> WeChat Open Platform QR login
  -> WeChat OAuth2 adapter maps unionid/openid to stable subject
  -> Supabase callback creates/restores Supabase user.id
  -> /auth/callback restores session
  -> /app
```

Adapter 必须满足:

- 对 Supabase 暴露标准 authorization、token、userinfo 端点。
- 使用 Cloudflare KV 存短时 OAuth `state`、一次性 adapter code 与短时 adapter access token。
- 以微信 `unionid` 为优先稳定 subject；没有 `unionid` 时才退到当前网站应用的 `openid`。
- WeChat AppSecret 与 adapter client secret 只存在服务端/云配置，不进入 Vite 前端变量。
- OAuth `state` 和授权 code 必须一次性、短时有效，避免重放。

当前 adapter endpoints:

- Authorization URL: `https://firefly.ghibli1024.com/api/auth/wechat/authorize`
- Token URL: `https://firefly.ghibli1024.com/api/auth/wechat/token`
- Userinfo URL: `https://firefly.ghibli1024.com/api/auth/wechat/userinfo`
- WeChat callback URL: `https://firefly.ghibli1024.com/api/auth/wechat/callback`

### 4. 微信不是当前统一继续入口

- **Decision**: 当前登录页只把 Google 作为社交 OAuth 主动作；微信显示为占位，不区分“微信登录”与“微信注册”。
- **Rationale**: 未验证的 provider 不应拥有主动作外观。微信占位必须清楚表达不可用，而不是用 disabled button 冒充已接入能力。
- **Trade-off**: 如果用户希望把微信绑定到已有邮箱/Google 账号，需要后续账号绑定功能和真实微信登录能力，而不是在登录按钮里静默合并。

### 5. 不自动合并邮箱、手机、Google、微信身份

- **Decision**: 本 change 不把同 email、同微信或同 Google 的不同 Supabase identities 自动合并；手机号身份尚未创建。
- **Rationale**: 医疗数据隔离比“看起来方便”更重要。自动合并可能把家庭成员或共享设备上的不同身份错误混成一个工作区。
- **Trade-off**: 用户可能会用不同方式登录到不同账号；后续若需要统一身份，应设计显式账号绑定和确认流程。

```
auth.users
  ├─ uid A: email/password
  ├─ uid B: google
  └─ uid C: future wechat

业务数据
  patients.user_id -> 当前 session 的 auth.uid()
```

### 6. 家庭成员场景优先保证不串号

- **Decision**: 多家庭成员、多账号设备场景下，系统优先保证每次登录进入当前身份自己的数据空间。
- **Rationale**: 用户已经明确存在“一家多人、各自 Google 账号、各自病历”的需求。任何自动复用上次身份的行为都比多点一次账号选择更危险。
- **Trade-off**: 手机和微信恢复真实登录时也需要避免静默复用错误账号；若 provider 支持账号选择或扫码确认，应保留用户确认步骤。

### 7. 生产级短信另开设计

- **Decision**: 手机验证码不在本 change 中上线。
- **Rationale**: 短信验证码是付费资源，也是撞库和骚扰攻击入口；没有短信服务商、限流、CAPTCHA 和成本策略，就不应该启动。
- **Trade-off**: 后续如果重新推进手机号登录，应另开 change 明确服务商、单价、限流与测试号策略。

## Target UI

```
┌─────────────────────────────┐
│ 登录                         │
│ 此程萤，您永不踽踽独行。     │
│                             │
│  [ 邮箱 ] [ 手机 ]           │
│                             │
│  邮箱模式                    │
│    邮箱                      │
│    密码                      │
│    [ 登录 ]                   │
│    还没有账户？注册          │
│                             │
│  手机模式                    │
│    敬请期待                  │
│    手机验证码完成短信服务后开放 │
│                             │
│  ───────── 或 ─────────      │
│  [ Google ]  [ 微信 敬请期待 ]│
│                             │
│  [ 匿名会话 ]                │
└─────────────────────────────┘
```

社交区域保持短文案。Google 是可点击主动作；微信是不可点击占位，绿色微信图标直接呈现，不套白色圆底。

## External Configuration Checklist

手机 OTP:

- Deferred. Do not configure SMS provider in this change.
- Future change must choose SMS provider, rate limits, CAPTCHA/bot protection, and test phone strategy.

微信:

- Deferred. Do not enable WeChat OAuth from the login page in this change.
- Decide target product shape: website QR login, mobile app login, official account, or mini program. Do not mix them as one provider.
- WeChat AppID/AppSecret available and stored only in provider/server configuration.
- Authorized domain matches `firefly.ghibli1024.com` and any preview/local strategy.
- Supabase custom OAuth/OIDC provider feasibility verified, including authorization endpoint, token endpoint, userinfo endpoint, callback URL, scopes, and identity key mapping.
- Configure the Cloudflare Pages Function OAuth2 adapter before enabling `custom:wechat`.
- Cloudflare KV binding `WECHAT_OAUTH_KV` exists and stores only short-lived adapter state/code/access-token bridges.
- Cloudflare secrets `WECHAT_OPEN_APP_ID`, `WECHAT_OPEN_APP_SECRET`, and `WECHAT_OAUTH_CLIENT_SECRET` are set before live verification.
- Supabase Redirect URLs include exact production callback URLs: `https://firefly.ghibli1024.com/auth/callback` and `https://firefly-isle.pages.dev/auth/callback`; local wildcard URLs already cover `/auth/callback`.
- Public callback route can complete session restore before `/app` guard runs.

## Deferred Questions

- 匿名用户是否允许绑定手机或微信升级成正式账号？如果允许，应另开账号绑定/匿名升级 change。
- 手机验证码是否需要国际国家区号选择器？当前手机入口占位，暂不处理。
- 微信是否继续推进真实开放平台配置？当前前端只提供“敬请期待”占位，不自建微信 session。
