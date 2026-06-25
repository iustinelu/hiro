import { tokens } from "@hiro/ui-tokens";
import type { ButtonProps, PrimitiveSize } from "../shared/types";

// ─── Color CSS variable helpers ───────────────────────────────────────────────

/**
 * Maps a color token key (camelCase) to the corresponding CSS custom property.
 * Components must use this instead of resolveColor() so that theme switching
 * via [data-theme] on <html> cascades correctly.
 *
 * Mapping: camelCase → --hiro-color-<kebab>
 */
const colorKeyToCssVar: Record<keyof typeof tokens.color, string> = {
  bg: "var(--hiro-color-bg)",
  bgElevated: "var(--hiro-color-bg-elevated)",
  bgCanvasTop: "var(--hiro-color-bg-canvas-top)",
  bgCanvasBottom: "var(--hiro-color-bg-canvas-bottom)",
  surface: "var(--hiro-color-surface)",
  surfaceMuted: "var(--hiro-color-surface-muted)",
  surfaceStrong: "var(--hiro-color-surface-strong)",
  ink: "var(--hiro-color-ink)",
  inkMuted: "var(--hiro-color-ink-muted)",
  inkSoft: "var(--hiro-color-ink-soft)",
  accent: "var(--hiro-color-accent)",
  accentStrong: "var(--hiro-color-accent-strong)",
  accentSoft: "var(--hiro-color-accent-soft)",
  accentInk: "var(--hiro-color-accent-ink)",
  accentAlt: "var(--hiro-color-accent-alt)",
  border: "var(--hiro-color-border)",
  borderStrong: "var(--hiro-color-border-strong)",
  success: "var(--hiro-color-success)",
  successSoft: "var(--hiro-color-success-soft)",
  warning: "var(--hiro-color-warning)",
  warningSoft: "var(--hiro-color-warning-soft)",
  error: "var(--hiro-color-error)",
  errorSoft: "var(--hiro-color-error-soft)",
  info: "var(--hiro-color-info)",
  infoSoft: "var(--hiro-color-info-soft)",
  feedbackLoadingBg: "var(--hiro-color-feedback-loading-bg)",
  feedbackEmptyBg: "var(--hiro-color-feedback-empty-bg)",
  feedbackErrorBg: "var(--hiro-color-feedback-error-bg)",
  disabledBg: "var(--hiro-color-disabled-bg)",
  disabledBorder: "var(--hiro-color-disabled-border)",
  disabledInk: "var(--hiro-color-disabled-ink)",
  // overlay has no CSS var in cssVariablesFor — resolved statically via resolveColor
  overlay: tokens.color.overlay
};

/**
 * Returns the CSS custom property string for a given color token key.
 * Use this in inline styles so colors react to [data-theme] changes.
 */
export function cssColor(tokenName: keyof typeof tokens.color): string {
  return colorKeyToCssVar[tokenName];
}

/**
 * @deprecated Use cssColor() instead. resolveColor() returns the static
 * Aurora value and will not respond to theme changes.
 */
export function resolveColor(tokenName: keyof typeof tokens.color): string {
  return tokens.color[tokenName];
}

// ─── Radius CSS variable helpers ──────────────────────────────────────────────

/**
 * Radius vars are emitted as unitless numbers (e.g. --hiro-radius-lg: 18).
 * Multiply by 1px via calc() to produce a valid CSS length.
 */
export const cssRadius = {
  sm: "calc(var(--hiro-radius-sm) * 1px)",
  md: "calc(var(--hiro-radius-md) * 1px)",
  lg: "calc(var(--hiro-radius-lg) * 1px)",
  xl: "calc(var(--hiro-radius-xl) * 1px)",
  xxl: "calc(var(--hiro-radius-xxl) * 1px)",
  pill: "calc(var(--hiro-radius-pill) * 1px)"
} as const;

// ─── Shadow CSS variable helpers ──────────────────────────────────────────────

export const cssShadow = {
  low: "var(--hiro-shadow-low)",
  mid: "var(--hiro-shadow-mid)",
  high: "var(--hiro-shadow-high)"
} as const;

// ─── Font CSS variable helpers ────────────────────────────────────────────────

export const cssFontFamily = {
  default: "var(--hiro-font-family)",
  mono: "var(--hiro-font-family-mono)"
} as const;

// ─── Button size helpers ──────────────────────────────────────────────────────

export const buttonPaddingBySize: Record<PrimitiveSize, string> = {
  sm: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
  md: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
  lg: `${tokens.spacing.lg}px ${tokens.spacing.xl}px`
};

export const buttonMinHeightBySize: Record<PrimitiveSize, number> = {
  sm: tokens.size.touchMin,
  md: tokens.size.touchMin + tokens.spacing.xs,
  lg: tokens.size.touchMin + tokens.spacing.sm
};

export function getButtonColors(variant: NonNullable<ButtonProps["variant"]>) {
  const config = tokens.component.button[variant];
  return {
    background: cssColor(config.bg),
    foreground: cssColor(config.fg),
    border: cssColor(config.border)
  };
}
