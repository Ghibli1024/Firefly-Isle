## Why

当前认证已经收口到 Supabase Auth，并完成邮箱、Google 与匿名会话的可靠路径。用户已确认短信成本不适合此阶段主路径，因此手机入口先作为“敬请期待”占位；微信登录也先降级为“敬请期待”，避免在 provider、开放平台和 session 恢复未完成时制造可用错觉。

## What Changes

- 在认证弹层中保留邮箱与手机两种模式；手机模式只展示“敬请期待”，不接入短信发送、验证码校验或半成品 Phone OTP。
- 微信入口在登录页展示为 `微信 敬请期待` 占位，不启动 OAuth、不读取 provider 门控、不保存 AppSecret、不自研微信 session。
- 保留微信 OAuth adapter 预研资产作为未来接入参考，但当前登录页只允许邮箱、Google 与匿名会话建立真实 session。
- 保持微信图标独立呈现，不套用 Google 等社交按钮的白色圆底，避免把占位入口误读为可点击主动作。
- 明确不在本 change 中做自动账号合并；邮箱、手机、Google、微信是否属于同一人，必须通过后续显式账号绑定设计处理。

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `auth`: 增加手机/微信登录占位、统一 session 恢复和 uid 数据隔离要求。

## Impact

- `src/routes/login-page.logic.ts`: 保持邮箱、Google、匿名三条真实认证动作；当前不暴露微信 OAuth 启动。
- `src/routes/auth-callback-page.logic.ts`: 继续服务 Google OAuth 与未来公共回调，不因微信占位引入新分支。
- `src/components/login-page-view.tsx`: 需要增加邮箱/手机模式切换、手机敬请期待占位、微信敬请期待入口。
- `src/lib/auth.tsx` 与 `src/lib/supabase.ts`: 继续作为 session 真相源；不得引入第二套认证状态。
- Supabase Dashboard: 微信 custom provider 暂缓配置；手机短信 provider 暂缓。
- 外部系统: 微信开放平台应用审核、授权域名、AppID/AppSecret 和回调域名配置全部后移到未来 change。
