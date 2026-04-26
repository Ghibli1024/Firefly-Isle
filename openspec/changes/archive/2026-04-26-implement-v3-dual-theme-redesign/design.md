## Context

The accepted V3 design source lives under `docs/design/Image-2/V3/`. It defines Firefly-Isle as a design-led clinical archive console, not a generic SaaS dashboard. Its key principle is:

```text
same skeleton, different material

dark  = black clinical control room
light = white forensic archive document
```

Runtime code currently violates that principle in three visible ways:

- `src/index.css` globally forces `border-radius: 0 !important`, which erases the V3 8px component hierarchy.
- `src/lib/theme/tokens.ts` still makes the light primary action black, while V3 requires orange as the single action color across both themes.
- Page and feature components still contain many dark/light structural branches, including duplicated extraction actions in `/app` light mode.
- The latest accepted shell reference uses a default-expanded left sidebar whose right-edge capsule handle can collapse, hide, drag-resize, and collapse labels at a narrow threshold; a fixed 72px rail is now only the compact end state.

## Goals / Non-Goals

**Goals:**

- Implement V3 as a coherent dual-theme visual system with strong visual impact.
- Make dark and light structurally isomorphic across shell, workspace, record, login, and privacy surfaces.
- Preserve material difference: dark feels like a black clinical control room; light feels like a white forensic archive document.
- Remove accidental clutter, especially duplicated primary extraction actions and discarded V3 parameter blocks.
- Move visual decisions into tokens, CSS variables, and shared system components wherever possible.

**Non-Goals:**

- Do not change routes, auth, Supabase calls, Edge Functions, extraction behavior, `PatientRecord`, inline editing semantics, or PDF/PNG export behavior.
- Do not introduce a new third theme or neutralize the current visual drama.
- Do not rewrite the app into a generic dashboard or conservative enterprise SaaS shell.
- Do not create new domain logic to support the redesign.

## Design Decisions

### 1. V3 `DESIGN.md` becomes the active visual contract

- **Decision:** Treat `docs/design/Image-2/V3/DESIGN.md` as the visual system source. `docs/products/design-system.md` should point to V3 rather than older `docs/design/dark/*` and `docs/design/light/*` folders.
- **Rationale:** Older design sources preserve history, but V3 is the accepted synthesis. Keeping multiple active visual truth sources would recreate theme drift.

### 2. Theme tokens lead, pages consume

- **Decision:** Start from `src/lib/theme/tokens.ts` and `src/index.css`; map V3 colors, spacing, radius and typography intent into runtime variables before touching page composition.
- **Rationale:** Page-level tweaks would hide the real problem. The product needs one action color, one health color, one geometry language, and one shell rhythm.

### 3. Default-expanded resizable sidebar replaces fixed rails

- **Decision:** `/app` and `/record/:id` should share one left navigation shell that defaults to a compact icon-only 148px sidebar. Clicking the right-edge capsule cycles full, icon-only, and hidden states; dragging the same capsule continuously resizes from 296px down through 148px and 72px, then fully hides once the pointer crosses the hidden-edge width. When hidden, the left-edge affordance supports both click-to-open and gradual swipe-right reveal.
- **Rationale:** The accepted sidebar behavior is a responsive shell, not a static rail. The 72px state is the narrow end of the same component, so page content and topbar must follow one CSS sidebar offset instead of hard-coded branches.

### 4. Workspace removes duplicate and discarded actions

- **Decision:** `/app` has exactly one primary extraction action near the input and secondary PDF/PNG actions beside it. Remove the light-mode duplicate extraction row, voice card, and “current parameters” block from the primary composition.
- **Rationale:** V3 intentionally puts the treatment timeline immediately after input. The repeated extraction button and parameter panel are accidental complexity.

### 5. Record page stays a vertical dossier

- **Decision:** `/record/:id` should preserve V3’s long-scroll clinical dossier rhythm: top summary, vertical treatment timeline, right-side clinical evidence cards, bottom audit/verification band.
- **Rationale:** Compressing record details into a single dashboard view destroys the product’s strongest visual idea: reading a structured clinical history as an audited archive.

### 6. Typography is distinctive but bounded

- **Decision:** Use one display/editorial face, one UI face, and one mono metadata face. Do not keep arbitrary per-page type personalities if they break system coherence.
- **Rationale:** V3 needs drama, but uncontrolled type choices create noise. The system should feel designed, not assembled from separate references.

## Implementation Shape

The implementation should proceed from low-level contracts to page composition:

```text
tokens + CSS vars
  ↓
system shell + resizable sidebar + surfaces
  ↓
workspace feature blocks
  ↓
record / login / privacy compositions
  ↓
browser comparison against V3 screenshots
```

Primary code entrypoints:

- `src/lib/theme/tokens.ts`
- `src/index.css`
- `src/components/system/surfaces.tsx`
- `src/components/system/sidebar-nav.tsx`
- `src/components/system/topbar.tsx`
- `src/components/system/masthead.tsx`
- `src/components/workspace/extraction-composer.tsx`
- `src/routes/workspace-page.tsx`
- `src/routes/record-page.tsx`
- `src/components/login-page-view.tsx`
- `src/routes/privacy-page.tsx`

## Risks / Trade-offs

- **Risk: over-normalizing the UI into calm SaaS.** Mitigation: compare against V3 screenshots and preserve orange focus, dense clinical surfaces, bold headings and dossier rhythm.
- **Risk: preserving too much old theme divergence.** Mitigation: reject layout branches where they change skeleton instead of material.
- **Risk: breaking export capture by restyling the report surface.** Mitigation: keep `ReportPreviewFrame` ref wiring and export functions unchanged; verify PDF/PNG still trigger.
- **Risk: mobile regressions from desktop-first screenshots.** Mitigation: use the V3 skeleton responsively, then browser-check mobile widths for text fit and non-overlap.
- **Risk: dirty worktree confusion.** Mitigation: keep this change’s implementation diff scoped to frontend visual files and docs; do not restore or revert unrelated `docs/design` migration traces.

## Mismatch Review Requirement

Before finalizing implementation, produce a short mismatch list comparing runtime screenshots with V3:

- `/login` dark and light vs `01-login-dark.png` / `02-login-light.png`
- `/app` dark vs `03-app-dark-new.png`, `/app` light vs `04-app-light.png`
- `/record/demo` dark and light vs `05-record-dark.png` / `06-record-light.png`
- component states vs `07-component-strip.png`

The mismatch list should separate acceptable differences from defects to fix before completion.
