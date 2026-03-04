---
name: design-system-change-gate
description: Guard design-system changes in Hiro for token consistency and cross-platform parity. Use when editing design-system gallery, ui-primitives, or ui-tokens to enforce contrast, typography, overflow, and parity checks.
---

# Design System Change Gate

Apply this gate to all DS changes.

## Scope triggers

- `apps/*/design-system*`
- `apps/mobile/src/screens/DesignSystemGallery*`
- `packages/ui-primitives/*`
- `packages/ui-tokens/*`

## Required checks

1. Use tokens/primitives; avoid hardcoded feature-level style values.
2. Preserve web/mobile parity for shared primitives unless explicitly platform-specific.
3. Validate readability/contrast on dark surfaces.
4. Validate long-label overflow and dynamic text scaling behavior.
5. Keep loading/empty/error examples accurate when affected.

## Handoff requirements

1. Name affected web and mobile validation targets.
2. Include explicit visual pass/fail cues for typography and contrast.
3. Run `npm run check` before handoff.
