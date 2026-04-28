## 1. Proposal and design

- [x] 1.1 Create OpenSpec proposal for the intro page + auth drawer login model
- [x] 1.2 Capture visual decisions from the `ui-design` exploration into `design.md`
- [x] 1.3 Add delta specs for app-shell and theme-system behavior

## 2. Implementation planning

- [ ] 2.1 Decide desktop default state: drawer expanded, drawer collapsed, or responsive default
- [ ] 2.2 Decide mobile behavior: auth card only, or auth card plus intro content below
- [ ] 2.3 Identify reusable component boundary for the mobile-auth-card / desktop-drawer-card
- [ ] 2.4 Identify whether current night-island asset is sufficient or needs a cleaned production asset

## 3. Implementation

- [ ] 3.1 Refactor `/login` into intro page region and auth drawer region without changing route path
- [ ] 3.2 Replace four feature cards with beacon-node capability rail
- [ ] 3.3 Add CTA-driven drawer state and left-page give-space animation
- [ ] 3.4 Reuse the same login card structure for mobile `/login`
- [ ] 3.5 Preserve existing email login, sign-up, anonymous session, theme toggle, locale toggle, feedback, and privacy behavior

## 4. Verification

- [ ] 4.1 Add component tests for intro/drawer structure, capability rail order, and mobile card reuse
- [ ] 4.2 Verify desktop dark `/login` expanded and collapsed states in browser
- [ ] 4.3 Verify mobile `/login` uses the reusable login card without horizontal overflow
- [ ] 4.4 Run `npm run test`
- [ ] 4.5 Run `npm run lint`
- [ ] 4.6 Run `npm run build`
