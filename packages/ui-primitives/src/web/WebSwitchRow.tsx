import { tokens } from "@hiro/ui-tokens";
import type { SwitchRowProps } from "../shared/types";
import { resolveColor } from "./utils";

export function WebSwitchRow({ label, value, onToggle }: SwitchRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
        borderRadius: tokens.radius.md,
        border: `1px solid ${resolveColor("border")}`,
        backgroundColor: "rgba(255,255,255,0.02)"
      }}
    >
      <span
        style={{
          color: resolveColor("inkMuted"),
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySmallSize,
          fontWeight: 600
        }}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => onToggle?.(!value)}
        aria-pressed={value}
        style={{
          width: 38,
          height: 22,
          borderRadius: tokens.radius.pill,
          border: "none",
          backgroundColor: value ? resolveColor("accent") : "rgba(255,255,255,0.12)",
          position: "relative",
          cursor: "pointer"
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: value ? 18 : 2,
            width: 18,
            height: 18,
            borderRadius: tokens.radius.pill,
            backgroundColor: resolveColor("ink"),
            transition: `left ${tokens.motion.duration.fast}ms ${tokens.motion.easing.standard}`
          }}
        />
      </button>
    </div>
  );
}
