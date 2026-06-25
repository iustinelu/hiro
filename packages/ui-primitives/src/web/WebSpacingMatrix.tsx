import { tokens } from "@hiro/ui-tokens";
import type { SpacingMatrixProps } from "../shared/types";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

const spacingRows = [
  { px: 4, token: "token.xs" },
  { px: 8, token: "token.sm" },
  { px: 16, token: "token.md" },
  { px: 24, token: "token.lg" },
  { px: 32, token: "token.xl" },
  { px: 48, token: "token.2xl" }
];

export function WebSpacingMatrix({ title = "Spacing Matrix" }: SpacingMatrixProps) {
  return (
    <section style={{ display: "grid", gap: tokens.spacing.md }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <strong style={{ color: cssColor("ink"), fontSize: tokens.typography.titleSize, fontFamily: cssFontFamily.default, textTransform: "uppercase" }}>{title}</strong>
        <span style={{ color: cssColor("inkSoft"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px`, letterSpacing: 1.4 }}>SPEC 05.1</span>
      </header>
      <div style={{ display: "grid", gap: tokens.spacing.sm }}>
        {spacingRows.map((row) => (
          <div
            key={row.token}
            style={{
              borderRadius: cssRadius.lg,
              border: `1px solid ${cssColor("border")}`,
              backgroundColor: cssColor("surfaceMuted"),
              padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
              display: "grid",
              gridTemplateColumns: "90px 1fr 110px",
              alignItems: "center",
              gap: tokens.spacing.md
            }}
          >
            <span style={{ color: cssColor("inkMuted"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px`, fontWeight: 700 }}>{row.px}px</span>
            <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md }}>
              <span
                style={{
                  width: row.px,
                  height: row.px,
                  borderRadius: cssRadius.sm,
                  backgroundColor: cssColor("accent"),
                  boxShadow: row.px >= 40 ? `0 0 14px ${cssColor("accentSoft")}` : "none"
                }}
              />
              <span style={{ flex: 1, height: 1, backgroundColor: cssColor("border") }} />
            </div>
            <span style={{ color: cssColor("inkSoft"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px` }}>{row.token}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
