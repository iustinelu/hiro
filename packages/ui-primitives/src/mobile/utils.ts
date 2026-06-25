import type { ButtonProps, PrimitiveSize } from "../shared/types";
import type { ResolvedTheme } from "./theme-context";

export function resolveColor(t: ResolvedTheme, tokenName: keyof ResolvedTheme["color"]): string {
  return t.color[tokenName];
}

// ─── Font family resolution (mobile) ─────────────────────────────────────────
// RN can't consume the CSS font stacks the themes declare, and each bundled
// weight registers under its own family name (see apps/mobile/src/index.tsx).
// These map the active theme's leading family + a requested weight to the
// registered @expo-google-fonts name. Theme-reactive: read off the resolved
// theme, so switching themes switches the face.

const INTER_WEIGHTS: ReadonlyArray<readonly [number, string]> = [
  [400, "Inter_400Regular"],
  [500, "Inter_500Medium"],
  [600, "Inter_600SemiBold"],
  [700, "Inter_700Bold"],
  [800, "Inter_800ExtraBold"]
];
const RAJDHANI_WEIGHTS: ReadonlyArray<readonly [number, string]> = [
  [400, "Rajdhani_400Regular"],
  [500, "Rajdhani_500Medium"],
  [600, "Rajdhani_600SemiBold"],
  [700, "Rajdhani_700Bold"]
];
const IBM_PLEX_MONO_WEIGHTS: ReadonlyArray<readonly [number, string]> = [
  [400, "IBMPlexMono_400Regular"],
  [500, "IBMPlexMono_500Medium"]
];
const PRESS_START_2P = "PressStart2P_400Regular";

function leadingFamily(stack: string): string {
  const first = stack.split(",")[0]?.trim() ?? "";
  return first.replace(/^['"]|['"]$/g, "");
}

// Nearest available weight (clamps e.g. Rajdhani 800 → 700, mono 700 → 500).
function nearestWeight(
  weight: number,
  table: ReadonlyArray<readonly [number, string]>
): string {
  let best = table[0];
  for (const entry of table) {
    if (Math.abs(entry[0] - weight) < Math.abs(best[0] - weight)) {
      best = entry;
    }
  }
  return best[1];
}

export function resolveFontFamily(t: ResolvedTheme, weight = 400): string {
  switch (leadingFamily(t.typography.fontFamily)) {
    case "Rajdhani":
      return nearestWeight(weight, RAJDHANI_WEIGHTS);
    case "Press Start 2P":
      return PRESS_START_2P;
    default:
      return nearestWeight(weight, INTER_WEIGHTS);
  }
}

export function resolveFontFamilyMono(t: ResolvedTheme, weight = 400): string {
  switch (leadingFamily(t.typography.fontFamilyMono)) {
    case "Press Start 2P":
      return PRESS_START_2P;
    default:
      return nearestWeight(weight, IBM_PLEX_MONO_WEIGHTS);
  }
}

export function buttonPaddingBySize(
  t: ResolvedTheme
): Record<PrimitiveSize, { paddingVertical: number; paddingHorizontal: number }> {
  return {
    sm: { paddingVertical: t.spacing.sm, paddingHorizontal: t.spacing.md },
    md: { paddingVertical: t.spacing.md, paddingHorizontal: t.spacing.lg },
    lg: { paddingVertical: t.spacing.lg, paddingHorizontal: t.spacing.xl }
  };
}

export function getButtonColors(t: ResolvedTheme, variant: NonNullable<ButtonProps["variant"]>) {
  const config = t.component.button[variant];
  return {
    background: resolveColor(t, config.bg as keyof ResolvedTheme["color"]),
    foreground: resolveColor(t, config.fg as keyof ResolvedTheme["color"]),
    border: resolveColor(t, config.border as keyof ResolvedTheme["color"])
  };
}
