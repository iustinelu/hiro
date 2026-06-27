# 02 - Web tab navigation lag ~500ms (HIR-65)

**Ticket:** HIR-65  **Branch:** `hir-65/web-tab-lag`  **Worktree:** `../hiro-web-tab-lag`
**Platforms:** web  **Size:** M  **Group:** 1 (parallel-safe; **merge early** - touches `(tabs)/layout.tsx`)

## Problem
Switching tabs on web blocks for ~500ms and feels sluggish. Likely culprits: synchronous data fetching on the critical path, heavy re-renders, or missing prefetch/memoization in the tab shell.

## Investigate first (systematic-debugging - reproduce before fixing)
1. Reproduce with Playwright: navigate the web app, measure tab-switch time (e.g. `performance.now()` around clicks, or trace), confirm the ~500ms.
2. Inspect `apps/web/src/app/(tabs)/layout.tsx`, `tabs-layout.module.css`, `HouseholdProvider.tsx`, and each tab's `page.tsx` data fetching. Find what blocks paint on switch.

## Do
- Remove the blocking work from the navigation critical path. Options, pick what the evidence supports: Next.js route prefetch, `loading.tsx`/Suspense boundaries so the shell paints instantly, memoizing the provider, moving fetches off the synchronous path, or caching already-loaded tab data.
- Don't regress data freshness (tabs still show current data) or the theming.

## Acceptance
- Tab switches feel instant (target < ~100ms to first paint of the new tab).
- Prove it: before/after timing numbers captured via Playwright in the handoff.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green); `npm run dev:web`.
- **Route:** sign in -> click rapidly between Home/Tasks/Progress/Budget/Rewards/More.
- **Look for:** no visible freeze/lag on switch; data still loads correctly.
- **Pass/fail:** Pass = snappy switching, before/after numbers show clear improvement, no data regression. Fail = still laggy or data missing.
