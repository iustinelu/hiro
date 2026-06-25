"use client";

import { useState } from "react";
import { tokens } from "@hiro/ui-tokens";
import type { ButtonProps } from "../shared/types";
import { WebIcon } from "./WebIcon";
import { buttonMinHeightBySize, buttonPaddingBySize, cssColor, cssFontFamily, cssRadius, cssShadow, getButtonColors } from "./utils";

export function WebButton({
  label,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  loadingLabel,
  fullWidth,
  iconLeft,
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
        borderRadius: cssRadius.lg,
        border: `1px solid ${busy ? cssColor("disabledBorder") : colors.border}`,
        background: busy
          ? cssColor("disabledBg")
          : variant === "primary"
            ? `linear-gradient(90deg, ${cssColor("accent")} 0%, ${cssColor("accentStrong")} 100%)`
            : colors.background,
        color: busy ? cssColor("disabledInk") : colors.foreground,
        fontFamily: cssFontFamily.default,
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
            ? `0 0 16px ${cssColor("accentSoft")}`
            : hovered
              ? cssShadow.mid
              : cssShadow.low,
        transition: `all ${tokens.motion.duration.fast}ms ${tokens.motion.easing.standard}`
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: tokens.spacing.xs }}>
        {loading
          ? <WebIcon name="loading" size={14} color={busy ? cssColor("disabledInk") : colors.foreground} />
          : iconLeft ?? null}
        {shownLabel}
      </span>
    </button>
  );
}
