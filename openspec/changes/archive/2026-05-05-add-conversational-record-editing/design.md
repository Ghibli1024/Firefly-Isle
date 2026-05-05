## Context

`/app` currently has three write paths: first-time extraction through `extractPatientRecord(input)`, follow-up completion through `extractPatientRecord(answer, previousRecord)`, and direct inline edits through `PatientFieldTarget`. The main input has no way to distinguish "create/extract a record" from "modify the existing record", so a free-text correction can accidentally start a new extraction and replace the current state.

## Goals / Non-Goals

**Goals:**
- Treat main-input commands as edit instructions when a saved/active PatientRecord already exists.
- Ask the LLM for field-level edit intents, not a replacement PatientRecord.
- Validate every edit intent against the known PatientRecord schema and line numbers.
- Merge only mentioned fields; omitted fields remain unchanged.
- Support explicit clearing by writing `undefined` through the existing field normalization/persistence path.
- Expose localized success/failure feedback and retry failed edit commands.

**Non-Goals:**
- No multi-record editing or cross-patient commands.
- No free-form database mutation language.
- No lab-result conversational editing in this change.
- No replacement of existing inline cell editing.

## Decisions

1. Add a dedicated edit-intent parser instead of reusing full-record extraction.
   - Rationale: full extraction is allowed to omit unknown fields; editing needs explicit target/value semantics so omission means "do nothing".
   - Alternative rejected: calling `extractPatientRecord(command, currentRecord)` directly, because merge semantics could still interpret sparse output incorrectly.

2. Reuse `PatientFieldTarget` for patch targets.
   - Rationale: inline editing already encodes the safe writable field surface; natural-language edits should hit the same target vocabulary.
   - Alternative rejected: new ad hoc path strings, because they would duplicate edit boundaries and invite drift.

3. Represent clearing as an explicit operation with `value: ""`.
   - Rationale: existing `applyFieldUpdate` already maps empty strings to `undefined` and tests cover this behavior.
   - Alternative rejected: special sentinel values, because they create another branch for the same domain operation.

4. Keep retry state separate from initial/follow-up retry.
   - Rationale: failed edit commands must retry against the existing record, not rerun initial extraction.
   - Alternative rejected: reusing `retryMode: "initial"`, because it would create a second record path.

## Risks / Trade-offs

- [Risk] The LLM targets an invalid line number -> Mitigation: validate treatmentLine targets against existing lines and return a recoverable error.
- [Risk] Ambiguous user command maps to too many fields -> Mitigation: require explicit patch intents; invalid/empty patch arrays fail without mutating the record.
- [Risk] Edit command is entered before any record exists -> Mitigation: preserve existing initial extraction path when there is no active record.
- [Risk] Clearing a field unintentionally hides clinical data -> Mitigation: clearing must be explicit in the parsed edit intent and remains reversible through retry/manual edits.

## Migration Plan

No database migration is required. Rollback is removing the edit-intent parser and routing main input back to initial extraction when a record exists; existing PatientRecord persistence remains unchanged.

## Open Questions

- Should future versions support conversational lab-result edits after the lab manual-entry UI exists?
