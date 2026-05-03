## Why

用户已经从“打开应用自动播放一首背景音乐”推进到“播放指定的几首本地授权歌曲”。现有实现只有单一音频源和开关，不能表达曲目列表、当前曲目、上一首/下一首或曲目选择持久化。

## What Changes

- Add a local background playlist capability backed by explicitly declared public asset paths.
- Upgrade the app-wide background audio controller from one fixed source to a typed track list with current-track state.
- Persist the selected track separately from the existing on/off preference.
- Add previous/next controls and current-track text to the existing music control without turning it into a full media player.
- Keep Apple Music URLs as source references only; do not download, embed, or bypass protected streaming audio.

## Capabilities

### New Capabilities
- `background-audio-playlist`: Defines local authorized track metadata, selected-track persistence, next/previous behavior, end-of-track advance, and missing-file boundaries.

### Modified Capabilities
- `app-shell`: The global music control now exposes a compact playlist surface with current track text and previous/next actions while preserving shell geometry and core workflow semantics.

## Impact

- `src/lib/background-audio.tsx` gains playlist state and actions while preserving the existing public on/off API.
- `src/lib/background-audio-tracks.ts` declares the two local track contracts and Apple Music reference URLs.
- `src/components/background-music-toggle.tsx` renders the compact playlist controls.
- `public/audio/` documents the user-provided local audio boundary; no copyrighted track is generated or downloaded.
- Focused tests cover playlist state, persistence, next/previous wrapping, ended-event advance, and compact UI rendering.
