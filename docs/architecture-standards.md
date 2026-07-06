# Hiro Architecture Standards v1

Last updated: 2026-07-05
Status: Mandatory
Canonicality: This file is the single source of truth for architecture rules.

> **Mobile-only (2026-07):** Hiro is a mobile-only product.
> The web app is retired; web-specific rules below apply only if web is ever un-parked.

## 1. Purpose

This document defines the mandatory engineering standards for Hiro. All contributors (human and AI agents) must follow these rules unless an explicit temporary exception is approved via the emergency deviation process.

## 2. Repo Boundaries

Approved top-level boundaries:

- `apps/mobile`: Expo/React Native app shell and feature UI.
- `packages/domain`: Shared domain types/logic, platform-agnostic.
- `packages/ui-tokens`: Shared design tokens and theme contracts.
- `packages/ui-primitives`: Reusable UI primitives and state components.
- `packages/runtime`: Runtime/env validation and app bootstrap config.
- `packages/supabase-clients`: Supabase client factories/wrappers.
- `supabase`: SQL migrations, RLS policies, schema docs.

Disallowed:

- Direct imports from one app to another (if a second app ever exists again).
- Feature logic implemented under root-level ad hoc folders.

Allowed import directions:

- `apps/*` -> `packages/*`
- `packages/ui-primitives` -> `packages/ui-tokens`
- `packages/supabase-clients` -> `packages/runtime`

Disallowed import directions:

- `packages/*` -> `apps/*`
- `packages/domain` -> UI packages

## 3. Layering Rules

Every feature should map to the following layers:

- `screen/page` layer: layout + view composition only.
- `hooks/controllers` layer: UI orchestration and view state.
- `services/data` layer: network/Supabase calls and mapping.
- `domain` layer: business types/invariants and pure functions.

Rules:

- Do not call Supabase directly from screen/page components.
- Keep domain functions side-effect free.
- Do not place RLS assumptions in UI; enforce in SQL policies.

## 4. Naming, File Size, and Ownership

Naming:

- Components: `PascalCase.tsx`
- Hooks: `useXyz.ts`
- Services: `xyzService.ts`
- SQL migrations: timestamp prefix + snake_case description.

File size limits:

- Target <= 250 lines per source file.
- Hard limit 400 lines; split file when exceeded.

Ownership:

- Each major folder must include `README.md` with purpose + boundary rules.

## 5. Schema, Migration, and RLS Standards

**CRITICAL: Migrations and RLS policies are the hardest class of change to fix once deployed. A bad migration requires data surgery. A misconfigured RLS policy silently leaks cross-household data. Treat every schema/RLS change as a production deploy.**

Agent obligations (non-negotiable):
- Read the full migration file before applying.
- After every apply: verify via `list_migrations`, `list_tables` (RLS enabled), and `pg_policies` count.
- Write and run a denial test for every new RLS policy before closing the ticket.
- Never assume it worked — prove it.

Schema rules:
- SQL migrations are single source of truth for schema changes.
- All primary keys are UUID unless documented exception.
- All tables include `created_at` and `updated_at` timestamptz.
- Add indexes for foreign keys and frequent filters.
- Enable RLS on all household-scoped tables.

Function / RPC rules (enforced by `scripts/check-migrations.mjs`):
- **No overloaded public functions.** PostgREST resolves `.rpc("name", {...})` by name; two
  signatures (e.g. `f(text)` and `f(text, text default ...)`) make a call ambiguous —
  *"Could not choose the best candidate function"*. `CREATE OR REPLACE` with a NEW signature
  does **not** drop the old one. When changing a function's parameters, `DROP FUNCTION` the old
  signature in the same migration, or keep one signature and use a default-valued parameter.
- After deploying a function change, verify `pg_proc` has exactly one live signature for that name.
- Every `.rpc("name")` in app source must resolve to a defined function (the guard checks this too).

RLS conventions:
- Policies must deny cross-household reads/writes by default.
- Prefer explicit `USING` and `WITH CHECK` clauses.
- Keep policy names deterministic: `<table>_<action>_<scope>`.

## 6. Supabase Access Patterns

- Mobile app uses the mobile client factory (`@hiro/supabase-clients`) with secure persistence.
- Never expose service-role keys in app bundles.

## 7. UX State Standards

Every user-facing async screen must define:

- `LoadingState`
- `EmptyState`
- `ErrorState`

Rules:

- No silent failures.
- Empty states include guidance to recover or proceed.
- Error states include retry affordance when safe.

## 8. Design System Standards

- Use tokens from `packages/ui-tokens`; no hardcoded feature-level color/spacing/radius values.
- Use primitives from `packages/ui-primitives` where available.
- New primitives target React Native (mobile-only product); web equivalents are not required.
- App-level UI in `apps/*` must not introduce raw platform interactive elements (for example, web `<button>/<input>` or React Native `Pressable/TextInput/Switch/Modal`) when a design-system primitive is expected.
- If an app needs UI not present in `packages/ui-primitives`, implement the primitive in `packages/ui-primitives` first, then consume it from the app layer.

## 9. Web Boundary Standards (Retired)

The web app was removed in 2026-07 (history lives in git).
If web is ever revived: keep the server/client split explicit, never import server-only modules from browser code, and align route grouping to IA and tab structure.

## 10. Mobile Boundary Standards

- Navigation config must be centralized and typed.
- Screen files should compose primitives and hooks, not contain data-layer logic.
- Respect safe area and minimum touch targets.
- Expo native/prebuild commands must be executed from `apps/mobile` only.
- Root-level Expo artifacts are prohibited: `/android`, `/ios`, and root `app.json`.
- npm workspace installs must honor repo `.npmrc` policy (`legacy-peer-deps=true`) to prevent peer auto-install drift into Expo SDK-incompatible native dependency majors.

## 11. Agent Collaboration Rules

- Work one ticket at a time in dependency order.
- Stop after each ticket’s acceptance criteria and founder manual QA handoff.
- Do not implement downstream tickets before upstream ticket sign-off.
- Link all architecture-impacting changes back to this standards doc.

## 12. Compliance Checklist (Required for every ticket/PR)

- [ ] Folder/module placement follows approved boundaries.
- [ ] Import directions conform to allowed graph.
- [ ] Loading/empty/error states considered and implemented or explicitly N/A.
- [ ] Schema/RLS changes documented and migration updated (or explicitly N/A).
- [ ] Design tokens/primitives used (or documented exception).
- [ ] Runtime/env impact documented.
- [ ] Docs updated (`README`, standards links, or package ownership docs).
- [ ] Founder QA stop-point acknowledged before closure.

## 13. Allowed and Disallowed Examples

Allowed:

- `apps/mobile` imports `packages/domain` types.
- `apps/mobile` uses `packages/ui-primitives` `Button`.
- New table includes UUID PK + timestamps + RLS.

Disallowed:

- `packages/domain` importing `@hiro/ui-primitives` or `@hiro/ui-tokens`.
- Hardcoded `#ff0000` inside feature components.
- Supabase query directly in a screen component (belongs in `src/lib/*Service.ts`).

## 14. Emergency Deviation Process

Allowed only for production-critical unblockers.

Requirements:

1. Document deviation in PR description with reason and risk.
2. Create follow-up cleanup ticket before merge.
3. Add TODO marker referencing cleanup ticket ID.
4. Resolve deviation within one sprint.

## 15. Change Management

- Update this file whenever standards evolve.
- Any conflicting guidance in other docs is invalid.
- Major standard changes require explicit founder acknowledgment.
