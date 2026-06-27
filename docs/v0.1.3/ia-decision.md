# Hiro v0.1.3 - Information Architecture Decision

Status: Proposed (research + design only, no code in this doc)
Author: IA research agent
Date: 2026-06-27
Scope: Where ad-hoc tasks, the activity board/history, interactive onboarding, and push-notification entry points live in the app's navigation; whether the canonical tab set changes; and the one-vs-many household decision (HIR-73).
Related tickets: HIR-67 (one-off backlog), HIR-70 (ad-hoc tasks + contest/settle + activity board), HIR-73 (one vs. many households).

---

## 1. Current IA summary (verified against code)

The canonical tab set is defined once in `packages/domain/src/index.ts` as `appShellSections` and consumed by both platforms, so there is a single source of truth for navigation:

```
home  | tasks | progress | budget | rewards | more
/home | /tasks| /progress| /budget| /rewards| /more
```

- Web consumes it in `apps/web/src/app/(tabs)/layout.tsx` (desktop left rail + mobile bottom tab bar + mobile header, all driven by `appShellSections.map(...)`).
- Mobile consumes it in `apps/mobile/src/navigation/AppTabs.tsx` via `appShellSections.map(...)` over a `createBottomTabNavigator`, with `mobileTabs = appShellSections` re-exported in `apps/mobile/src/navigation/tabs.ts`.
- Icons are keyed by section `id` through `WebIcon`/`MobileIcon` (`name={section.id}`). Per the brief, labels and iconography are finalized and out of scope.

What each section does today:

| Section | Role today |
|---|---|
| home | Daily driver: greeting, today's recurring tasks (complete + undo with points burst), streak, mini leaderboard, quick "+ Add task". This is where completing happens. |
| tasks | Task management: "Today" (read-only list) + "All Tasks" (CRUD: create/edit/archive recurring tasks). Completing is intentionally on Home, not here. |
| progress | Weekly trend chart, personal stats grid, task breakdown, leaderboard. |
| budget | Expenses + equal split + month summary. |
| rewards | Create / redeem / balance + redemption feed. |
| more | Household + members, invites (owner), theme switcher, account (display name, sign out). This is the de-facto Settings + Household tab. |

Key data facts that constrain the design:
- `activity_events` already exists (`20260314000000_activity_events.sql`): `profile_id`, nullable `household_id`, `event_name`, `metadata jsonb`, `created_at`. RLS is currently **own-rows-only** (insert/select gated on `profile_id = current_profile_id()`). It is used today only for private diagnostics (`tab_viewed`), via fire-and-forget `logActivity(...)`. It is **not** a household-visible feed today.
- A user belongs to **at most one** household today. `HomeScreen` and `MoreScreen` both do `household_members ... limit(1)`, and `accept_invite_and_leave` (`20260412120000`) implements join-new = leave-old, with owner-transfer-to-oldest-member and delete-if-empty already handled server-side.
- Recurring tasks live in `recurring_tasks` + `task_completions`. There is no table yet for one-off/ad-hoc tasks or for contest/settle.

Competitive patterns (brief, for orientation, not to copy): OurHome is the closest analog (assign tasks, earn points, redeem rewards) and keeps a single chore surface plus a points/activity view. Cozi splits by artifact (To-Do, Shopping, Calendar, Recipes) - more lists, more tabs. Tody is room-based "cleaning health," not points. The relevant lesson: points-driven family apps converge on **one place to do/claim work** plus **one shared activity surface for fairness/transparency**, and they avoid proliferating top-level tabs. Hiro should follow that convergence rather than Cozi's list-per-tab sprawl.

---

## 2. Options considered

### 2.1 Where do ad-hoc / one-off tasks live?

Ad-hoc work has two distinct sub-features that the tickets bundle:
- HIR-67: a **claimable backlog** of one-off chores ("fix the tap") that anyone can pick up and complete for points.
- HIR-70: **self-logged ad-hoc tasks** ("I just did X, worth N points") with a **contest/settle** flow (claim -> dispute -> resolve).

Both are conceptually "tasks that are not on a schedule." The question is purely placement.

**Option A - New top-level tab (e.g. "Activity" or "Board").**
Pros: maximum discoverability; clean home for the contest/settle feed.
Cons: pushes the tab set to 7, which is over the comfortable 5-tab thumb-reach limit on mobile (current 6 already lives partly behind "More" conceptually). Splits "tasks" across two tabs (recurring in Tasks, one-off in a new tab) - the single worst outcome for a user's mental model of "my chores."

**Option B - Merge into the existing Tasks tab (recommended).**
Make Tasks the single home for *all* task types via a segmented control: `Today | Backlog | All`. Recurring CRUD stays under "All"; the claimable one-off backlog (HIR-67) becomes the "Backlog" segment; ad-hoc self-log is a creation mode in the existing create modal (a "one-off / I just did this" path that sets a self-assigned point value and skips cadence).
Pros: one mental model ("everything I could do is in Tasks"); reuses `TasksManager` (web) / `TasksScreen` (mobile), the segmented control already used there, and the existing create modal; zero new tabs; Home stays the curated "today" driver and can surface a few claimable backlog items inline.
Cons: Tasks screen grows in responsibility (mitigated by segments).

**Option C - Put ad-hoc on a Home surface only.**
Pros: discoverable on the daily driver.
Cons: Home is already dense; backlog management (claim/edit/resolve) is heavier than Home should carry. Good for *surfacing*, wrong as the *home* of the feature.

**Decision: Option B**, with a light touch of C (Home shows a small "Up for grabs" strip of claimable backlog items that deep-links into the Tasks > Backlog segment).

### 2.2 Where does the activity board / history feed live?

The activity board (HIR-70) is the **household-visible, chronological feed** of who did what, points awarded, and the contest/settle state of each entry. This is distinct from `progress` (which is aggregate analytics: charts, stats, leaderboard). The feed is event-level and social; progress is summary-level and quantitative.

**Option A - New "Activity" tab.** Clean, but again 7 tabs.

**Option B - Inside Progress (recommended).** Progress becomes the "fairness & transparency" tab: add a segmented control `Trends | Activity`. "Trends" is today's chart/stats/leaderboard; "Activity" is the chronological household feed (completions, ad-hoc logs, contests, settlements, redemptions, joins/leaves). This keeps the conceptual pairing "how are we doing (trends) / what happened (activity)" in one tab, and the contest/settle actions live where the points narrative already lives.
Pros: no new tab; Progress is the natural home for "where did these points come from"; contest/dispute buttons sit next to the leaderboard they affect.
Cons: Progress carries two modes (acceptable - it is currently a light tab).

**Option C - Inside Home.** Too much for the daily driver; the feed is reference/audit, not daily action.

**Option D - Inside More.** Buries a social, high-engagement surface in a settings drawer. Rejected.

**Decision: Option B.** The activity board is the **"Activity" segment of the Progress tab**. The contest/settle controls render on each feed row.

### 2.3 Should the canonical tab set change?

**Considered:** adding a 7th tab; renaming Progress to "Activity"; collapsing two existing tabs to make room.

**Decision: keep the 6 tabs unchanged.** Both new feature areas slot into existing tabs (ad-hoc -> Tasks, activity board -> Progress) via segmented controls, a pattern already proven in `TasksManager` (`WebSegmentedControl`) and trivially mirrored on mobile. Changing `appShellSections` would ripple through both platforms' nav, icon mapping, and the finalized iconography - high cost, no IA benefit. The 6-tab set is the right ceiling; the discipline for v0.1.3 is "absorb into existing tabs, do not grow the bar."

---

## 3. Recommendation - the canonical IA for v0.1.3

**Tab set: unchanged (6).** `home | tasks | progress | budget | rewards | more`.

Per-tab responsibilities after v0.1.3:

| Tab | v0.1.3 responsibility | New in 0.1.3 |
|---|---|---|
| home | Daily driver. Today's recurring tasks + complete/undo + streak + mini leaderboard. Adds a small **"Up for grabs"** strip (top 2-3 claimable backlog items) that deep-links to Tasks > Backlog. Onboarding launches over Home for new users. | Up-for-grabs strip; onboarding entry |
| tasks | All task types. Segmented: **Today \| Backlog \| All**. "Backlog" = claimable one-off chores (HIR-67). Create modal gains a **one-off / "I just did this"** mode (self-assigned points, no cadence) feeding either the backlog or a direct ad-hoc log. | Backlog segment; one-off create mode |
| progress | Fairness & transparency. Segmented: **Trends \| Activity**. "Activity" = household feed with contest/settle (HIR-70). | Activity feed + contest/settle |
| budget | Unchanged. | - |
| rewards | Unchanged. | - |
| more | Settings + Household hub. Adds **Notifications** settings row/section and an **onboarding replay / help** entry. | Notification settings; replay onboarding |

Segmented-control convention: reuse the existing `WebSegmentedControl` on web; mirror with the established mobile segmented pattern. Default segment is always the leftmost/most-actionable (Tasks -> Today, Progress -> Trends) so existing muscle memory is preserved.

Cross-surfacing (so features are discoverable without new tabs):
- Home -> "Up for grabs" strip -> Tasks > Backlog.
- Progress > Activity rows that need action (a contest awaiting your response) -> optionally a Home banner ("1 points dispute needs you") that deep-links into Progress > Activity.

---

## 4. Per-feature placement (build-agent-ready)

### 4.1 Ad-hoc / one-off tasks (HIR-67 + HIR-70)
- **Primary home:** Tasks tab.
  - Web: extend `apps/web/src/app/(tabs)/tasks/TasksManager.tsx` `SEGMENTS` from `[Today, All]` to `[Today, Backlog, All]`. Add a `BacklogView` sibling to `TodayView`/`AllTasksView`.
  - Mobile: mirror in `apps/mobile/src/screens/TasksScreen.tsx`.
- **One-off creation:** extend the existing create modal (`apps/web/src/app/(tabs)/tasks/TaskCreateModal.tsx` and `apps/mobile/src/screens/TaskCreateModal.tsx`) with a task-type toggle: "Recurring" (current) vs "One-off." One-off hides cadence, shows a self-assigned points field, and a target (post to Backlog for someone to claim, or log as already-done ad-hoc).
- **Claim / complete:** Backlog items are claimable by any member; completing awards the points to the claimer. Reuse the points-burst pattern from `HomeDashboard`/`HomeScreen`.
- **Home surfacing:** add an "Up for grabs" section to `HomeDashboard.tsx` / `HomeScreen.tsx` showing the top few unclaimed backlog items, linking to Tasks > Backlog.
- **Data note (for the schema agent, not decided here):** needs a one-off/ad-hoc task table distinct from `recurring_tasks` (or a `kind` discriminator), plus claim state and self-assigned points. The contest/settle state belongs with the ad-hoc log entry (see 4.2).

### 4.2 Activity board / history feed + contest/settle (HIR-70)
- **Primary home:** Progress tab, new **Activity** segment.
  - Web: add a segmented control to `apps/web/src/app/(tabs)/progress/ProgressDashboard.tsx` (`Trends | Activity`); "Trends" wraps today's chart/stats/leaderboard, "Activity" is a new `ActivityFeed` component.
  - Mobile: mirror in `apps/mobile/src/screens/ProgressScreen.tsx`.
- **Feed contents:** completions (recurring + ad-hoc), ad-hoc self-logs with their points, contest opened/resolved, redemptions, member join/leave. Each row shows actor, action, points delta, time, and - where applicable - **Contest** / **Resolve** controls.
- **Contest/settle UX:** inline on the row. Claim (the self-log) -> any member can Dispute within a window -> resolution (founder to decide rule in §6) -> points finalize. Disputed rows are visually flagged; a pending dispute can raise a Home banner.
- **Important data caveat (flag to schema/RLS agent):** the existing `activity_events` table is **own-rows-only RLS** and used for private diagnostics. The household-visible board should **not** reuse that table as-is. Either (a) a new `household_feed` table with household-scoped RLS (`household_id in current_household_ids()`), or (b) relax/duplicate with care. Do not silently widen `activity_events` RLS - that would expose every user's private `tab_viewed` diagnostics to the whole household. Recommended: a new purpose-built feed/ledger table; keep `activity_events` for diagnostics.

### 4.3 Interactive onboarding (guided gamified first-win)
- **Entry point (new user):** launches automatically over the **Home** tab on first run after the user has a household (Home is already the "first win" surface - complete a task, see the points burst). It should culminate in the user completing or claiming their first task so the gamified payoff is real, not simulated.
  - Mobile: trigger from `HomeScreen` bootstrap (it already resolves `profileId` + `householdId`); gate on a per-profile "onboarding_completed" flag.
  - Web: trigger from `HomeDashboard` / the `(tabs)` layout for the home route.
- **Pre-household:** the existing `HouseholdOnboardingScreen` (mobile) and web onboarding/invite routes already handle create/join; the interactive gamified onboarding is the *step after* a household exists.
- **Replay/help entry:** a "Replay tour" / "How Hiro works" row in **More** so users can re-trigger it (and so QA/founder can demo it).
- **Persistence note:** store the completion flag on the profile (a `profiles` column or a settings record) so it does not retrigger across devices.

### 4.4 Push notifications (entry points / settings)
- **Settings home:** a **Notifications** section in the **More** tab (More is the established settings hub - theme, account, household). Per-category toggles (e.g. task reminders, points contested, reward redeemed, someone joined). Reuse `MobileCard` + `MobileListRow` pattern already in `MoreScreen`.
- **Permission prompt:** request OS notification permission contextually - ideally at the end of interactive onboarding ("Want a nudge when chores are due?"), not cold on first launch. This maximizes opt-in and ties the prompt to demonstrated value.
- **No new tab.** Notifications are settings, not a destination.
- **Mobile-first:** Expo push (mobile) is the priority; web push is out of scope for 0.1.3 unless trivially free.

---

## 5. One vs. many households per user (HIR-73)

**Recommendation: keep ONE household per user for v0.1.3** (confirming the founder's lean), but make the join flow safe and reversible-feeling, because the current behavior is a silent data-loss footgun.

Why one:
- The entire data model and both clients already assume one household (`limit(1)` membership lookups in `HomeScreen`/`MoreScreen`; no active-household switcher anywhere). Going many-household would require a household switcher in the nav shell, household-scoped state across every tab, and per-household leaderboards/budgets/rewards - a large surface change that does not earn its keep for a v0.1.3 consumer app.
- The fairness loop (points, streaks, leaderboard, budget split) is only meaningful **within a single shared household**. Multi-household dilutes the core identity ("my household standing").
- `accept_invite_and_leave` already encodes the one-household invariant server-side (leave old, transfer ownership, delete-if-empty). The plumbing is consistent with "one."

The real problem to fix is not "one vs many" - it is that **switching households silently destroys the old one's data with no warning**. Nav/flow implications:

1. **Add an explicit, scary-by-design confirmation** to the accept-invite flow when the user is already in a household. Surface exactly what `accept_invite_and_leave` returns/does:
   - "You are about to leave **{old_household_name}** and join **{new}**."
   - If the user is the sole member: "**{old} and all its tasks, points, and history will be permanently deleted.**" (this is the `old_household_deleted = true` path).
   - If the user is the owner with other members: "Ownership of **{old}** will transfer to another member." (the owner-transfer path).
   - Require explicit confirm; this is the one place data loss happens.
2. **Make "leave household" a first-class, visible action** in More (today there is sign-out but no explicit leave). Same confirmation copy as above.
3. **No household switcher** in the tab shell - there is nothing to switch between. Keep the nav clean.
4. Keep the door open: the membership model is a join table (`household_members`), so a future move to many-households is not blocked - it is a deliberate later decision, not something we foreclose. The `current_household_ids()` helper is already plural-shaped, which is convenient if we ever revisit.

Net: one household, but the join/leave flow gets a mandatory data-loss confirmation and an explicit Leave action. This removes the footgun without the cost of multi-household IA.

---

## 6. Open questions for founder

1. **Contest/settle resolution rule.** Who resolves a disputed ad-hoc points claim - household owner decides, majority vote, or auto-revert to a default value after a timeout? This drives the feed UX and the schema.
2. **Ad-hoc points caps.** Should self-assigned points have a max (or a per-day budget) to prevent gaming the leaderboard? Affects the create modal validation.
3. **Backlog vs. ad-hoc-log distinction in UX.** Confirm the two HIR-67 / HIR-70 modes ("post a claimable chore" vs "log something I already did") should share one create modal with a toggle, vs. two separate entry points.
4. **Activity feed scope.** Should redemptions and member join/leave appear in the Activity feed, or only task/points events? (Recommendation: include them - it is the household's shared timeline.)
5. **Onboarding trigger timing.** Auto-launch the interactive tour on first Home visit (recommended), or make it an opt-in card the user taps?
6. **Notification permission timing.** Confirm the prompt should come at the end of onboarding rather than on first launch.
7. **Leave-household placement.** Confirm an explicit "Leave household" action in More is wanted now (recommended), independent of the invite-accept confirmation.
8. **Web push.** In or out of scope for 0.1.3? (Recommendation: out; mobile-only.)

---

Founder sign-off:
