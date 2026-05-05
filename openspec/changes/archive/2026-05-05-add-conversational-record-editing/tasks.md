## 1. Test Contracts

- [x] 1.1 Add edit-intent parsing tests for basicInfo, initialOnset, treatmentLine regimen/startDate/endDate, clear-field, invalid target, and omitted-field preservation.
- [x] 1.2 Add workspace tests proving existing-record main input runs edit mode, shows success feedback, and retries failed edits without creating a new record.
- [x] 1.3 Add prompt/schema tests proving edit commands request field-level intents rather than full PatientRecord replacement.

## 2. Edit Intent Boundary

- [x] 2.1 Add a dedicated conversational edit prompt and parser returning validated PatientFieldTarget patches.
- [x] 2.2 Add merge helpers that reuse the existing field-normalization semantics and preserve unmentioned fields.
- [x] 2.3 Ensure invalid/empty edit intents fail without mutating PatientRecord.

## 3. Workspace Integration

- [x] 3.1 Route main-input submission to edit mode when an active PatientRecord exists.
- [x] 3.2 Persist successful edits through the existing patient-record storage path and show visible feedback.
- [x] 3.3 Add retry state for failed conversational edits that reruns against the existing record.

## 4. Documentation And Verification

- [x] 4.1 Update affected L3 headers and `CLAUDE.md` maps for conversational editing modules, workspace behavior, specs, and tests.
- [x] 4.2 Run focused edit-intent, extraction prompt, and workspace tests.
- [x] 4.3 Run `npm run test`, `npm run lint`, `npm run build`, archive the change, and validate all specs.
