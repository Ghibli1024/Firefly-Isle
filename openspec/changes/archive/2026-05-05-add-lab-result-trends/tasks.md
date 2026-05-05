## 1. Test Contracts

- [x] 1.1 Add lab trend utility tests for normal values, single abnormal high value, consecutive abnormal high values, missing dates, and missing reference ranges.
- [x] 1.2 Add record-page rendering tests for lab trend table visibility and no-data behavior.
- [x] 1.3 Add Supabase migration/RLS contract tests for lab_results fields, ownership checks, and unauthorized access failure.

## 2. Data Model And Persistence

- [x] 2.1 Add PatientRecord lab-result types and keep lab readings independent from treatmentLines.
- [x] 2.2 Add centralized lab reference ranges and trend classification utilities.
- [x] 2.3 Add a lab_results Supabase migration with indexes, cascade delete, and RLS policies.
- [x] 2.4 Extend record loading/persistence helpers so OCR/manual lab readings can use the same structure.

## 3. Record UI

- [x] 3.1 Add a dedicated lab trend table component for `/record/:id`.
- [x] 3.2 Render lab trends on real and demo record pages without degrading existing dossier, Gantt, or export behavior.
- [x] 3.3 Ensure persistent abnormal elevation is visibly highlighted and non-diagnostic.

## 4. Documentation And Verification

- [x] 4.1 Update affected L3 headers and `CLAUDE.md` maps for new lab modules, types, migration, specs, and record-page responsibilities.
- [x] 4.2 Run focused lab utility, record-page, and migration/RLS tests.
- [x] 4.3 Run `npm run test`, `npm run lint`, `npm run build`, archive the change, and validate all specs.
