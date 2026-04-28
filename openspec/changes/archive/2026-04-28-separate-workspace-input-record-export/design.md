## Context

The current UI treats the workspace composer as both an input surface and an export surface. That is the wrong boundary. The product has two related states with different jobs:

```text
/app
  Draft / Input / Extraction
  textarea tools: file import + voice + count
  primary action: start extraction
  no formal export

/record/:id
  Archive / Record / Export
  patient dossier + treatment chronology
  formal actions: export PDF / export PNG / edit data
```

## Design Decisions

### 1. Page role defines the action boundary

- **Decision:** Treat `/app` as the input and extraction workbench, not the export surface.
- **Rationale:** A PDF/PNG export is semantically a formal record action. Keeping it in the composer makes an unfinished draft look export-ready.

### 2. Input tools live inside the textarea surface

- **Decision:** Place “导入病历文件” in the textarea lower-left tool row and voice + count in the lower-right tool row.
- **Rationale:** File import, voice input and typing are three ways to fill the same clinical notes buffer. They should be sibling input affordances, not separate workflow cards.

### 3. Extraction remains the only primary `/app` action

- **Decision:** Keep exactly one primary “开始结构化提取” action outside the textarea, aligned to the lower-right of the input panel.
- **Rationale:** The primary action transforms input into structured draft. More primary actions dilute the clinical workflow.

### 4. Record owns formal export

- **Decision:** `/record/:id` owns PDF/PNG export controls and uses the existing export implementation.
- **Rationale:** Record is the archive/dossier context where the user can review a saved clinical timeline before producing a formal artifact.

### 5. No new route for export

- **Decision:** Do not add a separate export page for this change; use `/record/:id`.
- **Rationale:** The existing record dossier page already has the correct product meaning: review the saved clinical history, then produce formal artifacts. A third export route would add navigation complexity without new product meaning.

## Implementation Shape

```text
copy text
  ↓
ExtractionComposer props and layout
  ↓
WorkspacePage export actions removed from composer surface
  ↓
RecordPage export controls become the visible export entry
  ↓
tests assert ownership boundaries
```

Likely code touchpoints:

- `src/components/workspace/extraction-composer.tsx`
- `src/routes/workspace-page.tsx`
- `src/routes/record-page.tsx`
- `src/lib/copy.ts`
- `src/routes/workspace-page.test.tsx`
- `src/routes/record-page.test.tsx`

## Risks / Trade-offs

- **Risk: export implementation still depends on a workspace-only report ref.** Mitigation: keep implementation reuse explicit and move the user-facing trigger without duplicating capture logic blindly.
- **Risk: adding voice UI implies real speech recognition behavior.** Mitigation: define the initial button as a UI affordance only if speech capture is out of scope; if wired, specify permission/error states before implementation.
- **Risk: file import opens scope creep into OCR/PDF parsing.** Mitigation: this change may add only the input affordance unless a separate import/OCR spec already exists.
- **Risk: demo record has no saved record export target.** Mitigation: keep disabled/fallback behavior explicit in `/record/demo` until a real saved record exists.
