## 1. Test Contracts

- [x] 1.1 Add focused timeline Gantt tests for multiple treatment lines, missing `startDate`, missing `endDate`, no treatment lines, and current-line marking.
- [x] 1.2 Add record page tests proving the dossier/Gantt view switch works for demo and persisted records.
- [x] 1.3 Add export regression tests proving PDF/PNG export remains attached to the dossier view and does not regress when the Gantt view exists.

## 2. Timeline Gantt Implementation

- [x] 2.1 Add a pure Gantt normalization helper under `src/components/timeline/` that orders treatment lines, parses date ranges, classifies missing-date rows, and identifies the current line.
- [x] 2.2 Add `TreatmentGanttView` under `src/components/timeline/` consuming `PatientRecord` and locale-aware labels to render duration bars, pending states, and an empty state.
- [x] 2.3 Keep missing dates as pending values such as `日期待补充` / English equivalent and do not draw fake duration bars.

## 3. Record Page Integration

- [x] 3.1 Add `/record/:id` dossier/Gantt segmented view state without changing `/app`.
- [x] 3.2 Render the Gantt view for demo and persisted records while preserving unavailable-record behavior.
- [x] 3.3 Keep export actions and the export ref attached to dossier content.

## 4. Documentation And Verification

- [x] 4.1 Update L3 headers and `src/components/timeline/CLAUDE.md`; update parent maps if files are added or responsibilities change.
- [x] 4.2 Run focused tests for timeline and record page behavior.
- [x] 4.3 Run `npm run test`, `npm run lint`, and `npm run build`.
