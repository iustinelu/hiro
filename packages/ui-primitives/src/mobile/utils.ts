import type { ButtonProps, PrimitiveSize } from "../shared/types";
import type { ResolvedTheme } from "./theme-context";

export function resolveColor(t: ResolvedTheme, tokenName: keyof ResolvedTheme["color"]): string {
  return t.color[tokenName];
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
