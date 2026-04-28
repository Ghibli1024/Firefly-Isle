## 1. Spec and baseline

- [x] 1.1 Create OpenSpec proposal, design notes, tasks and delta specs for the input/export ownership split
- [x] 1.2 Add/adjust regression tests proving `/app` no longer renders PDF/PNG export actions
- [x] 1.3 Add/adjust regression tests proving `/record/:id` owns PDF/PNG export actions
- [x] 1.4 Add/adjust regression tests for composer file/voice/count affordance placement

## 2. Workspace input composer

- [x] 2.1 Move composer UI to textarea with lower tool row and primary action outside the textarea
- [x] 2.2 Add “导入病历文件” affordance as an input tool without changing extraction schema
- [x] 2.3 Add voice affordance beside the character counter without reintroducing the old voice card
- [x] 2.4 Remove PDF/PNG export buttons from `/app`
- [x] 2.5 Preserve existing extraction, follow-up, saving and error behavior

## 3. Record export ownership

- [x] 3.1 Ensure `/record/:id` exposes PDF/PNG export actions as the formal dossier actions
- [x] 3.2 Reuse current html2canvas/jsPDF export behavior and loading/error messages
- [x] 3.3 Preserve disabled/demo fallback behavior until a real saved record is available
- [x] 3.4 Keep “编辑数据” or return-to-workbench action distinct from export actions

## 4. Documentation

- [x] 4.1 Update affected L3 headers for changed route/component responsibilities
- [x] 4.2 Update affected `CLAUDE.md` maps for workspace and route ownership changes
- [x] 4.3 Update root `CLAUDE.md` active change state if this change remains active
- [x] 4.4 Keep OpenSpec artifacts self-contained and free of external source-folder dependencies

## 5. Verification

- [x] 5.1 Run focused workspace and record route tests
- [x] 5.2 Run `npm run lint`
- [x] 5.3 Run `npm run build`
- [x] 5.4 Browser-check `/app` dark/light: file + voice + count visible, no PDF/PNG buttons
- [x] 5.5 Browser-check `/record/demo` dark/light: PDF/PNG visible in dossier context with correct enabled/disabled state
