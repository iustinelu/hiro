# 12 - Critical-path test coverage + error-code enums

**Ticket:** (quality) - "Test coverage for critical paths + error enums"
**Branch:** `chore/test-coverage-error-enums`  **Worktree:** `../hiro-test-coverage`
**Platforms:** packages + services  **Size:** M  **Group:** 4 (**merge AFTER brief 08** - both touch `domain/src/index.ts`)

## Why
Audit found near-zero automated coverage (only `formatCurrency` + `validateRuntimeEnv`) and a fragile pattern: service error codes are **magic strings** (e.g. `"INSUFFICIENT_POINTS"`) matched by substring, so a typo silently breaks client error handling. We want agents (and us) to trust green = shippable.

## Do
1. **Error-code enums:** introduce a shared enum/const in `packages/@hiro/domain/src/index.ts` for service error codes (INSUFFICIENT_POINTS, ALREADY_IN_HOUSEHOLD, PARTICIPANT_NOT_HOUSEHOLD_MEMBER, etc.). Replace magic strings in web + mobile services with the enum. Add a unit test asserting client error mapping uses the enum (typo can't silently pass).
2. **Highest-ROI unit tests** (Vitest, co-located `*.test.ts`, per the existing setup in `vitest.config.ts`):
   - expense split math: 2/3/4-way + odd amounts sum exactly to the total (locks in the remainder logic at `20260407...sql:142-151`).
   - reward redemption balance guard (insufficient points rejected).
   - points/streak date math edge cases (`getStreak`).
   - the 5-minute undo window boundary (just-inside vs just-outside).
   - any pure domain helpers currently untested.
3. Keep tests fast + deterministic (no real network; mock the Supabase client where needed). They must run under `npm run test` / `npm run check`.

## Acceptance
- Error codes are enums shared across domain + both clients; no magic-string matching remains in services.
- New unit tests cover split math, redemption guard, streak, undo window; all green in `npm run check`.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green) and `npm run test` (all pass, new tests visible).
- **Route:** N/A (test/code-quality task). Review the test list + the enum refactor in the diff.
- **Look for:** meaningful new tests for the named critical paths; no remaining magic-string error matching.
- **Pass/fail:** Pass = enums in place + new tests green + no string matching. Fail = strings remain or tests thin/flaky.
