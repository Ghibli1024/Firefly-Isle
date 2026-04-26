## 1. Contract and baseline

- [x] 1.1 Confirm V3 design source files exist and prioritize `03-app-dark-new.png` over `03-app-dark.png`
- [x] 1.2 Audit current token/CSS conflicts against V3, including global radius reset and light primary action color
- [x] 1.3 Update `docs/products/design-system.md` so V3 `DESIGN.md` is the active visual contract

## 2. Token and CSS system

- [x] 2.1 Map V3 colors into `src/lib/theme/tokens.ts` for dark and light without adding page-level hex values
- [x] 2.2 Replace global radius flattening with V3-compatible radius rules and CSS variables
- [x] 2.3 Align typography variables and utility classes to one display/editorial face, one UI face, and one mono metadata face
- [x] 2.4 Ensure green is reserved for health/completion and orange is the only primary action/focus/risk color

## 3. Shared shell and surfaces

- [x] 3.1 Refactor system surfaces so dark/light share border, radius, panel, action and status semantics
- [x] 3.2 Convert `/app` and `/record/:id` shell navigation to a default-expanded V3 sidebar with shared variable geometry
- [x] 3.5 Add sidebar hide, drag-resize, and compact icon-only threshold behavior
- [x] 3.6 Move sidebar collapse/hide control from the brand row into the right-edge capsule handle
- [x] 3.3 Align top bar / masthead into one shared top status role without changing routes or auth
- [x] 3.4 Remove theme branches that change skeleton rather than material language

## 4. Page composition

- [x] 4.1 Refactor `/app` composition to one input panel, one primary extraction action, secondary PDF/PNG actions, and immediate timeline content
- [x] 4.2 Remove duplicated light-mode extraction action, voice card, and discarded current-parameters block
- [x] 4.3 Refactor `/record/demo` into the V3 vertical dossier rhythm with shared dark/light skeleton
- [x] 4.4 Align `/login` with the V3 brand/auth panel composition while preserving Supabase auth behavior
- [x] 4.5 Align `/privacy` with the V3 token and shell language without changing policy copy source

## 5. Documentation and contracts

- [x] 5.1 Update L3 headers for files whose responsibilities change
- [x] 5.2 Update affected `CLAUDE.md` files after any file responsibility or module boundary changes
- [x] 5.3 Keep OpenSpec scope honest: no route, schema, auth, extraction, persistence, or export behavior changes

## 6. Verification

- [x] 6.1 Run `npm run lint`
- [x] 6.2 Run `npm run type-check`
- [x] 6.3 Run `npm run test`
- [x] 6.4 Run `npm run build`
- [x] 6.5 Browser-check `/login`, `/app`, `/record/demo`, and `/privacy` in dark and light at desktop width
- [x] 6.6 Browser-check the same routes at mobile width for text fit, non-overlap and usable navigation
- [x] 6.7 Compare runtime screenshots against V3 images and list mismatches before finalizing
