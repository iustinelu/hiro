import { tokens } from "@hiro/ui-tokens";
import type { ListRowProps } from "../shared/types";
import { cssColor, cssFontFamily, cssRadius, cssShadow } from "./utils";

export function WebListRow({
  title,
  subtitle,
  meta,
  density = "comfortable",
  disabled,
  onPress
}: ListRowProps) {
  const verticalPadding = density === "compact" ? tokens.spacing.sm : tokens.spacing.md;
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      style={{
        width: "100%",
        minHeight: tokens.size.touchMin,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        textAlign: "left",
        gap: tokens.spacing.md,
        borderRadius: cssRadius.lg,
        border: `1px solid ${cssColor(tokens.component.listRow.border)}`,
        backgroundColor: disabled
          ? cssColor("surface")
          : cssColor(tokens.component.listRow.bg),
        padding: `${verticalPadding}px ${tokens.spacing.md}px`,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: cssShadow.low
      }}
    >
      <span style={{ minWidth: 0, display: "grid", gap: tokens.spacing.xs }}>
        <span
          style={{
            margin: 0,
            fontFamily: cssFontFamily.default,
            color: cssColor(tokens.component.listRow.fg),
            fontSize: tokens.typography.bodySize,
            fontWeight: 700,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {title}
        </span>
        {subtitle ? (
          <span
            style={{
              margin: 0,
              fontFamily: cssFontFamily.default,
              color: cssColor("inkMuted"),
              fontSize: tokens.typography.bodySmallSize,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
      {meta ? (
        <span
          style={{
            fontFamily: cssFontFamily.default,
            color: cssColor("accentInk"),
            fontSize: tokens.typography.labelSize,
            whiteSpace: "nowrap",
            fontWeight: 700
          }}
        >
          {meta}
        </span>
      ) : null}
    </button>
  );
}
