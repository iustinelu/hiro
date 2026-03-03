import { useState } from "react";
import { tokens } from "@hiro/ui-tokens";
import type { ButtonProps } from "../shared/types";
import { buttonMinHeightBySize, buttonPaddingBySize, getButtonColors, resolveColor } from "./utils";

export function WebButton({
  label,
  variant = "primary",
  size = "md",
  disabled,
  fullWidth,
  onPress
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const colors = getButtonColors(variant);
  const scale = pressed ? tokens.motion.scale.press : hovered ? tokens.motion.scale.hover : 1;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: fullWidth ? "100%" : "fit-content",
        minHeight: buttonMinHeightBySize[size],
        padding: buttonPaddingBySize[size],
        borderRadius: tokens.radius.lg,
        border: `1px solid ${disabled ? resolveColor("disabledBorder") : colors.border}`,
        background:
          variant === "primary"
            ? `linear-gradient(90deg, ${resolveColor("accent")} 0%, ${resolveColor("accentStrong")} 100%)`
            : disabled
              ? resolveColor("disabledBg")
              : colors.background,
        color: disabled ? resolveColor("disabledInk") : colors.foreground,
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.bodySmallSize,
        letterSpacing: 0.2,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: `scale(${scale})`,
        opacity: 1,
        boxShadow:
          variant === "primary"
            ? `0 0 16px ${resolveColor("accentSoft")}`
            : hovered
              ? tokens.elevation.mid
              : tokens.elevation.low,
        transition: `all ${tokens.motion.duration.fast}ms ${tokens.motion.easing.standard}`
      }}
    >
      {label}
    </button>
  );
}
