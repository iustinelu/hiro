import type { ThemeId } from "./types";
import { themes } from "./themes";

// ─── CSS variable helpers ─────────────────────────────────────────────────────

export function cssVariablesFor(themeId: ThemeId): Record<string, string> {
  const theme = themes[themeId];
  const { color, radius, typography, elevation, flags } = theme;
  return {
    // color
    "--hiro-color-bg": color.bg,
    "--hiro-color-bg-elevated": color.bgElevated,
    "--hiro-color-bg-canvas-top": color.bgCanvasTop,
    "--hiro-color-bg-canvas-bottom": color.bgCanvasBottom,
    "--hiro-color-surface": color.surface,
    "--hiro-color-surface-muted": color.surfaceMuted,
    "--hiro-color-surface-strong": color.surfaceStrong,
    "--hiro-color-ink": color.ink,
    "--hiro-color-ink-muted": color.inkMuted,
    "--hiro-color-ink-soft": color.inkSoft,
    "--hiro-color-accent": color.accent,
    "--hiro-color-accent-strong": color.accentStrong,
    "--hiro-color-accent-soft": color.accentSoft,
    "--hiro-color-accent-ink": color.accentInk,
    "--hiro-color-accent-alt": color.accentAlt,
    "--hiro-color-border": color.border,
    "--hiro-color-border-strong": color.borderStrong,
    "--hiro-color-success": color.success,
    "--hiro-color-success-soft": color.successSoft,
    "--hiro-color-warning": color.warning,
    "--hiro-color-warning-soft": color.warningSoft,
    "--hiro-color-error": color.error,
    "--hiro-color-error-soft": color.errorSoft,
    "--hiro-color-info": color.info,
    "--hiro-color-info-soft": color.infoSoft,
    "--hiro-color-feedback-loading-bg": color.feedbackLoadingBg,
    "--hiro-color-feedback-empty-bg": color.feedbackEmptyBg,
    "--hiro-color-feedback-error-bg": color.feedbackErrorBg,
    "--hiro-color-disabled-bg": color.disabledBg,
    "--hiro-color-disabled-border": color.disabledBorder,
    "--hiro-color-disabled-ink": color.disabledInk,
    "--hiro-color-overlay": color.overlay,
    // radius
    "--hiro-radius-sm": String(radius.sm),
    "--hiro-radius-md": String(radius.md),
    "--hiro-radius-lg": String(radius.lg),
    "--hiro-radius-xl": String(radius.xl),
    "--hiro-radius-xxl": String(radius.xxl),
    "--hiro-radius-pill": String(radius.pill),
    // typography
    "--hiro-font-family": typography.fontFamily,
    "--hiro-font-family-mono": typography.fontFamilyMono,
    // elevation / shadows
    "--hiro-shadow-low": elevation.low,
    "--hiro-shadow-mid": elevation.mid,
    "--hiro-shadow-high": elevation.high,
    // structural flags
    "--hiro-border-width": String(flags.borderWidth),
    "--hiro-text-transform": flags.textTransform
  };
}

/** Back-compat: Aurora CSS variables (matches old webCssVariables shape) */
export const webCssVariables: Record<string, string> = cssVariablesFor("aurora");
