import { tokens } from "@hiro/ui-tokens";
import type { CardProps } from "../shared/types";
import { resolveColor } from "./utils";

export function WebCard({ title, description, tone = "default", children }: CardProps) {
  const backgroundColor =
    tone === "accent"
      ? resolveColor(tokens.component.card.accentBg)
      : tone === "warning"
        ? resolveColor(tokens.component.card.warningBg)
        : resolveColor(tokens.component.card.bg);

  return (
    <section
      style={{
        display: "grid",
        gap: tokens.spacing.md,
        borderRadius: tokens.radius.xl,
        border: `1px solid ${resolveColor(tokens.component.card.border)}`,
        backgroundColor,
        padding: tokens.spacing.xl,
        boxShadow: tokens.elevation.mid,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(420px 180px at 0% 0%, ${resolveColor("accentSoft")} 0%, transparent 70%)`,
          pointerEvents: "none"
        }}
      />
      {title ? (
        <h3
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.subtitleSize,
            lineHeight: `${tokens.typography.lineHeightHeadline}px`,
            color: resolveColor(tokens.component.card.fg),
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
            fontFamily: tokens.typography.fontFamily,
            color: resolveColor("inkMuted"),
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
