## Context

`/app` already presents "导入病历文件" as a sibling input affordance inside `ExtractionComposer`, but the button currently only reports that the feature is unavailable. The existing extraction path is text-first: workspace state holds `extractionInput`, `handleExtract()` calls `extractPatientRecord()`, and the resulting `PatientRecord` flows into the same preview, follow-up, save and edit paths.

Provider check:
- DeepSeek Chat Completion documentation exposes text message `content` in the checked request schema; it is suitable for downstream structured text extraction but not the first OCR provider for image/PDF input.
- Gemini document processing documentation supports PDF/document input through file/inline data, so first-version OCR should use Gemini inside the existing server-side secret boundary.

## Goals / Non-Goals

**Goals:**
- Let users upload medical images and PDFs from `/app`.
- Keep OCR provider keys server-side.
- Let users inspect confirmed OCR text before it enters structured extraction.
- Reuse the existing `extractPatientRecord` and follow-up merge path after confirmation.
- Keep OCR errors recoverable and prevent failed OCR from changing the current `PatientRecord`.

**Non-Goals:**
- No lab-trend model, blood marker parsing, or trend table in this change.
- No user-facing OCR provider settings.
- No persistent uploaded-file storage in the first version.
- No handwritten-record guarantee; first version handles provider-supported readable image/PDF text.

## Decisions

1. Add a dedicated `medical-document-ocr` Edge Function boundary.
   - Rationale: File bytes and provider keys must not pass through public Vite env vars or browser logs.
   - Alternative rejected: calling Gemini directly from the browser, because it would expose the OCR key.

2. Use Gemini document/image input for OCR, not DeepSeek.
   - Rationale: The checked DeepSeek Chat Completion schema is text-only, while Gemini officially supports document/PDF input. DeepSeek can still be used later by the existing text extraction proxy after OCR text is confirmed.
   - Alternative rejected: sending base64 PDF/image blobs to DeepSeek chat as text, because that is not a real OCR contract and would be unreliable.

3. Keep OCR text as an explicit confirmation state.
   - Rationale: OCR can misread clinical details; users need a checkpoint before the text mutates `PatientRecord`.
   - Alternative rejected: auto-running extraction immediately after OCR, because failure or misread text would be harder to recover from.

4. Make confirmation call the existing extraction path.
   - Rationale: The app already has parsing, missing-field follow-up, merge, preview and persistence behavior. OCR is only an input source, not a second patient-record pipeline.
   - Alternative rejected: creating a separate OCR-to-PatientRecord schema, which would duplicate extraction semantics.

## Risks / Trade-offs

- [Risk] Large PDFs exceed request limits -> Mitigation: enforce a small first-version size limit and return a readable recoverable error.
- [Risk] OCR text contains clinical mistakes -> Mitigation: require user confirmation before extraction and keep text editable through the existing input buffer.
- [Risk] OCR provider failure blocks manual use -> Mitigation: leave typed input and retry path untouched.
- [Risk] Edge Function tests cannot depend on local Deno -> Mitigation: keep provider request/response construction in a testable handler module, matching the existing `llm-proxy` pattern.

## Migration Plan

No database migration is required for first-version OCR because uploaded files are not persisted and confirmed text enters the existing PatientRecord path. Rollback is a frontend affordance rollback plus disabling/removing the `medical-document-ocr` function; typed extraction remains unchanged.

## Open Questions

- Which exact Gemini model should be configured for OCR in production: reuse `DEFAULT_GEMINI_MODEL` or add `GEMINI_OCR_MODEL` with fallback?
