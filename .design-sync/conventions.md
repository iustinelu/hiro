## Hiro UI — how to build with this design system

Hiro is a household chore/task app. These are real, shipped React web components from `@hiro/ui-primitives/web`. Every component is already fully styled — your job is to **compose** them and add layout glue that uses the same theme tokens.

### Theming: no provider, CSS variables only
There is **no React context/provider** to wrap your app in. Components style themselves through CSS custom properties (`var(--hiro-color-*)`, etc.). Those variables are defined in the design system's `styles.css`, which you already receive — it sets every `--hiro-*` var on `:root` for **Aurora** (the default dark theme) and adds override blocks for the other themes:

- Default (no attribute) → **Aurora** (dark, orange accent)
- `<html data-theme="daylight">` → Daylight (light)
- `<html data-theme="superchore">` → Super Chore (retro, blocky, uppercase)
- `<html data-theme="neon">` → Neon Grid (cyberpunk)

Set `data-theme` on `<html>` (or any ancestor) to switch the entire UI; omit it for Aurora. Do not hardcode hex colors — read the tokens below so your UI re-themes with the components.

### Styling idiom: tokens, not classes
There are **no CSS classes and no `className` styling API**. You never style a library component yourself — pass only its documented props (`variant` / `tone` / `size` / `state` / etc.; see each `<Name>.d.ts`). For **your own** layout containers and decorative markup, use inline styles (or your own CSS) referencing these variables so they theme correctly:

- **Color** (`var(--hiro-color-…)`): `bg`, `bg-elevated`, `surface`, `surface-muted`, `surface-strong`, `ink`, `ink-muted`, `ink-soft`, `accent`, `accent-strong`, `accent-soft`, `accent-alt`, `border`, `border-strong`, `success`, `warning`, `error`, `info` (each of success/warning/error/info also has a `-soft` fill), `overlay`.
- **Radius** — emitted **unitless**, so wrap in calc: `borderRadius: "calc(var(--hiro-radius-lg) * 1px)"`. Scale: `sm md lg xl xxl pill`.
- **Shadow**: `var(--hiro-shadow-low | -mid | -high)`.
- **Font**: `var(--hiro-font-family)` (body), `var(--hiro-font-family-mono)`.

### Components (all from `@hiro/ui-primitives/web`)
Actions/inputs: `WebButton`, `WebInput`, `WebSwitchRow`, `WebSegmentedControl`, `WebDayChip`, `WebInteractiveChip`. Containers: `WebCard`, `WebChartContainer`, `WebModalSheet`, `WebListRow`. Data/status: `WebKpiTile`, `WebStatusBadge`, `WebPresenceAvatar`. Feedback: `WebEmptyState`, `WebErrorState`, `WebLoadingState`, `WebEmptyStatePanel`. Navigation: `WebNavigationPattern`. Reference showcases: `WebSpacingMatrix`, `WebIconographySpec`. Read each component's `.prompt.md` and `.d.ts` for its exact props before using it.

### Example
```jsx
import { WebKpiTile, WebButton, WebStatusBadge } from "@hiro/ui-primitives/web";

export function ChoresSummary() {
  return (
    <section
      style={{
        display: "grid",
        gap: 16,
        padding: 16,
        borderRadius: "calc(var(--hiro-radius-lg) * 1px)",
        background: "var(--hiro-color-surface)",
        border: "1px solid var(--hiro-color-border)",
        fontFamily: "var(--hiro-font-family)",
        color: "var(--hiro-color-ink)",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--hiro-color-ink-muted)" }}>This week</span>
        <WebStatusBadge label="On track" tone="success" />
      </header>
      <WebKpiTile title="Tasks completed" value="24" deltaLabel="+12%" deltaTone="success" />
      <WebButton label="Add chore" variant="primary" onPress={() => {}} />
    </section>
  );
}
```
