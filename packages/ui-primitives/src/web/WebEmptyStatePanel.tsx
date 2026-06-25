import { tokens } from "@hiro/ui-tokens";
import type { EmptyStatePanelProps } from "../shared/types";
import { WebIcon } from "./WebIcon";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

export function WebEmptyStatePanel({
  title,
  description,
  icon = "empty",
  subtitle = "SPEC 04.3"
}: EmptyStatePanelProps) {
  return (
    <section style={{ display: "grid", gap: tokens.spacing.md }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            color: cssColor("ink"),
            fontWeight: 800,
            fontSize: tokens.typography.titleSize,
            fontFamily: cssFontFamily.default
          }}
        >
          EMPTY STATE
        </span>
        <span style={{ color: cssColor("inkSoft"), fontFamily: cssFontFamily.mono, letterSpacing: 2 }}>{subtitle}</span>
      </header>
      <div
        style={{
          borderRadius: cssRadius.xl,
          border: `1px dashed ${cssColor("borderStrong")}`,
          minHeight: 260,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: tokens.spacing.xl,
          backgroundColor: cssColor("feedbackEmptyBg")
        }}
      >
        <div style={{ display: "grid", gap: tokens.spacing.md, justifyItems: "center" }}>
          <span
            style={{
              width: 76,
              height: 76,
              borderRadius: cssRadius.pill,
              border: `1px solid ${cssColor("accentStrong")}`,
              color: cssColor("inkSoft"),
              display: "grid",
              placeItems: "center",
              fontSize: tokens.typography.titleSize
            }}
          >
            <WebIcon name={icon} size={28} color={cssColor("inkSoft")} />
          </span>
          <strong
            style={{
              color: cssColor("inkMuted"),
              fontSize: tokens.typography.headlineSize,
              fontFamily: cssFontFamily.default,
              fontWeight: 700
            }}
          >
            {title}
          </strong>
          <span
            style={{
              color: cssColor("inkSoft"),
              fontFamily: cssFontFamily.mono,
              fontSize: tokens.typography.bodySize,
              letterSpacing: 2,
              textTransform: "uppercase"
            }}
          >
            {description}
          </span>
        </div>
      </div>
    </section>
  );
}
