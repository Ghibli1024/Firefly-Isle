# Contributing to Firefly-Isle

Thank you for helping improve Firefly-Isle. The project is small, privacy
sensitive, and spec-led, so changes should be narrow, tested, and documented.

## Development Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Fill the Supabase and Edge Function variables described in `README.md` before
testing authentication, persistence, or LLM-backed extraction.

## Before Opening a Pull Request

Run the checks that match your change:

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

Documentation-only changes do not need a browser smoke test, but they should
still keep the repository maps accurate.

## Spec and Documentation Rules

- Behavior changes start from `openspec/specs/` or a new OpenSpec change.
- Structural changes must update the nearest `CLAUDE.md`.
- Source files with module responsibility changes must keep their header
  contract aligned with the implementation.
- Archived OpenSpec changes are evidence, not the current source of truth.

## Pull Request Rules

Keep PRs focused on one product or infrastructure concern. A good PR explains:

- What changed.
- Why it changed.
- How it was verified.
- Which specs, maps, migrations, or deployment settings were touched.

Use draft PRs for incomplete work. Mark a PR ready only after relevant checks
pass and the docs reflect the code.

## Commit and PR Title Format

Use Conventional Commits for PR titles and squash-merge commit messages:

```text
<type>[optional scope]: <description>
```

Recommended types:

- `feat`: user-visible feature.
- `fix`: bug fix.
- `docs`: documentation-only change.
- `refactor`: behavior-preserving code structure change.
- `test`: test-only change.
- `ci`: GitHub Actions or deployment pipeline change.
- `build`: dependency, bundler, or build configuration change.
- `chore`: maintenance that does not affect runtime behavior.

Examples:

```text
feat(provider-settings): add user-owned Kimi preset
fix(auth): preserve session after privacy gate redirect
docs(governance): add community health files
ci(pages): require main ancestry before deploy
```

Mark breaking changes with `!` or a `BREAKING CHANGE:` footer.

## Privacy and Security

Never commit secrets, provider keys, private patient data, or exported records.
Use `.env.local`, `.dev.vars`, Supabase secrets, and Cloudflare secrets for
runtime credentials. Report vulnerabilities through `SECURITY.md` instead of a
public issue.
