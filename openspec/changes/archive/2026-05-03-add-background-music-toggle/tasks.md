## 1. Context and Asset Boundary

- [x] 1.1 Inspect `src/App.tsx`, `/login` intro tools, shared shell action surfaces, and existing `CLAUDE.md` maps before implementation.
- [x] 1.2 Decide the MVP audio asset path and ensure any committed track under `public/audio/` is user-provided or properly licensed.
- [x] 1.3 Define the background-audio status model and persisted preference key before writing UI code.

## 2. Test Coverage First

- [x] 2.1 Add focused tests for background-audio preference persistence, autoplay rejection, successful user-triggered playback, pause/off behavior, and missing-asset/error state.
- [x] 2.2 Add component or route-level tests proving the music control renders with accessible labels on `/login` and authenticated shell pages.
- [x] 2.3 Add regression coverage showing route navigation, theme switching, and language switching do not reset the music state.

## 3. Core Implementation

- [x] 3.1 Implement a single app-level background-audio provider/hook that owns the audio element, playback status, toggle actions, and local preference.
- [x] 3.2 Mount the provider once in the app provider tree without changing auth, privacy gate, route, extraction, or export semantics.
- [x] 3.3 Implement a shared icon-only music toggle component that reflects playing/off/blocked/unavailable states through visible, tooltip, and aria text.
- [x] 3.4 Add the shared music toggle to the `/login` intro tool area beside theme/language controls.
- [x] 3.5 Add the shared music toggle to the authenticated shell action area by reusing system shell components rather than duplicating route-local buttons.

## 4. Documentation and Verification

- [x] 4.1 Update affected L3 file headers and nearby `CLAUDE.md` module maps for any new or changed files.
- [x] 4.2 Update asset documentation or `public/CLAUDE.md` if `public/audio/` is added.
- [x] 4.3 Run `npm run test`, `npm run type-check`, `npm run lint`, and `npm run build`.
- [x] 4.4 Run `openspec validate --changes` and confirm `add-background-music-toggle` is valid before implementation is considered complete.
