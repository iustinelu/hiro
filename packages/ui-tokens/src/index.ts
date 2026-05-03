export const tokens = {
  color: {
    bg: "#FAFAF7",
    bgElevated: "#FFFFFF",
    bgCanvasTop: "#FAFAF7",
    bgCanvasBottom: "#F3F2EC",
    surface: "#FFFFFF",
    surfaceMuted: "#F5F4EF",
    surfaceStrong: "#ECEAE3",
    ink: "#1C1B2E",
    inkMuted: "#6B6F85",
    inkSoft: "#A8AABC",
    accent: "#65A30D",
    accentStrong: "#4D7C0F",
    accentSoft: "#ECFCCB",
    accentInk: "#365314",
    accentAlt: "#F43F5E",
    accentAltSoft: "#FFE4E6",
    gold: "#F59E0B",
    goldSoft: "#FEF3C7",
    goldStrong: "#D97706",
    border: "#E4E3DC",
    borderStrong: "#CCCBC3",
    success: "#16A34A",
    successSoft: "#DCFCE7",
    warning: "#D97706",
    warningSoft: "#FEF3C7",
    error: "#DC2626",
    errorSoft: "#FEE2E2",
    info: "#2563EB",
    infoSoft: "#DBEAFE",
    feedbackLoadingBg: "#F0FAF8",
    feedbackEmptyBg: "#F7F7F2",
    feedbackErrorBg: "#FEF2F2",
    disabledBg: "#F0EFEA",
    disabledBorder: "#D8D7CF",
    disabledInk: "#A8AABC",
    overlay: "rgba(28, 27, 46, 0.48)"
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
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
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
    low: "0 2px 8px rgba(28, 27, 46, 0.08)",
    mid: "0 8px 24px rgba(28, 27, 46, 0.12)",
    high: "0 20px 48px rgba(28, 27, 46, 0.18)"
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
      press: 0.97,
      hover: 1.01
    }
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
    fontFamilyMobile: "System",
    fontFamilyMono: "'JetBrains Mono', 'SFMono-Regular', ui-monospace, monospace",
    displaySize: 52,
    headlineSize: 34,
    titleSize: 26,
    subtitleSize: 21,
    bodySize: 16,
    bodySmallSize: 14,
    labelSize: 12,
    lineHeightDisplay: 58,
    lineHeightHeadline: 40,
    lineHeightBody: 24,
    lineHeightLabel: 17
  },
  semantic: {
    success: "success",
    warning: "warning",
    error: "error",
    info: "info"
  },
  component: {
    button: {
      primary: {
        bg: "accent",
        fg: "bgElevated",
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
        fg: "bgElevated",
        border: "error"
      }
    },
    input: {
      bg: "surface",
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
      accentBg: "accentSoft",
      warningBg: "warningSoft"
    },
    listRow: {
      bg: "surface",
      fg: "ink",
      border: "border",
      pressedBg: "surfaceMuted"
    },
    modalSheet: {
      bg: "bgElevated",
      fg: "ink",
      border: "border",
      overlay: "overlay"
    },
    chartContainer: {
      bg: "surface",
      border: "border",
      axis: "inkMuted"
    },
    surface: {
      panelBg: "bgElevated",
      panelBorder: "border",
      dotGridOpacity: 0
    },
    navigation: {
      activeIndicatorFrom: "accent",
      activeIndicatorTo: "accentStrong"
    },
    switch: {
      trackOn: "accent",
      trackOff: "surfaceStrong",
      thumbOn: "bgElevated",
      thumbOff: "inkMuted"
    },
    chip: {
      activeBg: "accentSoft",
      activeBorder: "accent",
      inactiveBg: "surfaceStrong",
      inactiveBorder: "border"
    },
    feedback: {
      loading: "feedbackLoadingBg",
      empty: "feedbackEmptyBg",
      error: "feedbackErrorBg"
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
  "--hiro-color-accent-alt-soft": tokens.color.accentAltSoft,
  "--hiro-color-gold": tokens.color.gold,
  "--hiro-color-gold-soft": tokens.color.goldSoft,
  "--hiro-color-gold-strong": tokens.color.goldStrong,
  "--hiro-color-border": tokens.color.border,
  "--hiro-color-border-strong": tokens.color.borderStrong,
  "--hiro-color-success": tokens.color.success,
  "--hiro-color-success-soft": tokens.color.successSoft,
  "--hiro-color-warning": tokens.color.warning,
  "--hiro-color-warning-soft": tokens.color.warningSoft,
  "--hiro-color-error": tokens.color.error,
  "--hiro-color-error-soft": tokens.color.errorSoft,
  "--hiro-color-info": tokens.color.info,
  "--hiro-color-info-soft": tokens.color.infoSoft,
  "--hiro-color-feedback-loading-bg": tokens.color.feedbackLoadingBg,
  "--hiro-color-feedback-empty-bg": tokens.color.feedbackEmptyBg,
  "--hiro-color-feedback-error-bg": tokens.color.feedbackErrorBg,
  "--hiro-color-disabled-bg": tokens.color.disabledBg,
  "--hiro-color-disabled-border": tokens.color.disabledBorder,
  "--hiro-color-disabled-ink": tokens.color.disabledInk
};
