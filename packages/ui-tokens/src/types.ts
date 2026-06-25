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
