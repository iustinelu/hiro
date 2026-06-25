import { tokens } from "@hiro/ui-tokens";
import type { DayChipProps } from "../shared/types";
import { cssColor, cssFontFamily } from "./utils";

export function WebDayChip({ label, active, onPress }: DayChipProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        appearance: "none",
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        border: `2px solid ${active ? cssColor("accent") : cssColor("borderStrong")}`,
        backgroundColor: active ? cssColor("accentSoft") : "transparent",
        color: active ? cssColor("accent") : cssColor("inkMuted"),
        boxShadow: active ? `0 0 12px ${cssColor("accentSoft")}` : "none",
        cursor: "pointer",
        fontFamily: cssFontFamily.default,
        fontSize: tokens.typography.bodySmallSize,
        fontWeight: 700,
        transition: `all ${tokens.motion.duration.fast}ms ${tokens.motion.easing.standard}`,
      }}
    >
      {label}
    </button>
  );
}
