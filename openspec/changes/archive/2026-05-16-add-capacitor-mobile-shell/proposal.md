## Why

PWA foundation 已把 Firefly-Isle 固定在 Web-first 跨平台基线，但真实 iOS / Android 安装包仍需要原生 shell、平台工程、签名前置检查和设备级回调验证。Capacitor 可以复用现有 Vite/React/Supabase 页面，把移动端工作限制在外壳层，而不重写医疗数据流。

## What Changes

- 增加 Capacitor 8 移动壳基础：统一 app id、app name、`dist` webDir、iOS/Android 平台工程和 sync/build 脚本。
- 增加移动壳配置文档：本地构建、sync、open、真机验收、签名边界、回滚路径和不提交密钥规则。
- 增加原生 WebView 边界验证：确认 native shell 只承载现有 Web app，不缓存患者数据，不绕过 Supabase Auth、隐私门控、PWA 网络提示或只读分享边界。
- 增加平台验收矩阵：iOS Simulator / iOS 真机 / Android Emulator / Android 真机覆盖冷启动、Demo、OAuth callback、分享、上传、导出和弱网提示。
- 明确不做：本 change 不上架 App Store / Google Play，不创建生产签名证书，不加入推送、后台同步、原生加密数据库、React Native/Flutter 重写或新的医疗数据模型。

## Capabilities

### New Capabilities

- `capacitor-mobile-shell`: 定义 Firefly-Isle 的 Capacitor iOS/Android 外壳、平台工程配置、WebView 安全边界、移动构建脚本和真机验证要求。

### Modified Capabilities

- None.

## Impact

- Affected dependencies: add Capacitor core/cli/platform packages.
- Affected project roots: new `capacitor.config.ts`, `ios/`, `android/`, package scripts and native-shell operations docs.
- Affected runtime expectations: native WebView must load the same `dist` app shell and preserve current Supabase/Auth/OCR/LLM/share/export/privacy semantics.
- Affected verification: local web build must precede `cap sync`; native project generation and at least sync/config checks must pass before archive.
