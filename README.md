# Hiro Monorepo

Hiro is a family chores + rewards app.
It is **mobile-only** (Expo / React Native), distributed natively via EAS to the Play internal track and TestFlight.
The web app was retired in 2026-07; its history lives in git.

## Start Here (current state)

- [docs/next-chat-handoff.md](docs/next-chat-handoff.md) - freshest session-to-session state; read this first.
- [AGENTS.md](AGENTS.md) - the agent execution contract (QA gates, PR workflow, skills).
- [docs/architecture-standards.md](docs/architecture-standards.md) - canonical architecture and engineering guardrails.
- [docs/architecture/founder-qa-workflow.md](docs/architecture/founder-qa-workflow.md) - how founder QA gates every ticket.
- [docs/roadmap.md](docs/roadmap.md) - Linear-synced roadmap (regenerate with the `sync-roadmap` skill).

This file is mandatory for all contributors and agents.
The `quality` CI check (which runs `npm run check`) is the only automated PR gate.

## Workspace Layout

- `apps/mobile` - the Expo app (the product)
- `packages/domain` - shared domain types + pure logic
- `packages/ui-tokens` - design tokens (4 themes)
- `packages/ui-primitives` - design-system primitives
- `packages/runtime` - env validation + runtime helpers
- `packages/supabase-clients` - Supabase client factories
- `supabase` - migrations + edge functions (see `supabase/README.md`)

## Common Commands

- `npm run dev:mobile`
- `npm run dev --workspace @hiro/mobile -- --clear --tunnel`
- `npm run mobile:reset`
- `npm run check` - the full quality gate chain (boundaries, governance, migrations, expo artifacts, mobile runtime, lint, typecheck, tests)
- `npm run test` / `npm run test:watch`

`npm run check` prints an emoji/color quick summary and includes mobile runtime SDK preflight to catch Expo compatibility issues early.
Mobile runtime governance also fails when forbidden root Expo artifacts (`android`, `ios`, root `app.json`) are present or runtime package versions drift into unsafe combinations.
This workspace pins npm install behavior with `.npmrc` (`legacy-peer-deps=true`) to prevent peer auto-installs from introducing Expo SDK-incompatible native module majors.
