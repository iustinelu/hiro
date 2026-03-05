# apps/mobile Ownership

- Purpose: Expo app shell and feature UI implementation.
- Must not import from `apps/web`.
- Must consume shared packages for domain, tokens, primitives, runtime, and Supabase clients.

## Run

- From repo root: `npm run dev:mobile`
- From this folder: `npm run dev`
- From repo root with Expo flags: `npm run dev --workspace @hiro/mobile -- --clear --tunnel`
- Preflight health: `npx expo-doctor`

## Runtime Guardrails

- Run Expo native/prebuild commands from `apps/mobile` only.
- Do not create root-level Expo artifacts (`/android`, `/ios`, root `app.json`).
- Workspace install policy is pinned by root `.npmrc` (`legacy-peer-deps=true`) to avoid npm peer auto-installs introducing SDK-incompatible native module versions.
- Validate runtime consistency from repo root:
  - `npm run check:expo-root-artifacts`
  - `npm run check:mobile-runtime`

## Recovery Flow (Known-Good Reset)

- From repo root:
  - `npm run mobile:reset`
- Then start mobile server:
  - `npm run dev --workspace @hiro/mobile -- --clear --tunnel`

## HIR-32 Navigation Shell

- Entry point: `AppShellScreen` renders `AppTabs`.
- Tabs: Home, Tasks, Progress, Budget, More.
- Pattern: title-left header with per-tab primary action on the right.
- QA focus: bottom-tab parity, safe-area spacing, and keyboard overlap behavior (`tabBarHideOnKeyboard`).

## HIR-31 Design Gallery

- Entry point file: `src/screens/DesignSystemGallery.tsx`
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
