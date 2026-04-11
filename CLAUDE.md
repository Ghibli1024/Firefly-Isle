# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

- This repository is in an **early implementation baseline** state. A minimal Vite app scaffold, routing shell, theme system foundation, and product/spec documents exist; the remaining MVP capabilities are still tracked in `openspec/changes/mvp-core/`.
- The active implementation source of truth is the OpenSpec change `mvp-core` under `openspec/changes/mvp-core/`.
- Product context lives in `README.md` and `docs/products/`.

## Common commands

### OpenSpec workflow

- `openspec list --json` — list active changes and completion state
- `openspec status --change "mvp-core" --json` — inspect artifact status for the current MVP change
- `openspec instructions apply --change "mvp-core" --json` — get the current implementation context and task list
- `openspec new change "<name>"` — create a new change when work needs a new spec track

### Current limitation

- Verified commands at the current baseline: `npm run build`, `npm run lint`, `npm run dev`.
- Lint currently passes with warnings related to fast-refresh export boundaries in generated/shared modules; resolve those warnings as follow-up work instead of guessing around them.

## High-level architecture

### What exists today

- `docs/products/`
  - `prd.md` — product background, MVP scope, and future roadmap
  - `spec.md` — implementation plan and architectural decisions
  - `design-system.md` — design-system prompt/reference, not implemented code tokens
  - `stitch-screen-mapping.md` — Stitch naming/source-of-truth rules for design screens
- `openspec/changes/mvp-core/`
  - `proposal.md` — MVP scope and capability list
  - `design.md` — target architecture and design rationale
  - `specs/**/*.md` — requirement-level behavior for each capability
  - `tasks.md` — ordered implementation checklist
- `supabase/`
  - `migrations/*.sql` — schema, RLS, trigger, and storage-adjacent infrastructure migrations
- `.claude/skills/openspec-*` and `.claude/commands/opsx/*`
  - local OpenSpec workflow helpers used by Claude Code

### Planned product architecture (from the OpenSpec artifacts)

- **Frontend:** Vite + React 18 + TypeScript SPA
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend/BaaS:** Supabase Auth + PostgreSQL + RLS + Edge Functions
- **AI boundary:** frontend should call a Supabase Edge Function proxy; provider API keys must stay server-side
- **Core workflow:** natural-language intake → structured extraction → up to 3 clarification rounds → timeline table render → inline editing → PDF/PNG export

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

1. `README.md` — concise project purpose
2. `docs/products/prd.md` — user/problem framing and scope boundaries
3. `openspec/changes/mvp-core/proposal.md` — current MVP scope
4. `openspec/changes/mvp-core/specs/**/*.md` — behavior requirements
5. `openspec/changes/mvp-core/design.md` — architecture and tradeoffs
6. `openspec/changes/mvp-core/tasks.md` — execution order

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
