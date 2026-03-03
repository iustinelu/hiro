import { tokens } from "@hiro/ui-tokens";
import type { EmptyStatePanelProps } from "../shared/types";
import { resolveColor } from "./utils";

export function WebEmptyStatePanel({
  title,
  description,
  icon = "▦",
  subtitle = "SPEC 04.3"
}: EmptyStatePanelProps) {
  return (
    <section style={{ display: "grid", gap: tokens.spacing.md }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            color: resolveColor("ink"),
            fontWeight: 800,
            fontSize: tokens.typography.titleSize,
            fontFamily: tokens.typography.fontFamily
          }}
        >
          EMPTY STATE
        </span>
        <span style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamilyMono, letterSpacing: 2 }}>{subtitle}</span>
      </header>
      <div
        style={{
          borderRadius: tokens.radius.xl,
          border: `1px dashed ${resolveColor("borderStrong")}`,
          minHeight: 260,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: tokens.spacing.xl,
          backgroundColor: "rgba(10, 14, 28, 0.66)"
        }}
      >
        <div style={{ display: "grid", gap: tokens.spacing.md, justifyItems: "center" }}>
          <span
            style={{
              width: 76,
              height: 76,
              borderRadius: tokens.radius.pill,
              border: `1px solid ${resolveColor("accentStrong")}`,
              color: resolveColor("inkSoft"),
              display: "grid",
              placeItems: "center",
              fontSize: tokens.typography.titleSize
            }}
          >
            {icon}
          </span>
          <strong
            style={{
              color: resolveColor("inkMuted"),
              fontSize: tokens.typography.headlineSize,
              fontFamily: tokens.typography.fontFamily,
              fontWeight: 700
            }}
          >
            {title}
          </strong>
          <span
            style={{
              color: resolveColor("inkSoft"),
              fontFamily: tokens.typography.fontFamilyMono,
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
