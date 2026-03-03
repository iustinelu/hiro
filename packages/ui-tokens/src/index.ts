export const tokens = {
  color: {
    bg: "#0b0a14",
    bgElevated: "#111022",
    bgCanvasTop: "#0f0d1e",
    bgCanvasBottom: "#090913",
    surface: "#161425",
    surfaceMuted: "#1d1a31",
    surfaceStrong: "#262242",
    ink: "#ffffff",
    inkMuted: "#a6acc4",
    inkSoft: "#6e7390",
    accent: "#ff6d24",
    accentStrong: "#e64f1a",
    accentSoft: "#ff6d2422",
    accentInk: "#ffac7e",
    accentAlt: "#8d5cff",
    border: "#2d2b42",
    borderStrong: "#464161",
    success: "#18c58f",
    successSoft: "#18c58f22",
    warning: "#f4b247",
    warningSoft: "#f4b24722",
    error: "#ef5753",
    errorSoft: "#ef575322",
    info: "#4f86ff",
    infoSoft: "#4f86ff22",
    overlay: "rgba(6, 7, 14, 0.72)"
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    xxxxl: 56
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 32,
    pill: 999
  },
  size: {
    touchMin: 44,
    iconSm: 16,
    iconMd: 20,
    iconLg: 24,
    contentMax: 1100
  },
  elevation: {
    low: "0 4px 10px rgba(0, 0, 0, 0.28)",
    mid: "0 12px 26px rgba(0, 0, 0, 0.36)",
    high: "0 20px 40px rgba(0, 0, 0, 0.45)"
  },
  motion: {
    duration: {
      fast: 120,
      normal: 220,
      slow: 320
    },
    easing: {
      standard: "ease",
      emphasized: "cubic-bezier(0.2, 0.8, 0.2, 1)"
    },
    scale: {
      press: 0.98,
      hover: 1.01
    }
  },
  typography: {
    fontFamily: "'Inter', 'Manrope', 'Avenir Next', sans-serif",
    displaySize: 52,
    headlineSize: 34,
    titleSize: 26,
    subtitleSize: 21,
    bodySize: 16,
    bodySmallSize: 14,
    labelSize: 12,
    lineHeightDisplay: 58,
    lineHeightHeadline: 40,
    lineHeightBody: 23,
    lineHeightLabel: 17
  },
  component: {
    button: {
      primary: {
        bg: "accent",
        fg: "ink",
        border: "accentStrong"
      },
      secondary: {
        bg: "surfaceStrong",
        fg: "ink",
        border: "borderStrong"
      },
      ghost: {
        bg: "surfaceMuted",
        fg: "accent",
        border: "border"
      },
      danger: {
        bg: "error",
        fg: "ink",
        border: "error"
      }
    },
    input: {
      bg: "surfaceMuted",
      fg: "ink",
      border: "border",
      focusBorder: "accent",
      errorBorder: "error",
      successBorder: "success"
    },
    card: {
      bg: "surface",
      fg: "ink",
      border: "border",
      accentBg: "surfaceStrong",
      warningBg: "warningSoft"
    },
    listRow: {
      bg: "surfaceMuted",
      fg: "ink",
      border: "border",
      pressedBg: "surfaceStrong"
    },
    modalSheet: {
      bg: "bgElevated",
      fg: "ink",
      border: "borderStrong",
      overlay: "overlay"
    },
    chartContainer: {
      bg: "surface",
      border: "border",
      axis: "inkMuted"
    },
    feedback: {
      loading: "infoSoft",
      empty: "surfaceMuted",
      error: "errorSoft"
    }
  }
} as const;

export type Tokens = typeof tokens;

export const webCssVariables: Record<string, string> = {
  "--hiro-color-bg": tokens.color.bg,
  "--hiro-color-bg-elevated": tokens.color.bgElevated,
  "--hiro-color-bg-canvas-top": tokens.color.bgCanvasTop,
  "--hiro-color-bg-canvas-bottom": tokens.color.bgCanvasBottom,
  "--hiro-color-surface": tokens.color.surface,
  "--hiro-color-surface-muted": tokens.color.surfaceMuted,
  "--hiro-color-surface-strong": tokens.color.surfaceStrong,
  "--hiro-color-ink": tokens.color.ink,
  "--hiro-color-ink-muted": tokens.color.inkMuted,
  "--hiro-color-ink-soft": tokens.color.inkSoft,
  "--hiro-color-accent": tokens.color.accent,
  "--hiro-color-accent-strong": tokens.color.accentStrong,
  "--hiro-color-accent-soft": tokens.color.accentSoft,
  "--hiro-color-accent-ink": tokens.color.accentInk,
  "--hiro-color-accent-alt": tokens.color.accentAlt,
  "--hiro-color-border": tokens.color.border,
  "--hiro-color-border-strong": tokens.color.borderStrong,
  "--hiro-color-success": tokens.color.success,
  "--hiro-color-success-soft": tokens.color.successSoft,
  "--hiro-color-warning": tokens.color.warning,
  "--hiro-color-warning-soft": tokens.color.warningSoft,
  "--hiro-color-error": tokens.color.error,
  "--hiro-color-error-soft": tokens.color.errorSoft,
  "--hiro-color-info": tokens.color.info,
  "--hiro-color-info-soft": tokens.color.infoSoft
};
