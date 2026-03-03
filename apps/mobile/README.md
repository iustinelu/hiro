# apps/mobile Ownership

- Purpose: Expo app shell and feature UI implementation.
- Must not import from `apps/web`.
- Must consume shared packages for domain, tokens, primitives, runtime, and Supabase clients.

## Run

- From repo root: `npm run dev:mobile`
- From this folder: `npm run dev`
- Preflight health: `npx expo-doctor`

## HIR-31 Design Gallery

- Entry point: `AppShellScreen` currently renders `DesignSystemGalleryScreen`
- Purpose: founder QA validation of primitive variants, states, and tap comfort.

## Founder QA Mobile Runtime Quick Cycle

- Validate SDK compatibility first:
  - `node ../../scripts/check-mobile-runtime.mjs`
  - `npx expo-doctor`
- Start app server:
  - `npm run dev`
- If QR scan on physical device fails due to Expo Go SDK mismatch:
  - Upgrade project SDK first (preferred), or
  - Use a dev build workflow for the current SDK instead of Expo Go.
