# V3 verification

## Browser matrix

- Desktop viewport: 1342 x 933
- Mobile viewport: 390 x 844
- Routes checked: `/login`, `/app`, `/record/demo`, `/privacy`
- Themes checked: dark and light
- Evidence directory: `output/v3-verification/`

All 16 route/theme/viewport combinations rendered with the requested theme, reached the expected route, exposed the expected core page text, and had no document-level horizontal overflow after the fixes below.

## Fixed during verification

- `/app` desktop initially allowed the treatment timeline row to widen the document. The timeline pills and connectors were tightened so the document width stays equal to the viewport.
- `/login` desktop initially compressed the capability cards into four narrow columns and forced the status copy into an awkward vertical wrap. The capability grid now holds two columns at this shell width, and the status band uses a flexible row.

## Runtime screenshot comparison

### `/login`

Reference files: `01-login-dark.png`, `02-login-light.png`.

- Acceptable difference: the `CLINICAL ARCHIVE CONSOLE v3.0` badge and light-theme right technical block are absent by explicit user review.
- Acceptable difference: the production mark uses the selected island-lighthouse firefly asset and remains independent from the title.
- Fixed defect: capability cards no longer collapse into four thin columns at desktop width.

### `/app`

Reference files: `03-app-dark-new.png`, `04-app-light.png`.

- Acceptable difference: the report title is `病历预览`, matching the latest user review, rather than the original V3 `治疗时间线表格`.
- Acceptable difference: the production sidebar uses the current resizable brand/sidebar contract and selected logo.
- Fixed defect: the timeline row no longer creates page-level horizontal overflow.

### `/record/demo`

Reference files: `05-record-dark.png`, `06-record-light.png`.

- Acceptable difference: the production shell keeps the shared resizable sidebar and top status bar from the implemented app shell.
- The vertical dossier rhythm, summary grid, treatment cards, clinical side panels, and audit band remain aligned with the V3 intent.

### Component strip

Reference file: `07-component-strip.png`.

- The implemented system keeps the V3 material language: 8px component radius, 1px structural borders, orange action/risk/focus color, green health/completion status, and shared dark/light surface semantics.
