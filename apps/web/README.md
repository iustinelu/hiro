# apps/web Ownership

- Purpose: Web app shell and feature UI implementation.
- Must not import from `apps/mobile`.
- Must consume shared packages for domain, tokens, primitives, runtime, and Supabase clients.

## Run

- From repo root: `npm run dev:web`
- From this folder: `npm run dev`

## HIR-32 Responsive Shell

- Routes: `/home`, `/tasks`, `/progress`, `/budget`, `/more`.
- Root route `/` redirects to `/home`.
- Layout: desktop side nav + top header/action, mobile top header + bottom tab bar.
- Pattern: title-left header with per-tab primary action on the right across all sections.

## HIR-31 Design Gallery

- Route: `/design-system`
- Purpose: founder QA validation of primitive variants, feedback states, modal sheet, and chart wrapper.
