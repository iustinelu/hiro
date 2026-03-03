# packages/ui-tokens Ownership

- Purpose: Canonical design token source for web/mobile.
- Feature-level hardcoded visual constants are disallowed.

## Token Domains

- `color`: semantic palette (background, surface, ink, status colors, overlays).
- `spacing`: layout and component spacing scale.
- `radius`: corner geometry scale.
- `size`: shared control sizing (including touch minimum).
- `elevation`: layered shadow system.
- `motion`: duration/easing/press-scale semantics.
- `typography`: family and size/line-height primitives.
- `component`: semantic color mapping for button/input/card/list-row/sheet/chart/feedback.

## Web Theme Variables

- `webCssVariables` maps key color semantics to CSS custom properties.
- `apps/web` applies these via `applyWebTheme()` at bootstrap.
