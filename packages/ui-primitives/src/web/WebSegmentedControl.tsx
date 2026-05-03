import { tokens } from "@hiro/ui-tokens";
import type { SegmentedControlProps } from "../shared/types";
import { resolveColor } from "./utils";

export function WebSegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: tokens.spacing.xs,
        padding: tokens.spacing.xs,
        borderRadius: tokens.radius.md,
        border: `1px solid ${resolveColor("border")}`,
        backgroundColor: resolveColor("surfaceStrong")
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(option.value)}
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              borderRadius: tokens.radius.sm,
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
              backgroundColor: active ? resolveColor("accent") : "transparent",
              color: active ? resolveColor("bgElevated") : resolveColor("inkMuted"),
              boxShadow: active ? "0 0 14px rgba(101,163,13,0.28)" : "none",
              cursor: "pointer",
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.bodySmallSize,
              lineHeight: `${tokens.typography.lineHeightLabel}px`,
              fontWeight: 700,
              whiteSpace: "normal",
              overflowWrap: "anywhere"
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
