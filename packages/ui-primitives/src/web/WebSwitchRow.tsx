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
        backgroundColor: "rgba(15, 18, 30, 0.72)"
      }}
    >
      <span
        style={{
          color: resolveColor("ink"),
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySmallSize,
          lineHeight: `${tokens.typography.lineHeightBody}px`,
          fontWeight: 600,
          flex: 1,
          paddingRight: tokens.spacing.sm,
          overflowWrap: "anywhere"
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
          backgroundColor: value ? resolveColor("accent") : resolveColor("surfaceStrong"),
          boxShadow: value ? `0 0 12px ${resolveColor("accentSoft")}` : "none",
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
            backgroundColor: value ? resolveColor("ink") : resolveColor("inkMuted"),
            transition: `left ${tokens.motion.duration.fast}ms ${tokens.motion.easing.standard}`
          }}
        />
      </button>
    </div>
  );
}
