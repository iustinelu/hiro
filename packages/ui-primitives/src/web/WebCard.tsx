import { tokens } from "@hiro/ui-tokens";
import type { CardProps } from "../shared/types";
import { cssColor, cssFontFamily, cssRadius, cssShadow } from "./utils";

export function WebCard({ title, description, tone = "default", children }: CardProps) {
  const backgroundColor =
    tone === "accent"
      ? cssColor(tokens.component.card.accentBg)
      : tone === "warning"
        ? cssColor(tokens.component.card.warningBg)
        : cssColor(tokens.component.card.bg);

  return (
    <section
      style={{
        display: "grid",
        gap: tokens.spacing.md,
        borderRadius: cssRadius.xl,
        border: `1px solid ${cssColor(tokens.component.card.border)}`,
        backgroundColor,
        padding: tokens.spacing.xl,
        boxShadow: cssShadow.mid,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(420px 180px at 0% 0%, ${cssColor("accentSoft")} 0%, transparent 70%)`,
          pointerEvents: "none"
        }}
      />
      {title ? (
        <h3
          style={{
            margin: 0,
            fontFamily: cssFontFamily.default,
            fontSize: tokens.typography.subtitleSize,
            lineHeight: `${tokens.typography.lineHeightHeadline}px`,
            color: cssColor(tokens.component.card.fg),
            fontWeight: 800,
            position: "relative",
            overflowWrap: "anywhere"
          }}
        >
          {title}
        </h3>
      ) : null}
      {description ? (
        <p
          style={{
            margin: 0,
            fontFamily: cssFontFamily.default,
            color: cssColor("inkMuted"),
            fontSize: tokens.typography.bodySmallSize,
            lineHeight: `${tokens.typography.lineHeightBody}px`,
            position: "relative",
            overflowWrap: "anywhere"
          }}
        >
          {description}
        </p>
      ) : null}
      <div style={{ position: "relative" }}>{children}</div>
    </section>
  );
}
