# Hiro Monorepo

## Canonical Architecture Rules

Architecture and engineering guardrails live in:

- [docs/architecture-standards.md](docs/architecture-standards.md)
- [docs/architecture/founder-qa-workflow.md](docs/architecture/founder-qa-workflow.md)

This file is mandatory for all contributors and agents.
Branch protection must require `quality` and `pr-governance` checks before merge.

## Workspace Layout

- `apps/mobile`
- `apps/web`
- `packages/domain`
- `packages/ui-tokens`
- `packages/ui-primitives`
- `packages/runtime`
- `packages/supabase-clients`
- `supabase`

## Common Commands

- `npm run dev:web`
- `npm run dev:mobile`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run check:boundaries`
- `npm run check:governance`
- `npm run check`

`npm run check` now prints an emoji/color quick summary and includes mobile runtime SDK preflight to catch Expo Go compatibility issues early.
