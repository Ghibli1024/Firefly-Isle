## Why

Current records capture diagnosis and treatment lines, but repeated blood counts, biochemistry values, and tumor markers have no independent structure. Clinicians need a first-version trend view that keeps lab indicators separate from treatment history while making persistent abnormal elevation visible without producing diagnostic conclusions.

## What Changes

- Add an independent lab-result data model for repeated blood routine, blood biochemistry, and tumor-marker readings.
- Add centralized lab reference-range defaults so thresholds are not duplicated across UI and persistence code.
- Persist lab results through a Supabase table protected by RLS and associated with the owning patient record.
- Display a `/record/:id` lab trend table that handles normal values, single abnormal values, persistent abnormal elevation, missing dates, and missing reference ranges.
- Let OCR-derived and manual/test-entered lab values flow into the same lab-result structure.

## Capabilities

### New Capabilities
- `lab-result-trends`: Covers independent lab-result storage, reference-range handling, abnormal trend classification, `/record/:id` trend rendering, and RLS isolation.

### Modified Capabilities
- `patient-record`: PatientRecord SHALL support an optional independent lab-results collection without embedding lab metrics inside treatmentLines.
- `supabase-schema`: Supabase schema SHALL add lab-result persistence and RLS policies tied to patient ownership.

## Impact

- Affects `src/types/patient.ts`, record loading/persistence, record-page rendering, lab trend utilities, and focused component tests.
- Adds a Supabase migration for `lab_results` plus schema/RLS tests or contract tests.
- Updates OpenSpec baseline specs and affected `CLAUDE.md` maps after implementation.
