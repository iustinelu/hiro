import { tokens } from "@hiro/ui-tokens";
import type { ChartContainerProps } from "../shared/types";
import { cssColor, cssFontFamily, cssRadius, cssShadow } from "./utils";

export function WebChartContainer({ title, subtitle, children }: ChartContainerProps) {
  return (
    <section
      style={{
        borderRadius: cssRadius.xl,
        border: `1px solid ${cssColor(tokens.component.chartContainer.border)}`,
        backgroundColor: cssColor(tokens.component.chartContainer.bg),
        padding: tokens.spacing.xl,
        display: "grid",
        gap: tokens.spacing.md,
        boxShadow: cssShadow.mid
      }}
    >
      {(title || subtitle) && (
        <header style={{ display: "grid", gap: tokens.spacing.xs }}>
          {title ? (
            <h3
              style={{
                margin: 0,
                fontFamily: cssFontFamily.default,
                fontSize: tokens.typography.subtitleSize,
                color: cssColor("ink")
              }}
            >
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p
              style={{
                margin: 0,
                color: cssColor("inkMuted"),
                fontFamily: cssFontFamily.default,
                fontSize: tokens.typography.bodySmallSize
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </header>
      )}
      {children}
    </section>
  );
}
