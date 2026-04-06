import { tokens } from "@hiro/ui-tokens";
import type { DayChipProps } from "../shared/types";
import { resolveColor } from "./utils";

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
        border: `2px solid ${active ? resolveColor("accent") : resolveColor("borderStrong")}`,
        backgroundColor: active ? resolveColor("accentSoft") : "transparent",
        color: active ? resolveColor("accent") : resolveColor("inkMuted"),
        boxShadow: active ? `0 0 12px ${resolveColor("accentSoft")}` : "none",
        cursor: "pointer",
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.bodySmallSize,
        fontWeight: 700,
        transition: `all ${tokens.motion.duration.fast}ms ${tokens.motion.easing.standard}`,
      }}
    >
      {label}
    </button>
  );
}
