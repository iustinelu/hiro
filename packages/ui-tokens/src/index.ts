export const tokens = {
  color: {
    bg: "#f7f5ef",
    surface: "#ffffff",
    surfaceMuted: "#eef3f5",
    textPrimary: "#1f2a30",
    textSecondary: "#596a72",
    accent: "#1f8a70",
    border: "#d3dde1"
  },
  semantic: {
    success: {
      bg: "#e8f5ee",
      fg: "#217a4b",
      border: "#9dd8b7"
    },
    warning: {
      bg: "#fff4db",
      fg: "#a66700",
      border: "#f0cd80"
    },
    error: {
      bg: "#feeceb",
      fg: "#b42318",
      border: "#f6b1ac"
    },
    info: {
      bg: "#e8f1ff",
      fg: "#2563eb",
      border: "#9dbdfc"
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16
  },
  elevation: {
    low: "0 1px 2px rgba(0,0,0,0.08)",
    mid: "0 6px 20px rgba(0,0,0,0.10)",
    high: "0 10px 30px rgba(0,0,0,0.14)"
  },
  typography: {
    fontFamilyWeb: "'Manrope', 'Avenir Next', sans-serif",
    fontFamilyMobile: "System",
    titleSize: 24,
    bodySize: 16,
    labelSize: 14,
    titleLineHeight: 32,
    bodyLineHeight: 24,
    labelLineHeight: 20,
    weightRegular: "400",
    weightSemibold: "600"
  }
} as const;

export type Tokens = typeof tokens;

export const webCssVariables: Record<string, string> = {
  "--hiro-color-bg": tokens.color.bg,
  "--hiro-color-surface": tokens.color.surface,
  "--hiro-color-surface-muted": tokens.color.surfaceMuted,
  "--hiro-color-text-primary": tokens.color.textPrimary,
  "--hiro-color-text-secondary": tokens.color.textSecondary,
  "--hiro-color-accent": tokens.color.accent,
  "--hiro-color-border": tokens.color.border,
  "--hiro-semantic-success-bg": tokens.semantic.success.bg,
  "--hiro-semantic-success-fg": tokens.semantic.success.fg,
  "--hiro-semantic-warning-bg": tokens.semantic.warning.bg,
  "--hiro-semantic-warning-fg": tokens.semantic.warning.fg,
  "--hiro-semantic-error-bg": tokens.semantic.error.bg,
  "--hiro-semantic-error-fg": tokens.semantic.error.fg,
  "--hiro-semantic-info-bg": tokens.semantic.info.bg,
  "--hiro-semantic-info-fg": tokens.semantic.info.fg,
  "--hiro-spacing-xs": `${tokens.spacing.xs}px`,
  "--hiro-spacing-sm": `${tokens.spacing.sm}px`,
  "--hiro-spacing-md": `${tokens.spacing.md}px`,
  "--hiro-spacing-lg": `${tokens.spacing.lg}px`,
  "--hiro-spacing-xl": `${tokens.spacing.xl}px`,
  "--hiro-spacing-xxl": `${tokens.spacing.xxl}px`,
  "--hiro-radius-sm": `${tokens.radius.sm}px`,
  "--hiro-radius-md": `${tokens.radius.md}px`,
  "--hiro-radius-lg": `${tokens.radius.lg}px`,
  "--hiro-elevation-low": tokens.elevation.low,
  "--hiro-elevation-mid": tokens.elevation.mid,
  "--hiro-elevation-high": tokens.elevation.high,
  "--hiro-font-family": tokens.typography.fontFamilyWeb,
  "--hiro-font-size-title": `${tokens.typography.titleSize}px`,
  "--hiro-font-size-body": `${tokens.typography.bodySize}px`,
  "--hiro-font-size-label": `${tokens.typography.labelSize}px`,
  "--hiro-line-height-title": `${tokens.typography.titleLineHeight}px`,
  "--hiro-line-height-body": `${tokens.typography.bodyLineHeight}px`,
  "--hiro-line-height-label": `${tokens.typography.labelLineHeight}px`,
  "--hiro-font-weight-regular": tokens.typography.weightRegular,
  "--hiro-font-weight-semibold": tokens.typography.weightSemibold
};
