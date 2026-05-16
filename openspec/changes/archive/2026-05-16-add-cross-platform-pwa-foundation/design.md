## Context

Firefly-Isle 当前是 Vite + React 18 + TypeScript SPA，部署在 Cloudflare Pages，后端能力由 Supabase Auth、PostgreSQL/RLS、Supabase Edge Functions 和 Cloudflare Pages Functions 承担。核心路由包括 `/login`、`/auth/callback`、`/app`、`/record/:id`、`/analytics/:id`、`/share/:code` 与公开 `/demo/*`。

现有架构已经天然适合 Web-first 跨平台：业务 UI、认证、OCR、AI、分享和导出都在浏览器边界内完成；当前缺口不是“没有原生 app 代码”，而是缺少可安装 PWA、移动端 installed mode、离线壳、弱网反馈和跨平台验证合同。

## Goals / Non-Goals

**Goals:**

- 让 Firefly-Isle 成为可安装 PWA，支持桌面和移动浏览器的 Add to Home Screen / install experience。
- 用 privacy-first service worker 缓存静态应用壳和构建资产，不缓存患者数据、授权码、LLM/OCR 响应或 Supabase 私有响应。
- 让移动 Web 和 installed PWA 模式下的登录回调、Demo、分享、上传、导出、统计和记录页主链路可验证。
- 为后续 Capacitor iOS/Android 壳层保留清晰外层边界，避免提前重写 React UI。

**Non-Goals:**

- 不实现 Capacitor 原生 iOS/Android 工程。
- 不实现 Tauri/Electron 桌面壳。
- 不实现 React Native、Flutter、小程序或鸿蒙重写。
- 不实现完整离线数据库、后台同步、推送通知或离线编辑。
- 不把患者记录、分享授权码、AI/OCR 响应或 Supabase API 响应持久缓存到 service worker cache。

## Decisions

### Decision 1: PWA first, native shell later

本 change 只建立 PWA foundation。后续如需 iOS/Android 安装包，再单独用 Capacitor 包现有 Web app；如需桌面本地能力，再单独比较 Tauri/Electron。

Alternatives considered:

- React Native / Flutter：可以得到更强原生体验，但会重写当前 Tailwind/shadcn/React DOM 页面、BrowserRouter、html2canvas/jsPDF 导出和文件上传链路，不符合当前阶段的最小复杂度。
- Electron / Tauri 先行：适合本地开发者工具或强桌面权限场景；Firefly-Isle 当前核心是云端医疗记录，不应为了桌面壳提前引入本地运行时。
- Capacitor 先行：会过早引入 iOS/Android 工程、签名和 store 分发问题；PWA 验证稳定后再包壳更稳。

### Decision 2: Service worker 只缓存 app shell 和静态资产

Service worker SHALL 使用明确 allowlist：HTML/app shell、Vite build assets、manifest、icons、字体和非敏感公共静态资源。所有 Supabase REST/Auth/Storage、Edge Function、Cloudflare Functions 动态 API、share-code 访问、LLM/OCR 响应和患者数据请求 SHALL 使用 network-only 或不进入 runtime cache。

Recommended implementation choice is `vite-plugin-pwa` plus explicit Workbox configuration, because it reduces hand-written service worker edge cases while still allowing runtime caching rules. If configuration proves harder than the problem, a minimal custom service worker remains acceptable, but privacy allowlist must stay central and testable.

### Decision 3: Offline means readable shell, not offline medical workflow

Offline mode SHALL present a clear state: cached public shell may open, but actions requiring server truth must stay online-only. Auth, OCR, AI analysis, saving records, reading protected records, and opening share links require network and must show retryable failure instead of pretending to work.

This keeps the data model honest. Full offline medical records would require encrypted local storage, conflict resolution, device revocation, and sync semantics; that belongs to a future dedicated change.

### Decision 4: BrowserRouter remains, Cloudflare fallback must preserve deep links

The app can keep BrowserRouter. Cloudflare Pages `_redirects` and headers must continue to serve the SPA fallback for installed PWA deep links such as `/record/:id`, `/share/:code`, `/analytics/:id`, `/demo/record`, and `/auth/callback`.

The manifest start URL should point to the existing root/login flow rather than a new platform-only route, so auth restoration and anonymous/demo entry keep one route grammar.

### Decision 5: Platform adaptation lives at the outer edge

Mobile safe-area, touch targets, installed-mode detection, beforeinstallprompt handling, network status, and capability checks should live in small platform/app-shell helpers instead of being scattered through business components. Existing domain modules should continue to speak in product terms: record, lab report, share, export, analysis.

### Decision 6: Existing browser APIs remain first-class

The PWA phase SHALL keep file upload, html2canvas/jsPDF download, clipboard/share fallback and OAuth callback behavior on browser APIs. Native file picker, native share sheet, secure storage and deep-link plugins are deferred to the later Capacitor shell.

## Risks / Trade-offs

- Service worker accidentally caches sensitive responses -> Use allowlist caching, network-only dynamic API rules, and regression tests that inspect registered runtime cache entries.
- Installed PWA OAuth callback loses session parameters -> Keep `/auth/callback` inside SPA fallback, validate redirect URLs in deployed environment, and test installed-mode callback manually.
- iOS Safari PWA behavior differs from desktop Chrome -> Include iOS Safari/Add to Home Screen in acceptance validation and keep feature detection defensive.
- Offline shell creates false confidence -> Use explicit offline copy and disabled/retryable server actions instead of local fake success.
- PWA install polish delays higher-priority auth work -> Keep scope to foundation only; no push, sync, native package, or offline database.
- A PWA library adds hidden complexity -> Prefer a small generated SW configuration; if the dependency hides privacy behavior, fall back to a minimal custom worker.

## Migration Plan

1. Add manifest, icons, metadata and installability headers.
2. Add privacy-first service worker registration and cache rules.
3. Add app-level online/offline state and retryable network failure surfaces.
4. Polish mobile safe-area, touch targets and installed-mode shell behavior.
5. Verify platform-sensitive flows across browser and installed PWA targets.
6. Deploy behind normal Cloudflare Pages release workflow; rollback by disabling service worker registration and shipping cache-busting asset changes if needed.

## Open Questions

- Which final app icon set should be canonical for PWA install assets: existing brand mark, generated maskable icons, or a refined design-system export?
- Should the first version expose a visible install CTA, or rely on browser-native install prompts and document the install path?
- Should desktop installed PWA be considered enough for macOS/Windows in v1, or should desktop package distribution become a later product requirement?
