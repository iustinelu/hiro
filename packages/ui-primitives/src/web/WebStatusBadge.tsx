import { tokens } from "@hiro/ui-tokens";
import type { StatusBadgeProps } from "../shared/types";
import { resolveColor } from "./utils";

const colorMap = {
  success: "success",
  warning: "warning",
  error: "error",
  neutral: "inkSoft"
} as const;

export function WebStatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const toneColor = resolveColor(colorMap[tone]);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
        borderRadius: tokens.radius.sm,
        border: `1px solid ${tone === "neutral" ? resolveColor("borderStrong") : `${toneColor}66`}`,
        backgroundColor: tone === "neutral" ? "rgba(255,255,255,0.05)" : `${toneColor}22`,
        color: tone === "neutral" ? resolveColor("ink") : toneColor,
        fontFamily: tokens.typography.fontFamilyMono,
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
