import { tokens } from "@hiro/ui-tokens";
import type { SwitchRowProps } from "../shared/types";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

export function WebSwitchRow({ label, value, onToggle }: SwitchRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
        borderRadius: cssRadius.md,
        border: `1px solid ${cssColor("border")}`,
        backgroundColor: cssColor("surfaceMuted")
      }}
    >
      <span
        style={{
          color: cssColor("ink"),
          fontFamily: cssFontFamily.default,
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
          borderRadius: cssRadius.pill,
          border: "none",
          backgroundColor: value ? cssColor(tokens.component.switch.trackOn) : cssColor(tokens.component.switch.trackOff),
          boxShadow: value ? `0 0 12px ${cssColor("accentSoft")}` : "none",
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
            borderRadius: cssRadius.pill,
            backgroundColor: value ? cssColor(tokens.component.switch.thumbOn) : cssColor(tokens.component.switch.thumbOff),
            transition: `left ${tokens.motion.duration.fast}ms ${tokens.motion.easing.standard}`
          }}
        />
      </button>
    </div>
  );
}
