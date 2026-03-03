import { tokens } from "@hiro/ui-tokens";
import type { ButtonProps, PrimitiveSize } from "../shared/types";

export function resolveColor(tokenName: keyof typeof tokens.color): string {
  return tokens.color[tokenName];
}

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
    background: resolveColor(config.bg),
    foreground: resolveColor(config.fg),
    border: resolveColor(config.border)
  };
}
