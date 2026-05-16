## Context

Firefly-Isle is now a Vite + React SPA with a PWA baseline. The app already owns install metadata, safe-area/touch polish, offline status, privacy-first service worker caching and Cloudflare Pages deep-link fallbacks. The next mobile step should wrap that same Web app in Capacitor rather than fork the UI into a separate native codebase.

## Goals / Non-Goals

**Goals:**

- Add a reproducible Capacitor shell for iOS and Android.
- Keep React/Vite/Supabase as the single product implementation.
- Make mobile build commands explicit and easy to verify.
- Preserve the privacy and medical-data boundaries already captured by `cross-platform-pwa-foundation`.
- Prepare for later signing/store work without committing secrets or pretending distribution is complete.

**Non-Goals:**

- No App Store / Google Play release.
- No production signing certificates, provisioning profiles, keystores, or secret files.
- No push notifications, background sync, native encrypted offline database, or native medical record cache.
- No React Native, Flutter, Kotlin/Swift rewrite, mini-program, HarmonyOS, Electron or Tauri implementation.
- No change to Supabase schema, Edge Functions, LLM provider settings or patient record shape.

## Decisions

### Decision 1: Capacitor is an outer shell only

The shell SHALL load the existing Vite build from `dist`. Product screens, routing, auth, OCR, AI analysis, sharing and export stay in the React app. Native code is reserved for platform packaging and future bridge work.

### Decision 2: Keep one app id and one route grammar

Use a stable reverse-DNS id such as `com.ghibli1024.fireflyisle`. The shell SHALL start at the existing app route and SHALL NOT create native-only product screens or parallel route names.

### Decision 3: Build from web, then sync native

The durable workflow is:

```text
npm run build -> npx cap sync -> open/build native project
```

This makes the generated native assets reflect the same production bundle used by Cloudflare Pages.

### Decision 4: Do not commit signing secrets

The repository may commit Capacitor config and generated platform project structure. It SHALL NOT commit iOS provisioning profiles, Android keystores, private signing passwords, Apple team secrets, Google Play credentials, or device-specific derived data.

### Decision 5: Verify native shell semantics, not store distribution

This change can be complete when the native projects generate, sync, and expose documented verification steps. Store release, CI signing and production deployment are later changes.

## Risks / Trade-offs

- Native projects add many generated files -> keep changes isolated under `ios/`, `android/`, and document ownership clearly.
- OAuth callback may need platform-specific redirect settings -> keep current Web callback as baseline and document any future custom URL scheme as a later change.
- WebView file upload/export can differ from mobile browsers -> include simulator/device matrix and keep readable failure paths from the Web app.
- Capacitor upgrades can drift -> pin all Capacitor packages to one version.
- Signing is tempting to half-configure -> defer signing secrets and store release to a separate explicit change.

## Migration Plan

1. Add Capacitor packages and config.
2. Add iOS and Android platform projects.
3. Add mobile build/sync/open scripts.
4. Add native-shell operations documentation and architecture maps.
5. Add automated config tests where feasible.
6. Run web verification plus `cap sync`; run native build checks if local Xcode/Android tooling is available.

## Open Questions

- Which Apple Team ID and bundle display name should be used when production signing starts?
- Which Android package signing strategy should be used: local keystore first or Play App Signing first?
- Should a future change add custom URL scheme/deep links, or keep Supabase web callback only until app-store release is near?
