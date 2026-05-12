# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

- This repository has completed its MVP implementation baseline. The full MVP change was archived at `openspec/changes/archive/2026-04-13-mvp-core/`.
- The commit-history documentation change was archived at `openspec/changes/archive/2026-04-14-commit-history-log/`.
- The current baseline specs now live under `openspec/specs/`.
- The input/export ownership change is archived at `openspec/changes/archive/2026-04-28-separate-workspace-input-record-export/`.
- The login intro/drawer refinement is archived at `openspec/changes/archive/2026-04-29-refine-login-intro-drawer/`.
- The DeepSeek API provider integration is archived at `openspec/changes/archive/2026-05-02-integrate-deepseek-api/`.
- The user-owned LLM provider settings work is archived at `openspec/changes/archive/2026-05-05-add-user-llm-provider-settings/`; current baseline behavior lives in `openspec/specs/llm-provider-settings/spec.md`, `openspec/specs/llm-adapter/spec.md`, and `openspec/specs/supabase-schema/spec.md`.
- Background music work is archived under `openspec/changes/archive/2026-05-03-add-background-music-toggle/` and `openspec/changes/archive/2026-05-03-add-local-background-playlist/`; current baseline behavior lives in `openspec/specs/background-audio*.md`.
- Active lab analytics implementation lives in `openspec/changes/add-lab-analytics-page/`; all tasks are applied, and the change remains the web-side lab statistics ledger until archived into baseline specs.
- Product context lives in `README.md`, `docs/products/prd-implementation-status.md`, `docs/products/product-priority-roadmap.md`, and archived product snapshots / historical Goal drafts under `docs/products/archive/`.
- Current visual-system entrypoint lives in `DESIGN.md`, which links to the active V3 design source under `docs/design/Image-2/V3/DESIGN.md`.
- Community governance now lives at the repository root: `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md`.

## Common commands

### OpenSpec workflow

- `openspec list --json` — list active changes and completion state
- `openspec status --change "<change-name>" --json` — inspect artifact status for a specific active change
- `openspec instructions apply --change "<change-name>" --json` — get implementation context and task list for an active change
- `openspec new change "<name>"` — create a new change when work needs a new spec track

### Current limitation

- Verified commands at the current baseline: `npm run build`, `npm run lint`, `npm run type-check`, `npm run type-check:functions`, `npm run test`, `npm run dev`.
- Lint currently passes with warnings related to fast-refresh export boundaries in generated/shared modules; resolve those warnings as follow-up work instead of guessing around them.

## High-level architecture

### What exists today

- `LICENSE`
  - MIT license grant for public reuse, modification, distribution, and warranty disclaimer
- `SECURITY.md`
  - private vulnerability reporting policy for auth, RLS, Edge Functions, Cloudflare Functions, provider-key storage, and privacy-sensitive flows
- `CONTRIBUTING.md`
  - contributor workflow, verification commands, OpenSpec/GEB documentation rules, PR expectations, and Conventional Commits format
- `CODE_OF_CONDUCT.md`
  - project collaboration standards and conduct-reporting boundary for a privacy-sensitive medical workflow
- `package.json`
  - npm script map for Vite dev/build, lint, app/node type-check, Cloudflare Pages Functions type-check, Supabase Edge Functions type-check, and Vitest
- `tsconfig.*.json`
  - TypeScript boundaries split by runtime: SPA app, Vite node config, Cloudflare Pages Functions, and Supabase Edge Functions
- `DESIGN.md`
  - project-level design-system entrypoint linking to the current V3 `DESIGN.md` source
- `docs/design/`
  - `Image-2/` — image-model redesign batches, including V3 screenshot-derived design tokens and visual rules
  - `stitch/` — Stitch-origin design references and runtime screenshot evidence
- `docs/products/`
  - `prd-implementation-status.md` — current PRD implementation status, preserving the implemented / partial / not implemented feature audit
  - `product-priority-roadmap.md` — current product priority roadmap, separating completed OpenSpec milestones from next work such as AI analysis, sharing, and TimelineTable return
  - `archive/` — archived product snapshots: `prd.md`, `spec.md`, `design-system.md`, `stitch-screen-mapping.md`, and `product-goals-2026-05-05.md`; archived `design-system.md` is historical and must not override `DESIGN.md`, and archived goals are not the current execution queue
- `docs/log/`
  - `index.md` — commit history 总入口
  - `0001-*.md ~ 0022-*.md` — 每个 git commit 一份历史日志
  - `0023-auth-login-wechat-learning.md` — 认证学习专题复盘，记录邮箱/Google/Supabase/微信登录的原理、数据流、配置边界与排错路径
- `openspec/specs/`
  - current baseline requirements merged from archived MVP and commit-history changes
  - `CLAUDE.md` maps each baseline spec file and records that main specs must use `## Purpose` + `## Requirements`
- `openspec/changes/add-lab-analytics-page/`
  - completed-but-unarchived OpenSpec contract and task ledger for the lab analytics work: `/app` lab file input, `/analytics/:id` and `/analytics/demo`, Supabase `lab_report_batches` / `lab_results` extension, grouped lab trend charts, latest abnormal summaries, tumor-marker continuous-rise reminders, and the selected dark clinical control-tower visual baseline
- `openspec/changes/CLAUDE.md`
  - active/archive OpenSpec change map; update it when active change directories are created, archived, renamed, or removed
- `openspec/changes/archive/2026-05-03-add-background-music-toggle/`
  - archived global background music toggle artifacts defining the app-level controller, shared UI entrypoint and autoplay boundary
- `openspec/changes/archive/2026-05-03-add-local-background-playlist/`
  - archived local playlist artifacts defining manifest-backed tracks, persisted selected track, compact previous/next controls and asset authorization boundary
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
- `openspec/changes/archive/2026-04-29-refine-login-intro-drawer/`
  - archived login-entry artifacts defining the dual-theme project intro page and CTA-opened unified login overlay
- `openspec/changes/archive/2026-05-02-integrate-deepseek-api/`
  - archived LLM provider artifacts defining the Gemini / DeepSeek Edge Function proxy, JSON output mode, provider config and rollback boundary
- `.github/`
  - `PULL_REQUEST_TEMPLATE.md` — PR summary, verification, documentation, and Conventional Commits checklist
  - `workflows/*.yml` — GitHub Actions workflows for verification and explicit Cloudflare Pages deploy
- `public/`
  - static assets plus Cloudflare Pages `_headers` / `_redirects` deployment config
- `wrangler.jsonc`
  - Cloudflare Pages build config; public Vite vars include Supabase URL/anon key/Edge Function URL and a retained non-secret `custom:wechat` provider identifier for future WeChat work; server-side vars/bindings expose the WeChat OAuth adapter client id, callback URL, public base URL and short-lived KV namespace
- `functions/`
  - Cloudflare Pages Functions; currently contains WeChat OAuth2 adapter prework that can translate Supabase custom provider requests into WeChat Open Platform QR login, while the active login page keeps WeChat as `敬请期待`
- `supabase/`
  - `migrations/*.sql` — schema, RLS, trigger, and storage-adjacent infrastructure migrations
- `src/components/analytics/`
  - analytics UI module for the lab statistics page, rendering grouped lab trends, chart-equivalent tables, demo lab data, abnormal summaries, tumor-marker rise reminders, and non-diagnostic messaging
- Global Claude OpenSpec helpers
  - `~/.claude/skills/openspec-*` and `~/.claude/commands/opsx/*` provide reusable Claude Code workflow helpers

### Current product architecture

- **Frontend:** Vite + React 18 + TypeScript SPA
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend/BaaS:** Supabase Auth + PostgreSQL + RLS + Edge Functions
- **Edge adapter:** Cloudflare Pages Functions host WeChat OAuth2 adapter prework for future Supabase custom provider compatibility; current login UI keeps WeChat deferred
- **AI boundary:** frontend calls a Supabase Edge Function proxy; system provider keys stay server-side, and user-owned provider keys are saved only through encrypted `llm_provider_settings` rows
- **Core workflow:** natural-language intake → structured extraction → up to 3 clarification rounds → timeline table render → inline editing → formal record page → PDF/PNG export
- **Privacy boundary:** first-use privacy gate and `/privacy` page share the same text source in `src/lib/privacy.ts`
- **Current truth sources:** behavior lives in `openspec/specs/**/*.md`; visual-system guidance starts at `DESIGN.md` and `docs/design/`; implementation details live in `src/`, `supabase/`, `.github/`, and `public/`; archive change designs are historical rationale, not the primary current-state entrypoint

### Core domain model

The app revolves around a `PatientRecord` with treatment history layers plus an independent lab trend collection:

1. `basicInfo` — demographics and diagnosis summary
2. `initialOnset` — optional early-stage/initial treatment block
3. `treatmentLines[]` — ordered advanced-treatment lines
4. `labResults[]` — optional repeated blood routine, blood biochemistry, and tumor-marker readings, kept independent from treatment lines

Rendering depends on three patient archetypes:

- `non-advanced` — basic info + initial onset only
- `de-novo-advanced` — basic info + treatment lines only
- `relapsed-advanced` — basic info + initial onset + treatment lines

Important domain rules from the specs:

- Basic info always renders first.
- `initialOnset` is shown only when present.
- `treatmentLines` are ordered by `lineNumber`.
- `labResults` are grouped by lab indicator and rendered as non-diagnostic trends.
- Immunohistochemistry and genetic-test data stay attached to each onset/treatment line, not in a shared summary section.
- Clinically important missing fields (`tumorType`, `stage`, `regimen`) should be visually highlighted for manual completion.

## Document hierarchy

When implementation starts, read these in roughly this order:

1. `README.md` — concise project purpose and current repo baseline
2. `docs/products/prd-implementation-status.md` — current PRD implementation status and pointers to archived product docs
3. `DESIGN.md` — project-level visual-system entrypoint, linking to the active detailed design source
4. `docs/products/archive/prd.md` — archived original user/problem framing and scope boundaries, when historical PRD context is needed
5. `openspec/specs/**/*.md` — current baseline behavior requirements
6. `src/**`, `supabase/**`, `.github/**`, `public/**` — current implementation reality and runtime boundaries
7. `openspec/changes/add-lab-analytics-page/proposal.md` + `design.md` + `specs/**/*.md` + `tasks.md` — completed active scoped work for the lab analytics page, pending archive
8. `openspec/changes/archive/**/design.md` — historical rationale only, when current behavior or past decisions need explanation

## Current architectural direction

The OpenSpec artifacts are aligned on these points:

- MVP keeps a thin `chat(messages, options)` adapter boundary.
- The LLM proxy supports system DeepSeek fallback plus user-owned Gemini, Claude, OpenAI, GLM, DeepSeek, Kimi, and custom OpenAI-style provider settings through a Supabase Edge Function boundary.
- The app now provides a user-facing LLM provider settings entry: no saved setting falls back to system DeepSeek, while user-owned preset/custom provider keys are saved through `llm-proxy/settings` with server-side encryption and RLS-backed storage.
- Data storage uses normalized `patients` + `treatment_lines` + `lab_report_batches` + `lab_results` tables with RLS; `lab_results` remains the single reading truth for web charts and monitoring, while `lab_report_batches` stores upload/OCR/review source facts.
- The active `add-lab-analytics-page` change is still unarchived, so its tasks/specs remain the implementation ledger until baseline specs are updated during archive.

## Stitch note

If future work uses the archived Stitch artifacts in `docs/products/archive/stitch-screen-mapping.md`, treat `screenInstances.label` as the authoritative page name. Do not use `project.title` or `list_screens.title` as the source of truth.

## Working conventions already present

- Follow the spec-first workflow already encoded in the repo: adjust specs before implementing when requirements change.
- PR titles and squash-merge commit messages should follow Conventional Commits: `<type>[optional scope]: <description>`.
- Commit granularity should follow OpenSpec/change boundaries. The repository default is to commit at completed Step boundaries, but if the active change documents a more specific recommended commit map, follow that map.
- Tasks are execution checklists, not an instruction to create one commit per checkbox.
- Only commit after the tests relevant to the commit's scope pass.
- Once code exists, keep repository documentation aligned with structural changes.
