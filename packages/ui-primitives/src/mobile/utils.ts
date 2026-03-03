import { tokens } from "@hiro/ui-tokens";
import type { ButtonProps, PrimitiveSize } from "../shared/types";

export function resolveColor(tokenName: keyof typeof tokens.color): string {
  return tokens.color[tokenName];
}

export const buttonPaddingBySize: Record<PrimitiveSize, { paddingVertical: number; paddingHorizontal: number }> = {
  sm: { paddingVertical: tokens.spacing.sm, paddingHorizontal: tokens.spacing.md },
  md: { paddingVertical: tokens.spacing.md, paddingHorizontal: tokens.spacing.lg },
  lg: { paddingVertical: tokens.spacing.lg, paddingHorizontal: tokens.spacing.xl }
};

export function getButtonColors(variant: NonNullable<ButtonProps["variant"]>) {
  const config = tokens.component.button[variant];
  return {
    background: resolveColor(config.bg),
    foreground: resolveColor(config.fg),
    border: resolveColor(config.border)
  };
}
