import { tokens } from "@hiro/ui-tokens";
import type { SegmentedControlProps } from "../shared/types";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

export function WebSegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: tokens.spacing.xs,
        padding: tokens.spacing.xs,
        borderRadius: cssRadius.md,
        border: `1px solid ${cssColor("border")}`,
        backgroundColor: cssColor("surfaceMuted")
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
              borderRadius: cssRadius.sm,
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
              backgroundColor: active ? cssColor("accent") : "transparent",
              color: active ? cssColor("accentInk") : cssColor("inkMuted"),
              boxShadow: active ? `0 0 16px ${cssColor("accentSoft")}` : "none",
              cursor: "pointer",
              fontFamily: cssFontFamily.default,
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
