# packages/ui-tokens Ownership

- Purpose: Canonical design token source for web/mobile.
- Feature-level hardcoded visual constants are disallowed.
- Includes: color, semantic, spacing, radius, elevation, and typography token categories.
- Web integration: `apps/web/src/theme/theme.ts` applies `webCssVariables`.
- Mobile integration: `apps/mobile/src/theme/theme.ts` and `apps/mobile/src/theme/ThemeProvider.tsx` consume shared tokens.
