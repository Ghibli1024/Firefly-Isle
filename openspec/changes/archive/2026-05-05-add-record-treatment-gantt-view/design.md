## Context

`/record/:id` currently loads a `PatientRecord`, passes it to `RecordDossier`, and keeps PDF/PNG export bound to the dossier DOM ref. The treatment line data already has `lineNumber`, `startDate`, `endDate`, and `regimen`, so the Gantt view should be a projection of existing data, not a new domain model.

## Goals / Non-Goals

**Goals:**
- Add a lightweight Gantt view only on `/record/:id`.
- Normalize treatment-line display data in the timeline module.
- Keep route orchestration responsible for loading, export state, and view selection only.
- Keep PDF/PNG export behavior stable for the dossier view.

**Non-Goals:**
- No new treatment-line persistence fields.
- No drag/drop scheduling or editable Gantt bars.
- No Gantt view inside `/app`.
- No heavy charting or Gantt dependency.

## Decisions

1. Use a small `TreatmentGanttView` component under `src/components/timeline/`.
   - Rationale: The view consumes only `PatientRecord` and locale, matching existing `TimelineTable` boundaries.
   - Alternative rejected: placing Gantt rendering in `record-page.tsx`; that would make the route own presentation logic.

2. Normalize bars with a pure helper before rendering.
   - Rationale: Date parsing, missing-date classification, ordering, and current-line selection are testable without DOM setup.
   - Alternative rejected: calculating offsets inline in JSX, which would hide edge cases.

3. Render missing-date rows as pending rows.
   - Rationale: Drawing fake bars for incomplete dates creates false clinical certainty.
   - Alternative rejected: using today's date for missing `endDate`; this would misrepresent treatment duration.

4. Keep export pointed at the dossier DOM.
   - Rationale: Existing formal export behavior is stable and should not silently switch to the alternate Gantt view.
   - Alternative rejected: exporting whichever tab is active, because that changes the meaning of existing PDF/PNG actions.

## Risks / Trade-offs

- Missing or partial dates can make the chart look sparse -> show explicit pending labels and keep regimen/line number visible.
- Long durations can compress short bars -> use month-based proportional widths with a minimum visual width.
- View toggle can confuse export expectations -> keep export controls inside dossier and assert export wiring in route tests.
