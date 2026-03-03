import { tokens } from "@hiro/ui-tokens";
import type { KpiTileProps } from "../shared/types";
import { resolveColor } from "./utils";

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
  const accentColor = accent === "primary" ? resolveColor("accent") : resolveColor("accentAlt");
  const deltaColor = resolveColor(toneColorByBadge[deltaTone]);

  return (
    <section
      style={{
        display: "grid",
        gap: tokens.spacing.sm,
        padding: tokens.spacing.md,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${resolveColor("border")}`,
        backgroundColor: "rgba(255,255,255,0.03)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing.sm }}>
        <span
          style={{
            color: resolveColor("inkMuted"),
            fontFamily: tokens.typography.fontFamily,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            fontWeight: 700
          }}
        >
          {title}
        </span>
        {deltaLabel ? (
          <span
            style={{
              color: deltaTone === "neutral" ? resolveColor("inkSoft") : deltaColor,
              fontFamily: tokens.typography.fontFamily,
              fontSize: 11,
              fontWeight: 700
            }}
          >
            {deltaLabel}
          </span>
        ) : null}
      </div>
      <div style={{ color: resolveColor("ink"), fontFamily: tokens.typography.fontFamily, fontSize: 30, fontWeight: 800 }}>
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "end", gap: 3, height: 34 }}>
        {bars.map((bar, index) => (
          <span
            key={`${title}-${index}`}
            style={{
              flex: 1,
              height: `${Math.max(20, Math.round(bar * 100))}%`,
              borderRadius: tokens.radius.sm,
              backgroundColor: `${accentColor}${index === bars.length - 1 ? "" : "88"}`,
              boxShadow: index === bars.length - 1 ? `0 0 10px ${accentColor}66` : "none"
            }}
          />
        ))}
      </div>
    </section>
  );
}
