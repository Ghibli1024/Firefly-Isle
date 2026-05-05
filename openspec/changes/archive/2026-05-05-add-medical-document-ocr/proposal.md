## Why

`/app` already has a file-import affordance, but it only shows "暂未开放"; users still have to manually type text from paper records or PDFs before the existing PatientRecord extraction flow can help. Adding a service-side OCR bridge turns uploaded medical images/PDFs into confirmed raw text while preserving the current structured extraction pipeline and key boundary.

## What Changes

- Replace the current import-file placeholder with image/PDF upload support on `/app`.
- Add a medical-document OCR boundary that accepts `image/*` and `application/pdf`, calls OCR from the server/Edge side, and returns extracted raw text plus recoverable errors.
- Show an OCR confirmation state before the text enters the existing `extractPatientRecord` flow.
- Send confirmed OCR text through the same extraction and merge path as manually typed text.
- Reject unsupported file types and keep OCR failures from changing the current `PatientRecord`.
- Use Gemini document/image input for first-version OCR because DeepSeek Chat Completion is text-only in the checked request schema, while Gemini documents official PDF/document processing support.

## Capabilities

### New Capabilities
- `medical-document-ocr`: Covers file upload, server-side OCR, text confirmation, supported/unsupported file handling, OCR failure recovery, and non-pollution of existing patient records.

### Modified Capabilities
- `info-extraction`: Confirmed OCR text SHALL enter the existing natural-language extraction flow instead of creating a separate PatientRecord path.

## Impact

- Affects `/app` workspace orchestration and `ExtractionComposer`.
- Adds a frontend OCR client boundary and a server/Edge OCR function boundary; OCR provider keys must remain server-side.
- Extends tests around upload success, PDF success, unsupported types, OCR failure, confirmation, and failed OCR non-pollution.
- Updates OpenSpec baseline specs and affected `CLAUDE.md` maps.
