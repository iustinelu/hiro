import { tokens } from "@hiro/ui-tokens";
import type { ChartContainerProps } from "../shared/types";
import { resolveColor } from "./utils";

export function WebChartContainer({ title, subtitle, children }: ChartContainerProps) {
  return (
    <section
      style={{
        borderRadius: tokens.radius.xl,
        border: `1px solid ${resolveColor(tokens.component.chartContainer.border)}`,
        backgroundColor: resolveColor(tokens.component.chartContainer.bg),
        padding: tokens.spacing.xl,
        display: "grid",
        gap: tokens.spacing.md,
        boxShadow: tokens.elevation.mid
      }}
    >
      {(title || subtitle) && (
        <header style={{ display: "grid", gap: tokens.spacing.xs }}>
          {title ? (
            <h3
              style={{
                margin: 0,
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.subtitleSize,
                color: resolveColor("ink")
              }}
            >
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p
              style={{
                margin: 0,
                color: resolveColor("inkMuted"),
                fontFamily: tokens.typography.fontFamily,
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
