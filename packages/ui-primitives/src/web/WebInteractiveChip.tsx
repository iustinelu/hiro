import { tokens } from "@hiro/ui-tokens";
import type { InteractiveChipProps } from "../shared/types";
import { resolveColor } from "./utils";

export function WebInteractiveChip({
  label,
  active,
  leadingIcon,
  removable,
  onPress,
  onRemove
}: InteractiveChipProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.spacing.xs,
        borderRadius: tokens.radius.pill,
        border: `2px solid ${active ? resolveColor("accent") : resolveColor("borderStrong")}`,
        backgroundColor: active ? "rgba(255,109,36,0.12)" : "rgba(20, 24, 40, 0.92)",
        boxShadow: active ? `0 0 14px ${resolveColor("accentSoft")}` : "none",
        color: active ? resolveColor("accent") : resolveColor("ink"),
        padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
        cursor: "pointer",
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.bodySmallSize,
        fontWeight: 600
      }}
    >
      {leadingIcon ? <span style={{ fontSize: 12 }}>{leadingIcon}</span> : null}
      <span>{label}</span>
      {removable ? (
        <span
          role="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.();
          }}
          style={{ opacity: 0.72, fontSize: 12 }}
        >
          x
        </span>
      ) : null}
    </button>
  );
}
