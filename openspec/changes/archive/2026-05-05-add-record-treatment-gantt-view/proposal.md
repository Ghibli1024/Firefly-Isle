## Why

`/record/:id` already renders a formal dossier, but treatment duration and line changes are still hidden inside text-heavy sections. A lightweight Gantt projection turns the existing `treatmentLines` data into a scan-friendly view without changing the core PatientRecord model.

## What Changes

- Add a formal record page view toggle between the current dossier view and a treatment-line Gantt view.
- Render each `TreatmentLine` as a horizontal bar when both `startDate` and `endDate` are available.
- Show a clear "date pending" state for lines with missing dates instead of inventing fake durations.
- Keep PDF/PNG export behavior attached to the formal dossier and prevent demo/empty states from regressing.
- Do not add a new treatment-line data structure and do not introduce a heavy Gantt dependency.

## Capabilities

### New Capabilities
- `record-treatment-gantt`: Treatment-line Gantt projection for `/record/:id`.

### Modified Capabilities
- `export`: Preserve existing `/record/:id` PDF/PNG export behavior while adding a non-exporting alternate view.

## Impact

- Affects `/record/:id` orchestration and timeline components.
- Adds focused rendering and route tests for multiple treatment lines, missing dates, no treatment lines, demo records, and export behavior.
- Updates colocated CLAUDE maps for new timeline members.
