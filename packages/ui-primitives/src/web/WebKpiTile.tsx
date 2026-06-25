import { tokens } from "@hiro/ui-tokens";
import type { KpiTileProps } from "../shared/types";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

const toneColorByBadge = {
  success: "success",
  warning: "warning",
  error: "error",
  neutral: "inkSoft"
} as const;

export function WebKpiTile({
  title,
  value,
  deltaLabel,
  deltaTone = "neutral",
  bars = [0.35, 0.58, 0.42, 0.74, 0.92],
  accent = "primary"
}: KpiTileProps) {
  const accentColor = accent === "primary" ? cssColor("accent") : cssColor("accentAlt");
  const deltaColor = cssColor(toneColorByBadge[deltaTone]);

  return (
    <section
      style={{
        display: "grid",
        gap: tokens.spacing.sm,
        padding: tokens.spacing.md,
        borderRadius: cssRadius.lg,
        border: `1px solid ${cssColor("border")}`,
        backgroundColor: cssColor("surface")
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing.sm }}>
        <span
          style={{
            color: cssColor("inkMuted"),
            fontFamily: cssFontFamily.default,
            fontSize: tokens.typography.labelSize,
            lineHeight: `${tokens.typography.lineHeightLabel}px`,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            fontWeight: 700,
            flex: 1,
            overflowWrap: "anywhere"
          }}
        >
          {title}
        </span>
        {deltaLabel ? (
          <span
            style={{
              color: deltaTone === "neutral" ? cssColor("inkSoft") : deltaColor,
              fontFamily: cssFontFamily.default,
              fontSize: tokens.typography.labelSize,
              lineHeight: `${tokens.typography.lineHeightLabel}px`,
              fontWeight: 700
            }}
          >
            {deltaLabel}
          </span>
        ) : null}
      </div>
      <div
        style={{
          color: cssColor("ink"),
          fontFamily: cssFontFamily.default,
          fontSize: tokens.typography.titleSize,
          lineHeight: `${tokens.typography.lineHeightHeadline}px`,
          fontWeight: 800
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "end", gap: 3, height: 34 }}>
        {bars.map((bar, index) => (
          <span
            key={`${title}-${index}`}
            style={{
              flex: 1,
              height: `${Math.max(20, Math.round(bar * 100))}%`,
              borderRadius: cssRadius.sm,
              backgroundColor: accentColor,
              opacity: index === bars.length - 1 ? 1 : 0.53,
              boxShadow: index === bars.length - 1 ? `0 0 10px ${accentColor}` : "none"
            }}
          />
        ))}
      </div>
    </section>
  );
}
