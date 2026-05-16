## 1. OpenSpec And Dependencies

- [x] 1.1 Create proposal, design, specs and task ledger for Capacitor mobile shell.
- [x] 1.2 Add pinned Capacitor core, CLI, iOS and Android packages.
- [x] 1.3 Add a stable Capacitor config with app id, app name and `dist` webDir.

## 2. Native Platform Projects

- [x] 2.1 Generate or add the iOS Capacitor project without signing secrets.
- [x] 2.2 Generate or add the Android Capacitor project without keystores or local build artifacts.
- [x] 2.3 Add mobile scripts for build, sync and opening iOS/Android projects.
- [x] 2.4 Ensure `.gitignore` excludes native derived data, signing files and local platform build outputs.

## 3. Documentation And Architecture Maps

- [x] 3.1 Add operations documentation for local mobile build/sync/open/verification.
- [x] 3.2 Update CLAUDE architecture maps for root, OpenSpec, iOS and Android ownership.
- [x] 3.3 Update product docs to mark Capacitor shell as local engineering baseline, not store release.

## 4. Verification

- [x] 4.1 Add automated config coverage for Capacitor app id, webDir and package scripts.
- [x] 4.2 Run `npm run build` before native sync.
- [x] 4.3 Run Capacitor sync for iOS and Android.
- [x] 4.4 Run available native project checks if local Xcode/Android tooling is present; document skipped checks with concrete blocker.
- [x] 4.5 Run `openspec validate --all`, `npm run type-check`, `npm run test -- --run`, `npm run lint`, `npm run build` and `git diff --check`.
