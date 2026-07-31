## Why

The current V3 pages are visually coherent, but several shared motion utilities feel slower and more playful than the privacy-sensitive clinical workflow requires. Route reveal and stagger animations also compete on the same DOM nodes, so the browser silently discards one of the intended effects while retaining unnecessary blur and `will-change` cost.

## What Changes

- Keep the existing V3 visual system, page layout, content hierarchy, theme tokens, and component geometry unchanged.
- Make shared route and stagger entrances shorter, smaller, and limited to `transform` plus `opacity`; prevent both entrance animations from being attached to the same element.
- Replace the selected-tab bounce keyframe with quiet border and color continuity suitable for frequent mouse and keyboard navigation.
- Refine control press feedback so active controls compress slightly, mouse-only hover does not leak onto touch devices, disabled controls remain still, and nested icons do not move twice.
- Make icon state swaps subtle instead of scaling icons almost from zero.
- Preserve complete static content and remove positional motion when `prefers-reduced-motion: reduce` is active.
- Leave the `/login` GSAP ScrollTrigger story, WebGL liquid background, drag/resize geometry, product data behavior, and V4 evaluation themes outside this change.

## Capabilities

### New Capabilities
- `product-motion-feedback`: Defines the production V3 motion budget, composition rules, interaction feedback, performance boundary, and reduced-motion behavior for shared product pages and controls.

### Modified Capabilities

None.

## Impact

- Shared motion CSS: `src/styles/transitions-dev.css`.
- Shared button primitive: `src/components/ui/button.tsx`.
- Route entrance composition: workspace, record, shared-record, and lab analytics route roots.
- Regression coverage: existing workspace and record route tests plus focused shared-motion contract coverage.
- Documentation: this OpenSpec change and the active-change ownership map.
- Dependencies and public APIs: no new runtime dependency and no data/API contract change.
