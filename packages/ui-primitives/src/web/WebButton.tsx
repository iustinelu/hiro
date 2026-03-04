import { useState } from "react";
import { tokens } from "@hiro/ui-tokens";
import type { ButtonProps } from "../shared/types";
import { WebIcon } from "./WebIcon";
import { buttonMinHeightBySize, buttonPaddingBySize, getButtonColors, resolveColor } from "./utils";

export function WebButton({
  label,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  loadingLabel,
  fullWidth,
  onPress
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const colors = getButtonColors(variant);
  const scale = pressed ? tokens.motion.scale.press : hovered ? tokens.motion.scale.hover : 1;

  const busy = Boolean(disabled || loading);
  const shownLabel = loading ? loadingLabel ?? "Processing" : label;

  return (
    <button
      type="button"
      disabled={busy}
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
        border: `1px solid ${busy ? resolveColor("disabledBorder") : colors.border}`,
        background: busy
          ? resolveColor("disabledBg")
          : variant === "primary"
            ? `linear-gradient(90deg, ${resolveColor("accent")} 0%, ${resolveColor("accentStrong")} 100%)`
            : colors.background,
        color: busy ? resolveColor("disabledInk") : colors.foreground,
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.bodySmallSize,
        letterSpacing: 0.2,
        fontWeight: 800,
        cursor: busy ? "not-allowed" : "pointer",
        transform: `scale(${scale})`,
        opacity: 1,
        boxShadow:
          busy
            ? "none"
            : variant === "primary"
            ? `0 0 16px ${resolveColor("accentSoft")}`
            : hovered
              ? tokens.elevation.mid
              : tokens.elevation.low,
        transition: `all ${tokens.motion.duration.fast}ms ${tokens.motion.easing.standard}`
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: tokens.spacing.xs }}>
        {loading ? <WebIcon name="loading" size={14} color={busy ? resolveColor("disabledInk") : colors.foreground} /> : null}
        {shownLabel}
      </span>
    </button>
  );
}
