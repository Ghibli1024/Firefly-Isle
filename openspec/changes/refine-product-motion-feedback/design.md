## Context

Firefly-Isle already centralizes most production motion in `src/styles/transitions-dev.css`, but the shared utilities grew from several independent experiments. The result is inconsistent timing, blur-heavy entrances, long-lived compositor hints, and a selected-tab bounce that conflicts with a calm clinical product. Several route roots also combine `t-route-reveal` and `t-stagger`; because both set the `animation` shorthand, only the later declaration actually runs.

The workspace is intentionally dirty and contains completed `/login` scroll-story and WebGL lifecycle work plus an isolated V4 visual evaluation. This change must preserve those edits and keep V3 as the production visual source.

## Goals / Non-Goals

**Goals:**

- Make production page entrances and control feedback fast, quiet, and predictable.
- Give each DOM node one entrance-animation owner so CSS shorthand declarations cannot overwrite each other.
- Limit high-frequency motion to compositor-friendly `transform` and `opacity`.
- Preserve accessible static content and remove positional motion under reduced-motion preferences.
- Add regression contracts that prevent the old bounce, `transition-all`, and route/stagger collision from returning.

**Non-Goals:**

- Do not change V3 colors, typography, radii, layout, information architecture, or theme ownership.
- Do not select or migrate any V4 visual direction.
- Do not redesign the `/login` scroll story, GSAP ScrollTrigger geometry, WebGL liquid effect, timeline drawing, Gantt drawing, drag/resize behavior, or product data flows.
- Do not add a motion library or component-level animation framework.

## Decisions

### 1. Keep the shared CSS utility layer as the only production motion owner

The existing `t-*` utilities remain the contract. Components keep declarative semantic classes instead of introducing local keyframes or JavaScript timing. This is the smallest compatible change and keeps reduced-motion handling centralized.

Alternative considered: introduce Motion/Framer Motion. Rejected because the affected interactions need only CSS transitions, and a new runtime dependency would increase bundle and lifecycle complexity without solving a real limitation.

### 2. Use a short two-level entrance system

Route roots use a 340 ms, 10 px ease-out reveal. Staggered children use a 320 ms, 8 px ease-out reveal with a 50 ms step. Both animate only `transform` and `opacity`; blur and persistent `will-change` are removed.

A single element MUST NOT own both `t-route-reveal` and `t-stagger`. Route roots own the page reveal; actual child groups may opt into stagger separately. This eliminates CSS-shorthand competition instead of attempting to merge two keyframes into another special case.

### 3. Replace tab bounce with selection continuity

The selected tab no longer runs a keyframe or scale overshoot. The existing text-tab geometry stays unchanged while border and text color settle in 160 ms with ease-out. Mouse and keyboard activation therefore share the same quiet state transition without introducing a moving thumb or a new layout layer.

Alternative considered: keep a smaller selected-button scale animation or add a moving thumb. Rejected because repeated scale adds no state information, while a new thumb would change the current text-tab geometry rather than merely refine motion.

### 4. Separate hover affordance from press feedback

Controls use a 140 ms transition and compress to `scale(0.97)` while active. Optional one-pixel hover lift is allowed only inside `@media (hover: hover) and (pointer: fine)`. Nested icons do not receive their own hover translation, so the control moves as one object. Disabled and `aria-disabled` controls remain still.

The shared `Button` primitive explicitly lists transition properties and uses the same press scale instead of `transition-all` and positional translation.

### 5. Treat icon swap as continuity, not materialization

State icons cross-fade from `scale(0.94)` to `scale(1)` over 170 ms with ease-out. Filter blur and long-lived `will-change` are removed. Existing loading state, text, and `animate-spin` ownership stay unchanged.

### 6. Preserve dedicated storytelling and drawing motion

The login scroll story and data-drawing effects are not generic interface feedback. Their geometry, scrub timing, cleanup, and reduced-motion branches remain untouched. Browser acceptance must confirm the shared utility changes do not regress `/login` lifecycle behavior.

## Risks / Trade-offs

- [Entrance rhythm becomes less theatrical] → This is intentional for a clinical workflow; retain hierarchy through small stagger offsets rather than blur and long travel.
- [Removing `will-change` could delay first-frame promotion on low-end devices] → The affected transforms are short and simple; avoiding dozens of persistent layers is the safer default. Browser checks cover visible jank.
- [Shared Button press scale could conflict with specialized transforms] → Keep the press rule excluded for `aria-haspopup` controls and verify theme/locale toggles plus existing `t-control-press` buttons.
- [Dirty-worktree edits could be overwritten] → Patch only the audited lines, never reset or clean, and inspect both staged and unstaged diffs after implementation.

## Migration Plan

1. Add the product-motion capability and focused regression contracts.
2. Update shared motion tokens and utilities without touching design tokens.
3. Remove route/stagger class collisions from the four audited production routes.
4. Update the shared Button primitive and existing motion assertions.
5. Run targeted and full static gates, strict OpenSpec validation, then browser acceptance across login, record, analytics, themes, pointer/keyboard input, mobile width, and reduced motion.
6. Roll back by reverting only this change’s focused CSS, route-class, button, test, and OpenSpec edits; no data migration is required.
