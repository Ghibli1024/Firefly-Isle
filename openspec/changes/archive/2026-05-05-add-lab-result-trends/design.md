## Context

The current PatientRecord model is treatment-centered: `basicInfo`, optional `initialOnset`, and ordered `treatmentLines`. Product P0 requires repeated blood routine, blood biochemistry, and tumor-marker values to be structured and visible as trends, but there is no existing lab model in `src`, `openspec`, or `supabase`. The first version must support OCR/manual entries entering the same structure, but it must not turn lab trends into diagnosis or treatment advice.

## Goals / Non-Goals

**Goals:**
- Introduce lab results as an independent patient-associated collection.
- Persist lab readings in Supabase with RLS derived from the owning patient row.
- Centralize first-version default reference ranges and trend classification logic.
- Render a `/record/:id` trend table with normal, single abnormal, persistent abnormal elevation, missing date, and missing reference-range states.
- Allow OCR-derived and manual/test data to share the same lab-result shape.

**Non-Goals:**
- No automatic diagnosis, staging, treatment suggestion, or clinical conclusion from lab trends.
- No new heavy charting/Gantt dependency.
- No full manual lab-entry form beyond a reusable data path and test/demo fixtures in this change.
- No OCR model expansion; OCR remains an input source that may provide lab values later.

## Decisions

1. Store lab readings as a first-class `lab_results` table rather than embedding them in `treatment_lines`.
   - Rationale: lab indicators are repeated measurements over time and do not belong to one treatment line; embedding would create ambiguous ownership and fragile rendering.
   - Alternative rejected: `treatmentLines[].labs`, because the same lab panel can precede, span, or follow multiple treatment lines.

2. Use a compact reading row model with `item_code`, `item_name`, `category`, `test_date`, `value`, `unit`, `reference_low`, and `reference_high`.
   - Rationale: trend rendering groups by `item_code`, ordering by date; thresholds can be row-specific when the source provides them.
   - Alternative rejected: storing whole lab reports as unstructured JSON only, because it blocks RLS-friendly querying and stable trend tests.

3. Keep default reference ranges in one TypeScript module and only fall back when a reading lacks explicit range values.
   - Rationale: the UI and trend logic must share one truth source; duplicated hardcoded thresholds are bad taste and future drift.
   - Alternative rejected: inline UI thresholds, because that would hide medical assumptions inside presentation code.

4. Define persistent abnormal elevation as two or more dated readings for the same item where the latest consecutive run is above the upper reference range.
   - Rationale: this is testable, conservative, and matches the first-version product language without creating a diagnosis.
   - Alternative rejected: slope/regression analysis, because first-version data is sparse and noisy.

5. Load lab results beside the existing record detail path and pass them into a dedicated trend table component.
   - Rationale: the formal record page remains the single inspection surface while export and treatment rendering stay unchanged.
   - Alternative rejected: a separate lab route, because P0 asks `/record/:id` display and would fragment the clinical overview.

## Risks / Trade-offs

- [Risk] Reference ranges vary by lab, age, sex, and assay -> Mitigation: row-provided ranges override defaults; missing ranges render as "需补充参考范围" rather than abnormal.
- [Risk] Missing or invalid dates can distort trends -> Mitigation: undated readings are displayed but excluded from persistent-elevation classification.
- [Risk] Numeric parsing from OCR can be imperfect -> Mitigation: first-version logic only consumes structured readings after extraction/manual confirmation and never diagnoses.
- [Risk] RLS policy can accidentally expose child rows -> Mitigation: every `lab_results` policy checks ownership through `patients.user_id = auth.uid()`.

## Migration Plan

Add a new idempotent migration for `public.lab_results`, indexes on `patient_id` and `(patient_id, item_code, test_date)`, and select/insert/update/delete policies tied to owning patients. Rollback is dropping `lab_results`; existing patients and treatment lines remain untouched.

## Open Questions

- Which exact production reference-range table should replace the first-version defaults once clinical validation starts?
