## 1. Proposal and design

- [x] 1.1 Create OpenSpec proposal for the intro page + unified auth overlay login model
- [x] 1.2 Capture visual decisions from the `ui-design` exploration into `design.md`
- [x] 1.3 Add delta specs for app-shell and theme-system behavior

## 2. Implementation planning

- [x] 2.1 Decide desktop default state: intro only until the `登录` CTA opens the unified overlay
- [x] 2.2 Decide narrow-screen behavior: intro page first, auth card opens as CTA-driven overlay
- [x] 2.3 Identify reusable component boundary for the shared auth card / overlay card
- [x] 2.4 Identify whether current night-island asset is sufficient or needs a cleaned production asset

## 3. Implementation

- [x] 3.1 Refactor `/login` into intro page region and unified auth overlay without changing route path
- [x] 3.2 Replace four feature cards with a clean full-screen dual-theme coastal scene without workflow waypoints
- [x] 3.3 Add CTA-driven overlay state and remove desktop drawer / left-page give-space special casing
- [x] 3.4 Reuse the same login card structure for desktop and narrow-screen overlays
- [x] 3.5 Preserve existing email login, sign-up, anonymous session, theme toggle, locale toggle, feedback, and privacy behavior
- [x] 3.6 Align the shared identity access card with the approved lighthouse-path reference structure
- [x] 3.7 Add the light-theme flower-path lighthouse hero for the account login card

## 4. Verification

- [x] 4.1 Add component tests for full-screen intro background structure, no workflow waypoints, no default overlay mount, and unified overlay source contract
- [x] 4.2 Verify desktop dark `/login` default intro-only state and CTA-opened unified overlay in browser
- [x] 4.3 Verify narrow `/login` shows intro first and opens the reusable login card without horizontal overflow
- [x] 4.4 Run `npm run test`
- [x] 4.5 Run `npm run lint`
- [x] 4.6 Run `npm run build`
