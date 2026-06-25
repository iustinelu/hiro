// ─── Theme IDs ───────────────────────────────────────────────────────────────

export type ThemeId = "aurora" | "daylight" | "superchore" | "neon";

export const ALL_THEME_IDS: ThemeId[] = ["aurora", "daylight", "superchore", "neon"];
export const DEFAULT_THEME: ThemeId = "aurora";
export const THEME_LABELS: Record<ThemeId, string> = {
  aurora: "Aurora",
  daylight: "Daylight",
  superchore: "Super Chore",
  neon: "Neon Grid"
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ColorScale {
  bg: string;
  bgElevated: string;
  bgCanvasTop: string;
  bgCanvasBottom: string;
  surface: string;
  surfaceMuted: string;
  surfaceStrong: string;
  ink: string;
  inkMuted: string;
  inkSoft: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentInk: string;
  accentAlt: string;
  border: string;
  borderStrong: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  info: string;
  infoSoft: string;
  feedbackLoadingBg: string;
  feedbackEmptyBg: string;
  feedbackErrorBg: string;
  disabledBg: string;
  disabledBorder: string;
  disabledInk: string;
  overlay: string;
}

export interface RadiusScale {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  pill: number;
}

export interface ElevationScale {
  low: string;
  mid: string;
  high: string;
}

export interface TypographyTheme {
  fontFamily: string;
  fontFamilyMono: string;
}

export interface ThemeFlags {
  borderWidth: number;
  cardAccentBar: boolean;
  textTransform: "none" | "uppercase";
}

export interface Theme {
  color: ColorScale;
  radius: RadiusScale;
  typography: TypographyTheme;
  elevation: ElevationScale;
  flags: ThemeFlags;
}

// ─── Structural (theme-invariant) tokens ─────────────────────────────────────

const structural = {
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

// ─── Per-theme definitions ────────────────────────────────────────────────────

const auroraTheme = {
  color: {
    bg: "#15121f",
    bgElevated: "#1e1830",
    bgCanvasTop: "#241a39",
    bgCanvasBottom: "#0e0c18",
    surface: "#211c30",
    surfaceMuted: "#2a2440",
    surfaceStrong: "#322c4d",
    ink: "#f7f3ff",
    inkMuted: "#a99fc6",
    inkSoft: "#6e678c",
    accent: "#ff7a59",
    accentStrong: "#e8633f",
    accentSoft: "#ff7a5922",
    accentInk: "#ffcf5c",
    accentAlt: "#57e0c0",
    border: "#302844",
    borderStrong: "#4a4168",
    success: "#57e0c0",
    successSoft: "#57e0c022",
    warning: "#f4b247",
    warningSoft: "#f4b24722",
    error: "#ef5753",
    errorSoft: "#ef575322",
    info: "#4f86ff",
    infoSoft: "#4f86ff22",
    feedbackLoadingBg: "#1e1a3d",
    feedbackEmptyBg: "#1c1831",
    feedbackErrorBg: "#3a1e2e",
    disabledBg: "#2a2540",
    disabledBorder: "#4a4168",
    disabledInk: "#c5c0db",
    overlay: "rgba(10, 8, 20, 0.72)"
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 32,
    pill: 999
  },
  typography: {
    fontFamily: "'Inter', 'Manrope', 'Avenir Next', sans-serif",
    fontFamilyMono: "'IBM Plex Mono', 'JetBrains Mono', 'SFMono-Regular', monospace"
  },
  elevation: {
    low: "0 4px 10px rgba(0, 0, 0, 0.28)",
    mid: "0 12px 26px rgba(0, 0, 0, 0.36)",
    high: "0 20px 40px rgba(0, 0, 0, 0.45)"
  },
  flags: {
    borderWidth: 1,
    cardAccentBar: false,
    textTransform: "none" as const
  }
} satisfies Theme;

const daylightTheme = {
  color: {
    bg: "#fbfcf6",
    bgElevated: "#f5f8ed",
    bgCanvasTop: "#eef3e2",
    bgCanvasBottom: "#f7faf0",
    surface: "#ffffff",
    surfaceMuted: "#f3f6ec",
    surfaceStrong: "#eef3e2",
    ink: "#18200f",
    inkMuted: "#6c7860",
    inkSoft: "#9aa48c",
    accent: "#5a9e00",
    accentStrong: "#4d8500",
    accentSoft: "#e7f7c2",
    accentInk: "#3f6212",
    accentAlt: "#a35a00",
    border: "#e7ecda",
    borderStrong: "#d4dcc2",
    success: "#3f7012",
    successSoft: "#e7f7c2",
    warning: "#a35a00",
    warningSoft: "#fff0d6",
    error: "#c0392b",
    errorSoft: "#fde8e6",
    info: "#1a6eb5",
    infoSoft: "#e0eefb",
    feedbackLoadingBg: "#eef3e2",
    feedbackEmptyBg: "#f3f6ec",
    feedbackErrorBg: "#fde8e6",
    disabledBg: "#e8ecdf",
    disabledBorder: "#d4dcc2",
    disabledInk: "#9aa48c",
    overlay: "rgba(24, 32, 15, 0.48)"
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 32,
    pill: 999
  },
  typography: {
    fontFamily: "'Inter', 'Manrope', 'Avenir Next', sans-serif",
    fontFamilyMono: "'IBM Plex Mono', 'JetBrains Mono', 'SFMono-Regular', monospace"
  },
  elevation: {
    low: "0 2px 8px rgba(24, 32, 15, 0.08)",
    mid: "0 8px 20px rgba(24, 32, 15, 0.12)",
    high: "0 16px 36px rgba(24, 32, 15, 0.16)"
  },
  flags: {
    borderWidth: 1,
    cardAccentBar: false,
    textTransform: "none" as const
  }
} satisfies Theme;

const superchoretheme = {
  color: {
    bg: "#5c94fc",
    bgElevated: "#4a80e8",
    bgCanvasTop: "#6ba0ff",
    bgCanvasBottom: "#4070d0",
    surface: "#fdf6e3",
    surfaceMuted: "#fff3b0",
    surfaceStrong: "#fce0a0",
    ink: "#0b0b14",
    inkMuted: "#2e3a63",
    inkSoft: "#5a6a99",
    accent: "#e52521",
    accentStrong: "#b81e1a",
    accentSoft: "#fbd000",
    accentInk: "#6b4a00",
    accentAlt: "#43b047",
    border: "#0b0b14",
    borderStrong: "#0b0b14",
    success: "#43b047",
    successSoft: "#c6f0c7",
    warning: "#fbd000",
    warningSoft: "#fff9cc",
    error: "#e52521",
    errorSoft: "#fde8e6",
    info: "#2e3a63",
    infoSoft: "#d0d8f0",
    feedbackLoadingBg: "#fff3b0",
    feedbackEmptyBg: "#fdf6e3",
    feedbackErrorBg: "#fde8e6",
    disabledBg: "#e8dfc4",
    disabledBorder: "#c0b89a",
    disabledInk: "#8a8070",
    overlay: "rgba(11, 11, 20, 0.72)"
  },
  radius: {
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
    xxl: 6,
    pill: 6
  },
  typography: {
    fontFamily: "'Press Start 2P', ui-monospace, monospace",
    fontFamilyMono: "'Press Start 2P', ui-monospace, monospace"
  },
  elevation: {
    low: "3px 3px 0 #0b0b14",
    mid: "4px 4px 0 #0b0b14",
    high: "6px 6px 0 #0b0b14"
  },
  flags: {
    borderWidth: 3,
    cardAccentBar: false,
    textTransform: "uppercase" as const
  }
} satisfies Theme;

const neonTheme = {
  color: {
    bg: "#070b16",
    bgElevated: "#0c1322",
    bgCanvasTop: "#0a1020",
    bgCanvasBottom: "#050810",
    surface: "rgba(18, 30, 54, 0.55)",
    surfaceMuted: "#0e1830",
    surfaceStrong: "#13203c",
    ink: "#eaf6ff",
    inkMuted: "#6e86b8",
    inkSoft: "#3d5280",
    accent: "#ff6a1a",
    accentStrong: "#e6550c",
    accentSoft: "rgba(255, 106, 26, 0.15)",
    accentInk: "#19e3ff",
    accentAlt: "#2d6bff",
    border: "rgba(25, 227, 255, 0.3)",
    borderStrong: "rgba(25, 227, 255, 0.5)",
    success: "#19e3ff",
    successSoft: "rgba(25, 227, 255, 0.1)",
    warning: "#ff9f1a",
    warningSoft: "rgba(255, 159, 26, 0.12)",
    error: "#ff3d5a",
    errorSoft: "rgba(255, 61, 90, 0.12)",
    info: "#2d6bff",
    infoSoft: "rgba(25, 227, 255, 0.1)",
    feedbackLoadingBg: "#0e1830",
    feedbackEmptyBg: "#0c1322",
    feedbackErrorBg: "rgba(255, 61, 90, 0.08)",
    disabledBg: "#111c30",
    disabledBorder: "rgba(110, 134, 184, 0.3)",
    disabledInk: "#3d5280",
    overlay: "rgba(5, 7, 16, 0.80)"
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 12,
    xl: 16,
    xxl: 20,
    pill: 999
  },
  typography: {
    fontFamily: "'Inter', 'Rajdhani', 'Exo 2', sans-serif",
    fontFamilyMono: "'IBM Plex Mono', 'JetBrains Mono', monospace"
  },
  elevation: {
    low: "0 0 16px -2px rgba(255, 106, 26, 0.8)",
    mid: "0 0 22px -6px rgba(25, 227, 255, 0.35)",
    high: "0 0 34px -4px rgba(25, 227, 255, 0.45)"
  },
  flags: {
    borderWidth: 1,
    cardAccentBar: false,
    textTransform: "none" as const
  }
} satisfies Theme;

// ─── Theme registry ───────────────────────────────────────────────────────────

export const themes = {
  aurora: auroraTheme,
  daylight: daylightTheme,
  superchore: superchoretheme,
  neon: neonTheme
} satisfies Record<ThemeId, Theme>;

// ─── Back-compat: tokens (Aurora + structural) ────────────────────────────────

export const tokens = {
  color: themes.aurora.color,
  spacing: structural.spacing,
  radius: themes.aurora.radius,
  size: structural.size,
  elevation: themes.aurora.elevation,
  motion: structural.motion,
  typography: {
    fontFamily: themes.aurora.typography.fontFamily,
    fontFamilyMobile: structural.typography.fontFamilyMobile,
    fontFamilyMono: themes.aurora.typography.fontFamilyMono,
    displaySize: structural.typography.displaySize,
    headlineSize: structural.typography.headlineSize,
    titleSize: structural.typography.titleSize,
    subtitleSize: structural.typography.subtitleSize,
    bodySize: structural.typography.bodySize,
    bodySmallSize: structural.typography.bodySmallSize,
    labelSize: structural.typography.labelSize,
    lineHeightDisplay: structural.typography.lineHeightDisplay,
    lineHeightHeadline: structural.typography.lineHeightHeadline,
    lineHeightBody: structural.typography.lineHeightBody,
    lineHeightLabel: structural.typography.lineHeightLabel
  },
  semantic: structural.semantic,
  component: structural.component
} as const;

export type Tokens = typeof tokens;

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
