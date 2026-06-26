# Dev process improvements — the 1% log

A standing ritual: **every working session leaves the development process at least 1% better.**
The goal is compounding leverage — more of our quality bar enforced automatically, more of what
agents build verified by agents, less that depends on a human remembering to check. When you fix a
bug, also ask: *what guardrail would have caught this class of bug, and can I add it cheaply now?*

Bias toward 80/20: a small Node check script, a unit test on a pure function, or a documented gate
beats a heavyweight framework. Append an entry below each session.

## How to add an improvement
1. Identify a recurring friction or a bug *class* (not just the instance).
2. Add the cheapest durable guardrail: a `scripts/check-*.mjs`, a unit test, a CI step, or a
   documented mandatory gate.
3. Wire it into `npm run check` and/or CI so it runs without anyone remembering.
4. Log it here with the date, what it prevents, and where it lives.

---

## Log

### 2026-06-26
- **Migration overload guard** — `scripts/check-migrations.mjs` (in `npm run check` + CI).
  Prevents the `create_household` ambiguity class: forbids >1 live signature per public function
  and verifies every `.rpc("name")` call resolves to a defined function. Caught the live bug in a
  negative test.
- **Mobile native-dependency guard** — `scripts/check-mobile-runtime.mjs` now fails if any
  `expo-*`/`@expo/*`/`react-native-*` package imported in `apps/mobile/src` (or named in `app.json`
  plugins) isn't declared in `apps/mobile/package.json`. This is the **actual** guardrail for the
  Play Store crash: `expo-web-browser` lived in the root package.json, so its native module wasn't
  autolinked into the standalone build → "Cannot find native module 'ExpoWebBrowser'" on launch.
  Only ever crashes in a standalone build (Expo Go bundles all SDK modules), so a static check is
  the only thing that catches it pre-build. Confirmed via on-device `adb logcat`.
- **Fail-soft runtime env** — `apps/mobile/src/lib/supabase.ts` no longer throws at module load;
  the entry shows a "Configuration error" screen instead of crashing. Defense-in-depth against a
  missing-`EXPO_PUBLIC_*` release build (was an early hypothesis for the crash above; ruled out by
  AAB inspection, but the hardening is worth keeping).
- **First real unit tests + Vitest** — `npm run test` now runs Vitest (was a placeholder).
  `validateRuntimeEnv` and `formatCurrency` covered. CI runs tests on every PR.
- **Preview-before-production gate** — documented as mandatory in `docs/launch/README.md`: no store
  submission without an on-device check of an internal preview build first.
- **Automated store submission** — `eas.json` `submit.production` wired so `eas submit` uploads to
  Play / App Store with no manual console upload (one-time credential setup documented).

### Ideas backlog (pick one next session)
- Post-deploy DB assertion: query `pg_proc` for any RPC with >1 overload as a CI/cron check
  against the live project (catches drift the static migration scan can't see).
- Lightweight Playwright smoke for the web signup → create-household flow.
- A `check:rpc-params` that verifies `.rpc()` argument keys match the function's parameter names.
- Auto-run `/review` (agent code review) on every PR diff before founder QA.
