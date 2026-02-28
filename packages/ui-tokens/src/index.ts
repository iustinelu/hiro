export const tokens = {
  color: {
    bg: "#f7f5ef",
    surface: "#ffffff",
    textPrimary: "#1f2a30",
    textSecondary: "#596a72",
    accent: "#1f8a70",
    border: "#d3dde1",
    success: "#217a4b",
    warning: "#a66700",
    error: "#b42318",
    info: "#2563eb"
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
    mid: "0 6px 20px rgba(0,0,0,0.10)"
  },
  typography: {
    fontFamily: "'Manrope', 'Avenir Next', sans-serif",
    titleSize: 24,
    bodySize: 16,
    labelSize: 14
  }
} as const;

export type Tokens = typeof tokens;

export const webCssVariables: Record<string, string> = {
  "--hiro-color-bg": tokens.color.bg,
  "--hiro-color-surface": tokens.color.surface,
  "--hiro-color-text-primary": tokens.color.textPrimary,
  "--hiro-color-text-secondary": tokens.color.textSecondary,
  "--hiro-color-accent": tokens.color.accent,
  "--hiro-color-border": tokens.color.border
};
