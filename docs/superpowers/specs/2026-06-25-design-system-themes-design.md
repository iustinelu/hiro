# Design System Overhaul + 4-Theme System

**Date:** 2026-06-25
**Status:** Approved (visual direction signed off via theme pitch artifact)
**Why:** The current look (flat navy `#0b0a14` + single orange `#ff6d24`, Inter, accent-bar-on-card) reads as generic/templated and isn't playful enough for a gamified household app. Before shipping to friends' phones we want a distinctive, premium, fun identity — and a user-facing theme system so each member can pick their vibe.

## Goal

Replace the single static theme with a **4-theme system** built on one token contract. Each household member picks their own theme (per-person, persisted to their profile). Themes swap token *values*, not components — so every screen on web and mobile inherits the look for free.

## The 4 themes

All four are documented as full palettes in the approved pitch. Aurora is the new default (elevated replacement for today's look); Daylight is the built-in light mode; the other two are opt-in personality.

| Theme | id | Vibe | Key values |
|---|---|---|---|
| **Aurora** | `aurora` | Elevated dark, premium + warm (DEFAULT) | bg `#15121f`/grad `#241a39`; ink `#f7f3ff`; muted `#a99fc6`; accent (action) `#ff7a59`; points-gold `#ffcf5c`; done-mint `#57e0c0`; rounded, soft glow, **no accent top-bar** |
| **Daylight** | `daylight` | Light, white + lime, airy | bg `#fbfcf6`→`#eef3e2`; card `#fff` border `#e7ecda`; ink `#18200f`; muted `#6c7860`; accent `#5a9e00`; points lime `#e7f7c2`/`#3f6212`; streak amber `#a35a00` |
| **Super Chore** | `superchore` | Retro 64-bit (NES world 1-1) | ground `#5c94fc`; ink `#0b0b14`; accent red `#e52521`; coin-gold `#fbd000`; green `#43b047`; card `#fdf6e3`, 3px black border, **hard pixel shadow `4px 4px 0`**, radius ~2–4, pixel/mono font, uppercase |
| **Neon Grid** | `neon` | Cyberpunk, bright on near-black | base `#070b16` + faint grid; ink `#eaf6ff`; muted `#6e86b8`; accent neon-orange `#ff6a1a`; cyan `#19e3ff`; blue `#2d6bff`; glass panels, **neon glow shadows**, radius 12, geometric font |

## Architecture

### Token contract (`@hiro/ui-tokens`)
Split tokens into **structural** (theme-invariant) and **themed**:
- **Structural (shared):** `spacing`, `size`, `motion.duration`, `motion.easing`, base `typography` *sizes/line-heights*.
- **Themed (per theme):** `color` (full palette, same keys as today), `radius` (scale — sharp for retro), `typography.fontFamily`/`fontFamilyMono` (pixel for retro, geometric for neon), `elevation` (soft / hard-pixel / neon-glow), and a few structural flags: `borderWidth`, `cardAccentBar: boolean`, `textTransform`.

```ts
export type ThemeId = "aurora" | "daylight" | "superchore" | "neon";
export interface Theme { color: ColorScale; radius: RadiusScale; typography: Typo; elevation: Elevation; flags: ThemeFlags; }
export const themes: Record<ThemeId, Theme> = { aurora, daylight, superchore, neon };
export const DEFAULT_THEME: ThemeId = "aurora";
export const THEME_LABELS: Record<ThemeId,string> = { aurora:"Aurora", daylight:"Daylight", superchore:"Super Chore", neon:"Neon Grid" };
```
Keep a back-compat `export const tokens = { ...structural, ...themes.aurora }` so existing static imports keep compiling and render Aurora until migrated.

### Web (`apps/web`)
- Emit CSS variables **per theme**: `[data-theme="aurora"]{--hiro-…}` … for all four. Expand the var set beyond color to include `--hiro-radius-*`, `--hiro-font-family`, `--hiro-shadow-*` so retro/neon structural differences work.
- Set `data-theme` on `<html>` from the user's saved preference. SSR reads a `hiro-theme` cookie to avoid a flash; client syncs from the profile after auth.
- Components already use `var(--hiro-*)` → mostly inherit automatically; audit `.module.css` for hard-coded colors/radii and replace with vars.

### Mobile (`apps/mobile`)
- Make `MobileThemeProvider` hold the **active** theme and expose `useTheme()` (returns the active `Theme` merged with structural tokens). Provider reads saved preference, defaults to Aurora.
- **Migrate token consumers from the static `tokens` import to `useTheme()`** so switching re-renders. Priority order: (1) `@hiro/ui-primitives/mobile/*` components, (2) existing screens (Auth, Onboarding, More), (3) the 4 new feature screens are built theme-aware from the start. Components that stay on the static import simply render Aurora (safe fallback).
- Retro/neon structural bits (hard shadow vs glow, sharp vs round, pixel font) come from `theme.elevation`/`theme.radius`/`theme.typography` — no per-component conditionals.

### Persistence (per-person)
- Add `theme text not null default 'aurora'` to `profiles` (Supabase migration; check project is ACTIVE first, add denial test not needed — column on own profile, existing RLS covers it).
- `profileService`: `getTheme()`, `setTheme(themeId)` on both platforms.
- Web: also mirror to `hiro-theme` cookie for no-flash SSR. Mobile: also cache in SecureStore/AsyncStorage for instant load before network.

### Theme switcher UI
- A theme picker in the **More** tab (both platforms): 4 selectable swatches/cards showing each theme's name + mini preview; tap → `setTheme` → instant apply + persist.

## Fonts
- Retro pixel face and Neon geometric face are **bundled** (not CDN). Web: `@font-face` from `/public/fonts`; mobile: `expo-font` + asset. Until bundled, fall back to mono/system (matches the mockup). Bundling tracked as part of the build, not a blocker for wiring the system.

## Out of scope
- claude.ai/design sync (deferred — run after the system is built, per founder).
- Animated theme transitions (instant swap is fine for v1).

## Verification
- `npm run check` green.
- Web: switch all 4 themes from More → every tab reskins; no flash on reload (cookie); light theme (Daylight) has legible contrast.
- Mobile: switch all 4 from More → Home/Tasks/Progress/Budget/Rewards + Auth/Onboarding reskin live; relaunch persists choice.
- Founder QA on web + a device build.
