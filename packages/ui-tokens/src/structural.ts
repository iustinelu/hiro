// ─── Structural (theme-invariant) tokens ─────────────────────────────────────

export const structural = {
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
  size: {
    touchMin: 44,
    iconSm: 16,
    iconMd: 20,
    iconLg: 24,
    contentMax: 1100
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
    fontFamilyMobile: "System",
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
    surface: {
      panelBg: "bgElevated",
      panelBorder: "border",
      dotGridOpacity: 0.18
    },
    navigation: {
      activeIndicatorFrom: "accentAlt",
      activeIndicatorTo: "accent"
    },
    switch: {
      trackOn: "accent",
      trackOff: "surfaceStrong",
      thumbOn: "ink",
      thumbOff: "inkMuted"
    },
    chip: {
      activeBg: "accentSoft",
      activeBorder: "accent",
      inactiveBg: "surfaceStrong",
      inactiveBorder: "borderStrong"
    },
    feedback: {
      loading: "feedbackLoadingBg",
      empty: "feedbackEmptyBg",
      error: "feedbackErrorBg"
    }
  }
} as const;
