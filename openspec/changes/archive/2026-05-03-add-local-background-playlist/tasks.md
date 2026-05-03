## 1. Test Coverage First

- [x] 1.1 Add controller tests for default track loading, selected-track persistence, invalid stored-track fallback, next/previous wrapping, ended-event advance, and autoplay-blocked recovery.
- [x] 1.2 Add component tests proving the shared music control renders current track text plus accessible previous/next actions in login and authenticated shell surfaces.

## 2. Core Playlist Implementation

- [x] 2.1 Add the typed local track manifest for the two user-provided songs with Apple Music reference URLs and public asset paths.
- [x] 2.2 Extend the background audio controller snapshot and context API with track list, current track, selection, next, and previous actions while preserving existing on/off behavior.
- [x] 2.3 Wire ended-event handling so enabled playback advances to the next track without creating another audio element.

## 3. Compact Playlist UI

- [x] 3.1 Update the shared music control to show current track text, previous, next, and the existing play/off action in a stable compact layout.
- [x] 3.2 Keep unavailable and autoplay-blocked states keyboard-accessible and readable through aria labels and titles.

## 4. Documentation and Verification

- [x] 4.1 Update L3 headers and affected `CLAUDE.md` maps for new or changed source, component, asset, and OpenSpec files.
- [x] 4.2 Document `public/audio/tracks/` as user-provided local assets and avoid committing third-party copyrighted music.
- [x] 4.3 Run `npm run test`, `npm run type-check`, `npm run lint`, and `npm run build`.
- [x] 4.4 Run `openspec validate --changes` and confirm the playlist change is valid.
