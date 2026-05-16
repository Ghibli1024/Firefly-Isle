## Why

Firefly-Isle 已经完成 Web 产品闭环，但当前仍只能作为普通网页使用，无法给真实用户提供可安装、弱网友好、移动端稳定的跨平台入口。先建立 PWA foundation 可以最大化复用现有 React/Vite/Supabase/Cloudflare 架构，为后续 Capacitor iOS/Android 壳层留下清晰边界，而不提前重写 UI。

## What Changes

- 增加 PWA 安装基础：Web App Manifest、应用图标、应用名、启动 URL、显示模式、主题色与移动端 metadata。
- 增加 Service Worker 缓存边界：缓存静态构建资产与离线壳，不缓存患者数据、授权码、LLM/OCR 响应或 Supabase API 私有响应。
- 增加离线 / 弱网体验：网络不可用时展示可解释状态，允许已缓存公共页面壳可打开，但需要在线的认证、OCR、AI、分享访问与保存动作必须明确失败或等待重试。
- 增加移动 Web polish：safe-area、触控目标、窄屏导航、文件上传、导出下载与分享链接在移动浏览器和 installed PWA 下保持可用。
- 增加平台验证矩阵：覆盖 Safari iOS、Chrome Android、桌面 Chromium/Safari，以及 installed PWA 的登录回调、Demo、真实工作区、分享、上传和导出主链路。
- 明确不做：本 change 不实现 Capacitor 原生壳、Tauri/Electron 桌面壳、React Native/Flutter 重写、小程序/鸿蒙版本、完整离线数据库或后台同步。

## Capabilities

### New Capabilities
- `cross-platform-pwa-foundation`: 定义 Firefly-Isle 的 PWA 安装、缓存、离线壳、移动适配、隐私缓存边界和跨平台验证要求。

### Modified Capabilities

- None.

## Impact

- Affected frontend: Vite build configuration, app entrypoint, public assets, metadata, routing boot behavior, mobile shell styling, network/offline status UI, and browser capability detection.
- Affected runtime flows: Supabase Auth callback, session persistence, Demo routes, `/app` upload/OCR, `/record/:id` export, `/share/:code` read-only access, and `/analytics/:id` read paths need PWA-mode verification.
- Affected deployment: Cloudflare Pages must serve manifest, icons, service worker, `_headers`, and fallback routes with cache headers that do not undermine privacy.
- New dependency likely: a Vite PWA/workbox integration or a minimal custom service worker, chosen in design by privacy boundary and simplicity.
