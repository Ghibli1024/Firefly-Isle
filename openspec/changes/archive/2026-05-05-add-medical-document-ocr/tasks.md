## 1. Test Contracts

- [x] 1.1 Add OCR client tests for image success, PDF success, unsupported type rejection, OCR failure, and empty text handling.
- [x] 1.2 Add Edge Function handler tests for Gemini image/PDF requests, provider error mapping, missing key behavior, and no secret leakage in responses.
- [x] 1.3 Add workspace/composer tests proving upload controls are real, recognized text awaits confirmation, confirmation enters extraction, and failed OCR does not mutate `PatientRecord`.

## 2. OCR Boundary

- [x] 2.1 Add a `medical-document-ocr` Supabase Edge Function handler that validates MIME type/size and calls Gemini with image/PDF inline data.
- [x] 2.2 Add a browser OCR client module that posts selected files to the Edge Function without exposing provider keys.
- [x] 2.3 Add localized OCR error mapping for unsupported files, provider failure, empty text, and request limits.

## 3. Workspace Integration

- [x] 3.1 Replace the import-file placeholder with a real hidden file input and accessible upload button inside `ExtractionComposer`.
- [x] 3.2 Add an OCR confirmation panel that shows recognized text and lets the user confirm or discard it.
- [x] 3.3 Wire confirmed OCR text into the existing initial extraction/merge path while preserving manual input, retry, follow-up, save, and non-pollution semantics.

## 4. Documentation And Specs

- [x] 4.1 Update affected L3 headers and `CLAUDE.md` maps for new OCR client, Edge Function, composer/workspace responsibilities, and OpenSpec specs.
- [x] 4.2 Run focused OCR client, Edge Function, composer/workspace, and extraction tests.
- [x] 4.3 Run `npm run test`, `npm run lint`, and `npm run build`.
