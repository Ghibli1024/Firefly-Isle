## Context

The product has two valid but distinct modes:

- A real authenticated or anonymous workspace at `/app`, which has no record until the user extracts or imports one.
- A public `/demo/*` showcase with sample data and an explicit Demo badge.

The previous fallback merged those modes at the sidebar boundary. It did not seed Demo data into Supabase, but it did navigate real empty accounts into the showcase, which reads as account data and obscures the actual empty-workspace state.

## Goals / Non-Goals

**Goals:**

- Make empty real workspaces truthful and unambiguous.
- Keep the next action obvious: extract a record first.
- Preserve real-record and public-Demo navigation contracts.
- Keep disabled navigation accessible and non-interactive.

**Non-Goals:**

- Do not create a record automatically.
- Do not change Supabase Auth, RLS, loading, or record persistence.
- Do not remove public Demo routes or their Demo-mode behavior.
- Do not add a new onboarding flow.

## Decisions

### 1. Navigation availability comes from optional hrefs

`ArchiveSideNav` treats missing `recordHref` or `analyticsHref` as an unavailable real-workspace destination. It renders a disabled button with `aria-disabled`, a localized label, and a visible `先提取` / `Extract first` status rather than inventing a fallback URL.

This keeps the normal navigation shape simple: a route provides an href when it owns a destination; it omits the href when the destination does not exist. No special `/demo/*` branch is needed for an empty real workspace.

### 2. Demo is explicit, never inferred from absence

Only callers already in public Demo mode pass `/demo/record` or `/demo/analytics`. The sidebar continues to show the Demo badge only for those explicit hrefs.

### 3. Empty and failed loading remain distinguishable

This change does not convert a loader failure into a Demo route. The workspace’s existing load error remains visible, while record-dependent navigation stays unavailable until an accessible record is present.

## Risks / Trade-offs

- Users must complete an extraction before opening record or analytics pages. This accurately reflects the data model and avoids showing sample medical data as user data.
- A disabled navigation entry is less discoverable than a clickable Demo route. Public Demo remains separately reachable and explicitly labeled rather than being silently injected into an account workflow.

## Migration Plan

1. Update the app-shell OpenSpec delta.
2. Remove workspace Demo fallbacks and render unavailable navigation accessibly.
3. Add localized unavailable-state copy and focused regression coverage.
4. Validate OpenSpec, targeted tests, type checks, lint, build, and browser behavior for both a signed-in empty workspace and public Demo routes.
