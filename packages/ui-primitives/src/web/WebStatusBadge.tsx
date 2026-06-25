import { tokens } from "@hiro/ui-tokens";
import type { StatusBadgeProps } from "../shared/types";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

const colorMap = {
  success: "success",
  warning: "warning",
  error: "error",
  neutral: "inkSoft"
} as const;

export function WebStatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const toneColor = cssColor(colorMap[tone]);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
        borderRadius: cssRadius.sm,
        border: `1px solid ${tone === "neutral" ? cssColor("borderStrong") : `color-mix(in srgb, ${toneColor} 40%, transparent)`}`,
        backgroundColor: tone === "neutral" ? cssColor("surfaceMuted") : `color-mix(in srgb, ${toneColor} 13%, transparent)`,
        color: tone === "neutral" ? cssColor("ink") : toneColor,
        fontFamily: cssFontFamily.mono,
        fontSize: tokens.typography.labelSize,
        lineHeight: `${tokens.typography.lineHeightLabel}px`,
        fontWeight: 700,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        maxWidth: "100%",
        whiteSpace: "normal",
        overflowWrap: "anywhere"
      }}
    >
      {label}
    </span>
  );
}
