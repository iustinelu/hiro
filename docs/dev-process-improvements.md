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

## 2026-06-27 — v0.1.3 release session

- **Agent code review caught 4 real bugs before merge** — ran a `code-reviewer` subagent over the
  full branch diff; it found a redeem-celebration animation restarting on re-render (unstable
  `onComplete` dep, no cleanup), a tour baseline that went stale on mid-flow Replay, a modal that
  wiped user input on a realtime balance change, and a spotlight ring snapping from mid-pulse. All
  fixed pre-merge — the "auto-run /review" idea above, now proven worth doing every release.
  Caveat: the reviewer's *suggested* fix for the baseline bug was itself wrong (it would have
  blocked forward advancement), so review output still needs a sanity pass, not blind application.
- **Single-Metro-on-8081 discipline** — a stale Metro from another worktree on 8081 serves the wrong
  JS bundle, so every on-device fix "looks missing." Always `fuser -k 8081/tcp` then start Metro
  from the active worktree before QA. Cost ~an hour of confusion before it was spotted.
- **KeyboardAvoidingView `behavior="height"` loops on Android** — it resizes its container, and any
  keyboard *size* change (e.g. QWERTY→numeric) retriggers the measure → endless flicker. Use
  `behavior="padding"` for bottom-sheet modals; it insets instead of resizing and is stable.
- **Cross-tab tour state** — a guided tour spanning tabs needs its step in shared context (the
  provider), not local screen state; each screen renders the coaching card only for the steps it
  owns and advances on real data deltas snapshotted on step-entry (not per-render).
- **Emulator harness still down** (node_modules SDK-54 skew → red-screen on launch); real-device QA
  on the Pixel is the only reliable surface. Worth fixing the harness as a separate task.

## 2026-07-06 — repo-health overhaul (4-PR stack, PRs #53–#59)

A full A-Z health audit (three parallel Explore agents: architecture, CI/deploy, docs) drove a
sequenced set of fixes. Process learnings worth keeping:

- **CI ran a strict subset of `npm run check`** (6 of 8 gates); the two skipped guards
  (`check:expo-root-artifacts`, `check:mobile-runtime`) are exactly the ones that encode the
  Play Store crash class. CI now runs `npm run check` verbatim, so local and CI can never diverge
  again. Lesson: when a pre-commit chain and CI list steps separately, they *will* drift — have CI
  call the one orchestrator.
- **A scrapped process outlived its removal in the enforced layer.** `pr-governance` was deleted in
  June, but `scripts/check-governance.mjs` still *required* the governance docs to exist and forced
  `AGENTS.md` to reference a `pr:validate` script that no longer existed — so the CI gate actively
  kept dead instructions alive and a cold-start agent was routed to a command that hard-fails.
  Lesson: when you kill a process, grep the enforcement (`check-*.mjs`) in the same change, not just
  the docs.
- **Audit findings need verification, not blind application.** The architecture audit flagged
  "empty catch blocks swallowing write failures" in modal submit handlers — but those `catch {`
  blocks all call `setError(...)`; the finding matched *catch-without-binding*, not empty bodies.
  Applying the "fix" would have been churn. Always confirm a finding against the real code.
- **Migration drift is real and structural here.** The live DB had 2 migrations not in the repo
  (a sibling v0.1.4 worktree ahead of merge — the normal pattern) and 15 historical files whose
  timestamps never matched the applied versions. New `check-migration-drift.mjs` compares by
  migration *name*, **fails** only on committed-but-not-applied, and **warns** on
  applied-but-not-committed so it never breaks the parallel-worktree flow.
- **Stale credentials in docs point at ghosts.** The documented QA account `apple@test.com` did not
  exist in the DB; the real onboarded account was `alex.dogfood.0627@gmail.com`. Verifying against
  the live DB (not the doc) found it. Creds moved to gitignored `.secrets/qa-account`; the plaintext
  password + wrong email were removed from the committed doc.
- **New guardrails added** (the "cheapest guardrail for the bug class" habit): a boundary rule
  forbidding raw `supabase.*` calls outside `apps/mobile/src/lib` (the leak was copy-pasted into 8
  screens), a version-parity gate (root `package.json` vs `app.json`), Dependabot (weekly, expo/RN
  majors ignored), and the first real service-layer test coverage (39 → 88 tests).

### Founder follow-ups from this session
- Add a `SUPABASE_PAT` GitHub Actions secret so the migration-drift check runs in CI (it skips
  gracefully until then).
- `main` is still unprotected (CI is advisory) — deliberate for now; revisit if the team grows.
- Deep-link config still ships the `hiro.example.com` placeholder (founder-gated domain decision).
- The emulator QA harness is still broken (SDK-54 skew) — physical Pixel remains the QA path.
