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
        backgroundColor: "rgba(255,255,255,0.04)"
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
              border: "none",
              borderRadius: tokens.radius.sm,
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
              backgroundColor: active ? resolveColor("surfaceStrong") : "transparent",
              color: active ? resolveColor("ink") : resolveColor("inkSoft"),
              cursor: "pointer",
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.bodySmallSize,
              fontWeight: 700
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
