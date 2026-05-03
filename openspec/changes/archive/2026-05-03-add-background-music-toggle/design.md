## Context

Firefly-Isle is a Vite + React SPA with global theme, locale, auth, privacy, login, workspace, record, and privacy routes wired through `src/App.tsx`. The current shell already has shared topbar/sidebar surfaces, while `/login` owns its intro tools. `docs/products/prd.md` lists a background music player as a P2 experience idea, but there is no audio state, no asset contract, and no user control.

The hard browser constraint is audible autoplay: the app can request playback when it opens, but browsers may reject that request until the user interacts with the page. The design must treat that rejection as normal state, not as an exceptional crash path.

## Goals / Non-Goals

**Goals:**

- Provide one app-wide background music controller that can request playback on app open.
- Expose one shared music toggle surface so users can turn music off and back on.
- Persist the user's off preference across reloads and future visits.
- Keep the control visually consistent across dark/light themes, login intro, and authenticated shell surfaces.
- Make autoplay-blocked, playing, paused, and missing-asset states testable.

**Non-Goals:**

- No playlist, track picker, waveform, volume mixer, streaming service integration, or user-uploaded audio.
- No attempt to bypass browser autoplay rules.
- No changes to Supabase Auth, extraction, editing, persistence, PDF/PNG export, or LLM provider behavior.
- No committed third-party copyrighted audio unless the asset is explicitly user-provided or properly licensed.

## Decisions

### Decision 1: One provider owns the audio element

Create a small app-level background audio provider near the existing theme/locale/auth providers. It owns a single `HTMLAudioElement`, a configured source path, playback status, and the persisted preference.

Alternative considered: mount `<audio>` independently inside each route. That creates duplicate playback, route-change resets, and multiple sources of truth. One provider keeps the state flat: one element, one status, one toggle.

### Decision 2: Default to requested playback, not guaranteed playback

On first app boot, if the local preference is not `off`, the provider requests playback of the configured background track. If `audio.play()` rejects because the browser requires a gesture, the provider records an `autoplay-blocked` status and leaves the toggle available.

Alternative considered: wait for the first click before doing anything. That avoids rejection, but it violates the requested "opens with music" intent and hides the platform rule. Requesting playback first gives the best possible automatic behavior while keeping the blocked path honest.

### Decision 3: Persist only the user's intent

Store a compact preference such as `firefly:background-audio=on|off`. Runtime status like `playing`, `paused`, `loading`, or `blocked` stays in memory and is derived from the actual audio element.

Alternative considered: persist detailed playback status. That turns transient browser conditions into stale truth. Persisting only intent keeps the model simple and prevents special cases.

### Decision 4: Use a shared icon control, not page-specific buttons

Implement a shared music toggle component that consumes the provider and renders as an icon button with accessible labels, pressed state, and a short title. On `/login`, it sits with the intro tools beside theme/language controls. On authenticated pages, it sits in the shared shell action area near help/settings, using the same component.

Alternative considered: put the control only on the login page. That makes the first page pleasant but leaves users trapped after navigation. Music is global, so the control must be global.

### Decision 5: Use a declared local asset path

Use a public asset path such as `/audio/background-music.mp3` and a single exported config constant. The implementation should work if the file exists, and fail quietly into a disabled or unavailable state if it does not. The actual committed track must be licensed or user-provided.

Alternative considered: remote audio URL. That adds network failure, privacy leakage, and CORS concerns for no MVP value.

## Risks / Trade-offs

- [Risk] Browser blocks autoplay on first open -> Mitigation: treat `NotAllowedError` as normal `autoplay-blocked` state and let the next toggle click call `play()`.
- [Risk] Surprise audio harms trust -> Mitigation: make the off control visible immediately and persist `off` before any future playback attempt.
- [Risk] Missing or unlicensed audio asset delays implementation -> Mitigation: land the controller and control contract first, with a declared asset path and unavailable state until the final asset is provided.
- [Risk] Mobile browsers pause audio during route or visibility changes -> Mitigation: bind behavior to the audio element's `play`, `pause`, `error`, and visibility events instead of assuming playback continuity.
- [Risk] Control placement adds shell clutter -> Mitigation: use one icon-only control with tooltip/aria text and reuse existing theme tokens.

## Migration Plan

1. Add the audio asset path contract and provider/hook with tests for preference, blocked autoplay, missing source, and toggle behavior.
2. Mount the provider once around the app content.
3. Add the shared music toggle to login intro tools and authenticated shell action surfaces.
4. Add or document the licensed audio asset under `public/audio/`.
5. Verify route changes do not restart or duplicate playback and that turning music off survives reload.

Rollback is simple: remove the provider mount and shared control, leaving existing routes and business flows unchanged.

## Open Questions

- Which final licensed track file should ship for MVP: the requested `Just One Dance`, a user-provided file, or a temporary royalty-free placeholder?
- Should the initial volume be fixed at a quiet default, or should MVP only support on/off?
