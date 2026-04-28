# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

- This repository has completed its MVP implementation baseline. The full MVP change was archived at `openspec/changes/archive/2026-04-13-mvp-core/`.
- The commit-history documentation change was archived at `openspec/changes/archive/2026-04-14-commit-history-log/`.
- The current baseline specs now live under `openspec/specs/`.
- There are currently no active OpenSpec changes. The input/export ownership change is archived at `openspec/changes/archive/2026-04-28-separate-workspace-input-record-export/`.
- Product context lives in `README.md` and `docs/products/`.
- Current visual-system entrypoint lives in `DESIGN.md`, which links to the active V3 design source under `docs/design/Image-2/V3/DESIGN.md`.

## Common commands

### OpenSpec workflow

- `openspec list --json` — list active changes and completion state
- `openspec status --change "<change-name>" --json` — inspect artifact status for a specific active change
- `openspec instructions apply --change "<change-name>" --json` — get implementation context and task list for an active change
- `openspec new change "<name>"` — create a new change when work needs a new spec track

### Current limitation

- Verified commands at the current baseline: `npm run build`, `npm run lint`, `npm run dev`.
- Lint currently passes with warnings related to fast-refresh export boundaries in generated/shared modules; resolve those warnings as follow-up work instead of guessing around them.

## High-level architecture

### What exists today

- `DESIGN.md`
  - project-level design-system entrypoint linking to the current V3 `DESIGN.md` source
- `docs/design/`
  - `Image-2/` — image-model redesign batches, including V3 screenshot-derived design tokens and visual rules
  - `stitch/` — Stitch-origin design references and runtime screenshot evidence
- `docs/products/`
  - `prd.md` — product background, MVP scope, and future roadmap
  - `spec.md` — implementation plan and architectural decisions
  - `design-system.md` — design-system prompt/reference, not implemented code tokens
  - `stitch-screen-mapping.md` — Stitch naming/source-of-truth rules for design screens
- `docs/log/`
  - `index.md` — commit history 总入口
  - `0001-*.md ~ 0022-*.md` — 每个 git commit 一份历史日志
- `openspec/specs/`
  - current baseline requirements merged from archived MVP and commit-history changes
- `openspec/changes/archive/2026-04-13-mvp-core/`
  - archived MVP implementation artifacts (proposal/design/specs/tasks)
- `openspec/changes/archive/2026-04-14-commit-history-log/`
  - archived docs/log governance artifacts (proposal/design/specs/tasks)
- `openspec/changes/archive/2026-04-23-unify-theme-system/`
  - archived theme-system unification artifacts (proposal/design/specs/tasks)
- `openspec/changes/archive/2026-04-23-refine-login-theme-entry/`
  - archived login theme-entry refinement artifacts (proposal/design/specs/tasks)
- `openspec/changes/archive/2026-04-28-separate-workspace-input-record-export/`
  - archived input/export ownership artifacts separating `/app` input/extraction from `/record/:id` formal PDF/PNG export
- `.github/`
  - `workflows/*.yml` — GitHub Actions workflows for verification and explicit Cloudflare Pages deploy
- `public/`
  - static assets plus Cloudflare Pages `_headers` / `_redirects` deployment config
- `supabase/`
  - `migrations/*.sql` — schema, RLS, trigger, and storage-adjacent infrastructure migrations
- Global Claude OpenSpec helpers
  - `~/.claude/skills/openspec-*` and `~/.claude/commands/opsx/*` provide reusable Claude Code workflow helpers

### Current product architecture

- **Frontend:** Vite + React 18 + TypeScript SPA
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend/BaaS:** Supabase Auth + PostgreSQL + RLS + Edge Functions
- **AI boundary:** frontend calls a Supabase Edge Function proxy; provider API keys stay server-side
- **Core workflow:** natural-language intake → structured extraction → up to 3 clarification rounds → timeline table render → inline editing → formal record page → PDF/PNG export
- **Privacy boundary:** first-use privacy gate and `/privacy` page share the same text source in `src/lib/privacy.ts`
- **Current truth sources:** behavior lives in `openspec/specs/**/*.md`; visual-system guidance starts at `DESIGN.md` and `docs/design/`; implementation details live in `src/`, `supabase/`, `.github/`, and `public/`; archive change designs are historical rationale, not the primary current-state entrypoint

### Core domain model

The app revolves around a `PatientRecord` with three layers:

1. `basicInfo` — demographics and diagnosis summary
2. `initialOnset` — optional early-stage/initial treatment block
3. `treatmentLines[]` — ordered advanced-treatment lines

Rendering depends on three patient archetypes:

- `non-advanced` — basic info + initial onset only
- `de-novo-advanced` — basic info + treatment lines only
- `relapsed-advanced` — basic info + initial onset + treatment lines

Important domain rules from the specs:

- Basic info always renders first.
- `initialOnset` is shown only when present.
- `treatmentLines` are ordered by `lineNumber`.
- Immunohistochemistry and genetic-test data stay attached to each onset/treatment line, not in a shared summary section.
- Clinically important missing fields (`tumorType`, `stage`, `regimen`) should be visually highlighted for manual completion.

## Document hierarchy

When implementation starts, read these in roughly this order:

1. `README.md` — concise project purpose and current repo baseline
2. `docs/products/prd.md` — user/problem framing and scope boundaries
3. `DESIGN.md` — project-level visual-system entrypoint, linking to the active detailed design source
4. `openspec/specs/**/*.md` — current baseline behavior requirements
5. `src/**`, `supabase/**`, `.github/**`, `public/**` — current implementation reality and runtime boundaries
6. `openspec/changes/<new-change>/proposal.md` + `tasks.md` — active scoped work, once a new change is created
7. `openspec/changes/archive/**/design.md` — historical rationale only, when current behavior or past decisions need explanation

## Current architectural direction

The OpenSpec artifacts are aligned on these points:

- MVP keeps a thin `chat(messages, options)` adapter boundary.
- MVP uses Gemini through a Supabase Edge Function proxy.
- MVP does **not** implement multi-provider routing or a provider settings UI.
- Data storage uses normalized `patients` + `treatment_lines` tables with RLS.

## Stitch note

If future work uses the Stitch artifacts in `docs/products/stitch-screen-mapping.md`, treat `screenInstances.label` as the authoritative page name. Do not use `project.title` or `list_screens.title` as the source of truth.

## Working conventions already present

- Follow the spec-first workflow already encoded in the repo: adjust specs before implementing when requirements change.
- Commit granularity should follow OpenSpec/change boundaries. The repository default is to commit at completed Step boundaries, but if the active change documents a more specific recommended commit map, follow that map.
- Tasks are execution checklists, not an instruction to create one commit per checkbox.
- Only commit after the tests relevant to the commit's scope pass.
- Once code exists, keep repository documentation aligned with structural changes.
