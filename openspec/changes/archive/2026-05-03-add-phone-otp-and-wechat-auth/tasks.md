## 1. Product decisions

- [x] 1.1 Confirm SMS phone login should not ship in this change because SMS is paid infrastructure and needs abuse protection
- [x] 1.2 Confirm phone mode remains visible only as `敬请期待`
- [x] 1.3 Confirm WeChat remains visible only as `敬请期待` until a future provider change completes live verification
- [x] 1.4 Confirm Supabase Auth remains the only authentication system
- [x] 1.5 Confirm no automatic account merge; identity linking requires a future explicit change

## 2. External configuration

- [x] 2.1 Add non-sensitive `VITE_SUPABASE_WECHAT_PROVIDER=custom:wechat` to local/example/Cloudflare build configuration
- [x] 2.2 Defer WeChat Open Platform website application, authorized domain, AppID and AppSecret configuration
- [x] 2.3 Defer Supabase custom OAuth provider `custom:wechat` configuration until a future WeChat-login change
- [x] 2.4 Verify Supabase redirect allow list covers `/auth/callback` for local, preview, and production
  - Current result: local wildcards cover `/auth/callback`; production exact callback URLs are saved and verified after reload: `https://firefly.ghibli1024.com/auth/callback` and `https://firefly-isle.pages.dev/auth/callback`.
- [x] 2.5 Verify current Supabase cloud state before claiming live WeChat success
  - Current result: `custom provider custom:wechat not found`, so cloud provider setup is still pending.
- [x] 2.6 Verify Supabase custom provider creation form and capture compatibility finding
  - Current result: Supabase expects standard OAuth2/OIDC provider fields; raw WeChat website login may require an adapter because WeChat uses `appid`/`secret`, `openid`/`unionid`, and WeChat-specific userinfo semantics.
- [x] 2.7 Create Cloudflare KV namespace for short-lived WeChat OAuth adapter state/code/access-token storage
  - Current result: `WECHAT_OAUTH_KV` id `7d484177aca04452b34b527c507b9433`, preview id `fa1cb14ee67d4a88aeeb2d009036db69`.

## 3. Test first

- [x] 3.1 Add UI regression that phone mode shows `敬请期待`
- [x] 3.2 Add UI regression that phone mode does not expose phone input, OTP input, send-code button, cooldown, or submit
- [x] 3.3 Add UI regression that WeChat displays `敬请期待` instead of a configured OAuth control
- [x] 3.4 Remove current auth logic coverage for WeChat OAuth because the login route no longer exposes that action
- [x] 3.5 Keep regression coverage that WeChat is not rendered as a clickable OAuth control while deferred
- [x] 3.6 Keep persistence/RLS source regression that business data remains bound to current `user.id`

## 4. UI behavior

- [x] 4.1 Keep email login, sign-up, password reset, Google, anonymous session, theme toggle, language toggle, and privacy behavior intact
- [x] 4.2 Keep the email/phone segmented control
- [x] 4.3 Replace phone OTP UI with a coming-soon panel
- [x] 4.4 Remove phone send-code, OTP input, cooldown, and phone submit from the visible UI
- [x] 4.5 Keep social area concise: `Google` as the real action and `微信 敬请期待` as a placeholder
- [x] 4.6 Avoid displaying fake SMS provider controls or unimplemented SMS account-merge promises

## 5. Auth logic

- [x] 5.1 Remove phone OTP send and verify wiring from the login route
- [x] 5.2 Remove phone OTP action helpers from the login action layer while phone is deferred
- [x] 5.3 Remove WeChat OAuth start action from the current login route while WeChat is deferred
- [x] 5.4 Keep OAuth callbacks on public callback routes before `/app` route guarding
- [x] 5.5 Keep all successful auth methods flowing through `AuthProvider` and `AppRoutes`, not manual route mutation in the form
- [x] 5.6 Add Cloudflare Pages Function OAuth2 adapter endpoints for WeChat authorization, callback, token exchange, and userinfo
- [x] 5.7 Keep adapter tokens short-lived and one-time where applicable; never expose WeChat AppSecret or WeChat tokens to the frontend

## 6. Data behavior

- [x] 6.1 Ensure active code does not create phone identities while phone mode is deferred
- [x] 6.2 Ensure deferred WeChat login does not create users or patient rows before a future provider change
- [x] 6.3 Verify no email/Google/WeChat automatic account merge occurs
- [x] 6.4 Defer cross-uid live verification for WeChat until the provider is configured in a future change
- [x] 6.5 Document future account linking or anonymous-upgrade needs if implementation reveals demand

## 7. Documentation sync

- [x] 7.1 Update `src/routes/CLAUDE.md` after login route responsibilities changed
- [x] 7.2 Update `src/components/CLAUDE.md` after login view responsibilities changed
- [x] 7.3 Update root `CLAUDE.md` after Cloudflare build vars changed
- [x] 7.4 Update baseline `openspec/specs/auth/spec.md` for current WeChat placeholder behavior
- [x] 7.5 Create `functions/CLAUDE.md` and `functions/api/auth/wechat/CLAUDE.md` for the new adapter module
- [x] 7.6 Update `public/CLAUDE.md` after Cloudflare `_redirects` fallback rules were corrected

## 8. Verification

- [x] 8.1 Run focused red test for phone coming-soon behavior before implementation
- [x] 8.2 Run focused component and auth logic tests after implementation
- [x] 8.3 Run full `npm test`
- [x] 8.4 Run `npm run lint`
- [x] 8.5 Run `npm run type-check`
- [x] 8.6 Run `npm run build`
- [x] 8.7 Browser-verify `/login` email mode still works visually
- [x] 8.8 Browser-verify phone mode shows `敬请期待`
- [x] 8.9 Browser-verify WeChat shows `敬请期待` and does not use the white social-icon ring
- [x] 8.10 Defer live verification that WeChat reaches Supabase OAuth provider until a future provider change
- [x] 8.11 Defer live verification that Supabase can exchange the adapter code and restore a session until a future provider change
- [x] 8.12 Run focused adapter tests for state preservation, WeChat code exchange, PKCE token exchange, one-time code consumption, and userinfo shape
- [x] 8.13 Run Wrangler Pages local runtime verification for WeChat authorize endpoint and SPA route fallback
