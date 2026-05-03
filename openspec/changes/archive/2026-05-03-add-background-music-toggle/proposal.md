## Why

Firefly-Isle 的产品愿景已把背景音乐列为体验优化方向，但当前应用没有统一的音频状态、播放入口或关闭路径。用户希望打开项目时自动响起音乐，同时能一键关闭，这需要被收敛为可控、可恢复、可测试的全局体验，而不是散落在某个页面里的临时播放器。

## What Changes

- Add a background music capability that requests playback when the app opens and keeps the audio state global across `/login`, `/app`, `/record/:id`, and `/privacy`.
- Add a visible music control that lets users turn music off and back on without changing authentication, extraction, editing, or export flows.
- Persist the user's music preference locally so a user who turns music off is not surprised by playback on the next visit.
- Handle browser autoplay blocking as a first-class state: the app may request playback on boot, but it must expose a clear user-triggered path to start or mute music when the browser requires a gesture.
- Use a local static audio asset or explicitly declared public asset path; no streaming dependency is introduced for MVP.

## Capabilities

### New Capabilities

- `background-audio`: Defines app-wide background music playback, preference persistence, autoplay fallback, mute/unmute behavior, and reduced-motion/accessibility boundaries.

### Modified Capabilities

- `app-shell`: Adds the global music control to the application shell/entry surfaces without changing route ownership, auth semantics, clinical workflow, or export boundaries.

## Impact

- `src/App.tsx` or a new app-level provider will own the single background-audio state source.
- `src/components/` and `src/components/system/` will expose the shared music control in login and authenticated shell surfaces.
- `src/lib/` may gain a small audio preference/controller module and focused tests.
- `public/` may gain the MVP background audio asset and matching documentation.
- Specs and module maps must stay aligned because this introduces a new cross-route capability and likely new files.
