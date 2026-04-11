# v0.1 Sprint Plan — Ship to Friends

**Date:** 2026-04-11
**Goal:** Get Hiro into the hands of 5-10 test users ASAP.
**Skipping:** E7 (Commitments), E9 (MCP) — deferred to v0.2.

---

## Ticket 1: HIR-48 + HIR-49 — Rewards Marketplace

**Branch:** `hir-48/rewards-marketplace`
**Why:** Closes the motivation loop. Points are meaningless without something to spend them on.

### Schema

**`rewards` table:**
- id, household_id (FK cascade), title (text), point_cost (integer, check >= 1), is_archived (boolean, default false), created_by_profile_id (FK), created_at, updated_at
- RLS: all CRUD scoped to `current_household_ids()`
- Index: `(household_id)`

**`reward_redemptions` table:**
- id, reward_id (FK restrict), redeemed_by_profile_id (FK), household_id (denormalized), points_spent (integer), redeemed_at (timestamptz, default now()), created_at
- RLS: SELECT scoped to household. INSERT via RPC only.
- Immutable ledger — no UPDATE/DELETE
- Index: `(household_id, redeemed_at)`, `(redeemed_by_profile_id)`

**`redeem_reward(p_reward_id)` RPC:**
- SECURITY DEFINER. Validates reward exists, not archived, caller is household member
- Calculates user's current balance: `SUM(points_earned) FROM task_completions - SUM(points_spent) FROM reward_redemptions`
- If balance < reward.point_cost → raise `INSUFFICIENT_POINTS`
- Inserts into reward_redemptions
- Returns `{ points_spent, reward_title, remaining_balance }`

### Domain Types

```typescript
interface Reward {
  id: Uuid; householdId: Uuid; title: string; pointCost: number;
  isArchived: boolean; createdByProfileId: Uuid; createdAt: string; updatedAt: string;
}

interface RewardRedemption {
  id: Uuid; rewardId: Uuid; redeemedByProfileId: Uuid; householdId: Uuid;
  pointsSpent: number; redeemedAt: string; createdAt: string;
}
```

### Service: `rewardService.ts`

- `createReward(householdId, title, pointCost)` → insert
- `updateReward(rewardId, updates)` → update
- `archiveReward(rewardId)` → soft delete
- `getHouseholdRewards(householdId)` → list active rewards
- `redeemReward(rewardId)` → RPC call
- `getPointBalance(profileId, householdId)` → earned - spent
- `getRedemptionHistory(householdId)` → recent redemptions

### UI: "More" tab → Rewards section (or dedicated rewards page)

The "More" tab is currently a placeholder. Use it for rewards:
- Rewards list with point costs
- "Redeem" button (disabled if insufficient balance)
- "+ New Reward" creation modal (title + point cost)
- Current points balance displayed prominently
- Recent redemption history

### Key UX

- Balance shown at top: "You have 45 pts"
- Reward cards: title + cost badge + "Redeem" button
- Redeem confirmation: "Spend 20 pts on Movie Night?" → confirm
- Insufficient: button disabled, tooltip/badge "Need 20 more pts"
- After redemption: brief celebration animation (reuse PointsBurst)

---

## Ticket 2: HIR-64 — Google OAuth

**Branch:** `hir-64/google-oauth`
**Why:** Frictionless sign-in for test users. No password to remember.

### Supabase Config (manual)
- Enable Google provider in Supabase Auth dashboard
- Add Google OAuth credentials (Client ID + Secret from Google Cloud Console)

### Code Changes
- Add "Continue with Google" button to SignInForm + SignUpForm
- `authService.ts` → add `signInWithGoogle()` using `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Handle OAuth callback (Supabase handles redirect automatically)
- The `handle_new_user()` trigger already pulls `display_name` from metadata — Google OAuth populates `raw_user_meta_data` with the user's name automatically

### Files
- `apps/web/src/lib/authService.ts` — add `signInWithGoogle()`
- `apps/web/src/app/auth/sign-in/SignInForm.tsx` — add Google button
- `apps/web/src/app/auth/sign-up/SignUpForm.tsx` — add Google button
- Possibly `apps/web/src/app/auth/callback/route.ts` — OAuth callback handler

---

## Ticket 3: Visual Polish Pass

**Branch:** `hir-polish/visual-v01`
**Why:** First impressions matter. Use `/frontend-design` skill to elevate the UI.

### Focus Areas
- **Home tab** — make the task completion flow feel more premium (card depth, spacing, micro-interactions)
- **Onboarding** — welcoming, branded feel (not just form fields)
- **Tab icons** — replace text-only tabs with proper icons (HIR-62 from backlog)
- **Empty states** — each tab's empty state should be inviting, not bare
- **Loading states** — skeleton screens or branded spinners instead of text
- **Typography pass** — ensure heading hierarchy, spacing, line heights are consistent

### Approach
- Use `/frontend-design` skill for each major surface
- Focus on the 3 screens users see first: sign-in → onboarding → home
- Touch up remaining screens (tasks, progress, budget) for consistency

---

## Ticket 4: E10 — Distribution (HIR-52 + HIR-53)

**Branch:** `hir-52/distribution`
**Why:** Get it installed on phones.

- Configure iOS/Android app identity (bundle ID, app name, icons)
- EAS Build setup for internal distribution
- TestFlight / internal track setup
- Final smoke test checklist across web + mobile
- Share link with test group

---

## Execution Order

```
1. HIR-48+49 Rewards    → closes points loop (1 session)
2. HIR-64 Google OAuth   → unblocks easy sign-in (1 session)  
3. Visual polish pass    → premium feel (1 session)
4. E10 Distribution      → ship it (1 session)
```

Each ticket follows the proven one-shot workflow: read spec → explore → parallel subagents → `npm run check` → governance-valid PR → founder QA → merge.

---

## What's Already Done (for context)

✅ E0 Architecture governance
✅ E1 Design system + primitives
✅ E2 Platform + Supabase foundation
✅ E3 Auth + households + invites
✅ E4 Recurring tasks + points + animations
✅ E5 Progress hub (velocity, leaderboard, charts)
✅ E6 Budget + shared expenses + currency
✅ UX fixes (signup name, currency selector, undo, header cleanup)
