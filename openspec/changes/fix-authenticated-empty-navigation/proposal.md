## Why

An authenticated or anonymous `/app` session with no user-owned patient record currently routes the sidebar’s `病历` and `统计` entries to public `/demo/*` pages. The public Demo is healthy, but this fallback makes a real empty workspace look like the signed-in account is using sample data.

## What Changes

- Keep a real empty workspace empty: when no accessible user-owned record is loaded, disable the record and analytics sidebar entries instead of linking to public Demo pages.
- Give the unavailable entries a concise, localized `先提取` / `Extract first` explanation and a non-interactive, accessible disabled state.
- Keep real records linked to `/record/:id` and `/analytics/:id`.
- Keep explicit public Demo routes and their in-Demo shell navigation unchanged, including the Demo badge.

## Capabilities

### Modified Capabilities
- `app-shell`: Empty real workspaces SHALL not route record or analytics navigation to public Demo routes.

## Impact

- Affected frontend routes: `src/routes/workspace-page.tsx`.
- Affected shared UI and copy: `src/components/system/sidebar-nav.tsx`, `src/lib/copy.ts`.
- Affected tests: `src/routes/workspace-page.test.tsx`.
- Affected documentation: the OpenSpec change map and the source ownership maps for routes, system components, and shared copy.
