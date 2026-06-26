# Polish Item 2 — Tab icons (HIR-61 + HIR-62)

> You are the dedicated agent for this item. Implement **only** this scope. Work in an isolated git worktree. Do **not** merge until the founder signs off.

## Protocol (every polish item)
1. Create a worktree off the latest `main`:
   `git worktree add ../hiro-tab-icons -b hir-62/tab-icons main`
2. Implement only this item. Match surrounding code style. Respect THE THEMING RULE (themed color/elevation/radius/typography.fontFamily must be reactive — web `cssColor/...`/`cssFontFamily`, mobile `useTheme()`; enforced by `scripts/lint.mjs` in `npm run check`).
3. Run `npm run check` from repo root until green **before** reporting done. Smoke-run `npm run dev:web` and `npm run dev:mobile`.
4. Report done with the Founder QA Quick Cycle below filled in. **Do not merge until the founder signs off.**
5. On founder go: rebase on current `main`, re-run `npm run check`, merge to `main`, then `git worktree remove ../hiro-tab-icons`.

## Goal
Replace placeholder tab glyphs (web emoji, mobile `●`/`○`) with real production icons routed through the design-system `IconName` primitive, on both shells, with active/inactive states. Also closes HIR-61 (confirm + document the canonical tab IA).

## Current state
- Tab IA is already final: `appShellSections` in `packages/domain/src/index.ts:216` = home, tasks, progress, budget, rewards, more (`as const`). HIR-61 is a confirm-and-document, **not** a change to the section set.
- `IconName` union (`packages/ui-primitives/src/shared/types.ts:11`) has 11 names; `home` exists but `tasks/progress/budget/rewards/more` do **not**.
- `WebIcon` (`packages/ui-primitives/src/web/WebIcon.tsx`) maps `IconName`→`lucide-react` components, `strokeWidth={2}`.
- `MobileIcon` (`packages/ui-primitives/src/mobile/MobileIcon.tsx`) maps `IconName`→Ionicons glyph names.
- Web tabs render emoji from a local `TAB_ICONS` map in `apps/web/src/app/(tabs)/layout.tsx:13` (used in desktop rail :56 and mobile bar :87).
- Mobile tabs render `focused ? "●" : "○"` `<Text>` in `apps/mobile/src/navigation/AppTabs.tsx:92`. Active/inactive tint already wired via `tabBarActiveTintColor`/`InactiveTintColor`.

## Steps
1. **Extend `IconName`** in `packages/ui-primitives/src/shared/types.ts` with: `tasks`, `progress`, `budget`, `rewards`, `more`.
2. **Web map** (`WebIcon.tsx`): add lucide components — suggested `tasks: ListChecks`, `progress: BarChart3`, `budget: Wallet`, `rewards: Gift`, `more: MoreHorizontal` (home stays `House`). Adding to the union forces TS to require these here and in `MobileIcon` — that's the safety net.
3. **Mobile map** (`MobileIcon.tsx`): add Ionicons outline names — `tasks: "checkbox-outline"`, `progress: "stats-chart-outline"`, `budget: "wallet-outline"`, `rewards: "gift-outline"`, `more: "ellipsis-horizontal"`. Support active=filled via a `focused` path (see step 5).
4. **Web wiring** (`apps/web/src/app/(tabs)/layout.tsx`): delete the emoji `TAB_ICONS` map; render `<WebIcon name={section.id} ... />` in both nav loops. Section ids already equal the new `IconName`s. Drive size from the existing `fontSize:16` spots. Active emphasis already comes from `desktopLinkActive`/`tabLinkActive` CSS + `currentColor`.
5. **Mobile wiring** (`AppTabs.tsx`): replace the `<Text>●/○` `tabBarIcon` with `<MobileIcon name={route.name as IconName} color={color} />`. For outline→filled active treatment, either pass focused state into a small wrapper that swaps to the filled Ionicons glyph, or add a `filled?: boolean` prop to `MobileIcon` (and a matching no-op/fill on `WebIcon`) — keep the primitive API symmetric across platforms.
6. **Docs:** update the `IconName` table in `packages/ui-primitives/README.md:34` with the 5 new rows; add a one-line note that the canonical tab set is the 6 `appShellSections` (HIR-61 confirmed). No change to `appShellSections` itself.
7. Out of scope: HIR-60 (decoupling `@expo/vector-icons` from shared packages) — keep using the existing `MobileIcon`/Ionicons path.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green), then `npm run dev:web` and `npm run dev:mobile`.
- **Web:** desktop left rail + mobile bottom bar (narrow the window). **Look for:** each of 6 tabs shows its real icon (not emoji), active tab emphasized, icons re-tint on every theme switch (More → theme switcher).
- **Mobile:** bottom tab bar. **Look for:** real icons per tab, active tab filled + accent-tinted, inactive outline + muted, readable on all 4 themes.
- **Pass/fail:** Pass = no placeholder glyphs anywhere, icons theme-reactive, clear active/inactive states. Fail = any emoji/`●`/`○` remains or an icon doesn't re-skin.
