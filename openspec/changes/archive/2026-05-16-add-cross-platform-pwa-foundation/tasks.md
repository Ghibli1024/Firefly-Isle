## 1. PWA Metadata And Assets

- [x] 1.1 Choose the canonical PWA icon source and generate required normal and maskable icon sizes.
- [x] 1.2 Add Web App Manifest with name, short name, start URL, scope, display mode, theme color, background color and icon entries.
- [x] 1.3 Wire manifest, Apple mobile metadata, theme color and viewport/safe-area metadata into the app document.
- [x] 1.4 Update Cloudflare/public asset headers so manifest, icons and static assets are served with correct content types and safe cache policies.

## 2. Privacy-First Service Worker

- [x] 2.1 Select `vite-plugin-pwa`/Workbox or a minimal custom service worker and document the choice in the implementation notes.
- [x] 2.2 Register the service worker from the app entrypoint only in supported browser environments.
- [x] 2.3 Configure static asset/app-shell caching for build assets, manifest, icons, fonts and non-sensitive public resources.
- [x] 2.4 Configure dynamic API requests for Supabase, Edge Functions, Cloudflare Functions, OCR, LLM, share-code and patient data paths to avoid Cache Storage.
- [x] 2.5 Add update/cleanup behavior so stale static caches do not trap users on an old deployment.

## 3. Offline And Mobile Shell Behavior

- [x] 3.1 Add app-level online/offline detection and a reusable network status surface.
- [x] 3.2 Ensure login, anonymous session, OCR, AI analysis, saving, protected record reads, share reads and analytics refresh show retryable online-required feedback when offline.
- [x] 3.3 Polish mobile safe-area spacing for login, app shell, side navigation, record page, analytics page, share page and modal actions.
- [x] 3.4 Verify touch targets and text fitting for core controls on narrow mobile viewports.
- [x] 3.5 Preserve BrowserRouter deep-link recovery for installed PWA cold starts and refreshes.

## 4. Platform-Sensitive Flow Verification

- [ ] 4.1 Verify `/auth/callback` restores Supabase session correctly in mobile browser and installed PWA mode.
- [ ] 4.2 Verify public `/demo/record` and `/demo/analytics` work without a Supabase session in browser and installed PWA mode.
- [ ] 4.3 Verify `/share/:code` remains read-only and does not expose edit/save/delete actions in PWA mode.
- [ ] 4.4 Verify `/app` file upload can enter the existing OCR confirmation flow from mobile browser/PWA file pickers.
- [ ] 4.5 Verify `/record/:id` PDF and PNG export either completes or shows a readable failure on unsupported mobile/PWA targets.
- [ ] 4.6 Verify share link copy/share falls back to manual copy when clipboard or Web Share APIs are unavailable.

## 5. Tests, Docs, And Release Readiness

- [x] 5.1 Add automated coverage for manifest presence, service worker registration guard and sensitive-request cache exclusion where feasible.
- [x] 5.2 Add a manual validation matrix covering desktop Chromium, desktop Safari, iOS Safari, iOS Home Screen PWA, Android Chrome and Android installed PWA.
- [x] 5.3 Add verification steps that inspect Cache Storage for absence of patient records, authorization codes, Supabase Auth responses, Edge Function responses, LLM responses and OCR responses.
- [x] 5.4 Update product/deployment documentation to state PWA support status and explicitly keep Capacitor/native shells out of this change.
- [x] 5.5 Run `openspec validate --all`, `npm run type-check`, `npm run test -- --run`, `npm run lint` and `npm run build` before implementation is considered complete.
