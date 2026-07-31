## Context

The current record page is functionally complete but visually over-specified. The page is assembled from independently bordered modules: Demo banner, segmented switch, share panel, dossier shell, metric card grid, lab panel, AI panel, timeline cards, notes card, verification cards, and a console-like footer. Because every region announces itself with a container, icon, color, or label, the reader cannot quickly tell which information is the actual medical record and which information is product chrome.

The repository also contains an isolated V4 design preview. That preview explicitly forbids production migration until a direction is selected. This change is the owner's production decision for the record reading experience only: adopt the calm hierarchy principles while retaining V3 tokens and all existing route/data behavior.

## Goals / Non-Goals

**Goals:**

- Make the patient's facts, evidence, treatment timeline, and notes the first reading path.
- Reduce decorative borders, cards, icons, English labels, and equal-weight surfaces.
- Keep all editing, export, sharing, table/Gantt, lab, and AI-analysis behavior intact.
- Preserve dark/light themes, responsive behavior, focus visibility, and reduced-motion behavior.
- Apply the same shared record hierarchy to Demo and owned records, with only truthful capability differences.

**Non-Goals:**

- Do not migrate global production tokens to V4 or change `/design-preview`.
- Do not redesign the login story, workspace, analytics information architecture, sidebar, or mobile shell.
- Do not change Supabase schema, authentication, sharing security, export generation, or AI analysis semantics.
- Do not hide real errors, save state, authorization state, abnormal lab states, or the non-diagnostic disclaimer.

## Decisions

### 1. Use one flat document surface instead of a page-sized card

`RecordDossier` remains the record content owner but loses its outer rounded border, background card, and shadow. The surrounding route shell already provides the page background. Sections use spacing and single separators; inputs and truly interactive controls may retain borders.

**Why:** nested surfaces create false structure. A record is already one document, so the outer shell should not pretend it is one dashboard card among many.

### 2. Express patient facts as a definition grid

Summary metrics remain the same data and editable targets, but render as a border-top definition grid with subtle row/column separators and no enclosing card. Large values are reduced to reading-scale typography; multi-line evidence remains legible.

**Why:** the facts are metadata, not KPI tiles. KPI styling overstates ordinary demographic fields and makes missing values look like metrics.

### 3. Make views and edit state quiet but explicit

The dossier/table/Gantt switch becomes a text tablist with a bottom border and active underline. Editing becomes a small textual action with save state beside it. Existing `aria-pressed`, labels, event handlers, and motion hooks remain.

**Why:** these are frequent navigation controls. They need continuity and focus, not a floating segmented-control container.

### 4. Treat sharing as secondary disclosure

`RecordSharePanel` becomes a `<details>` section. Demo uses it collapsed by default; owned records use it expanded by default. Creation, generated-link, copy, open, list, expiry, revoke, loading, disabled, and error states stay in the DOM and preserve existing callbacks.

**Why:** sharing is important but episodic. Keeping it above the record as a permanently expanded card makes operational chrome outrank the medical content.

### 5. Remove claims that are not backed by a real verification source

The top-bar `系统状态：就绪`, the record-level AI verification/data completeness cards, `AI VERIFIED`, fixed timestamps, version footer, and `LAST_UPDATE` label are removed. The real clinical AI analysis panel remains, with its non-diagnostic disclaimer and truthful Demo/live distinction.

**Why:** decorative status is not evidence. Unsupported certification language erodes trust in a privacy-sensitive product.

### 6. Keep necessary controls bordered; make secondary actions textual

Export controls keep compact outlines because they initiate file creation. Back navigation, edit, disclosure, copy/view/revoke, and Demo login use restrained text or low-emphasis outlines. Decorative icons are removed unless they materially disambiguate an action.

**Why:** hierarchy should follow consequence and frequency. Not every action deserves a button tile.

## Risks / Trade-offs

- Flattening containers can reduce scanning if spacing is too weak. Mitigation: consistent section rhythm, title hierarchy, and one-pixel separators.
- `<details>` changes the initial visibility of sharing. Mitigation: owned records stay expanded by default; Demo stays collapsed because its controls are intentionally disabled previews.
- Shared Demo banner styling also affects Demo analytics. This is intentional: Demo disclosure semantics should be consistent across public Demo routes.
- Existing static tests may assert obsolete decoration. Update them to assert preserved behavior and explicit absence of decorative claims.

## Verification

- Strict OpenSpec validation.
- Targeted record/system tests plus full test, app/functions type checks, lint, build, and `git diff --check`.
- Browser verification for `/demo/record` in light/dark desktop and approximately 390 px mobile widths.
- Verify view switching, edit toggle/save feedback, Demo share disclosure, export controls, origin-story/contact/background-music controls, focus visibility, overflow, and console errors.
