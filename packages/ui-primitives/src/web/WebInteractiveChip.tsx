import { tokens } from "@hiro/ui-tokens";
import type { InteractiveChipProps } from "../shared/types";
import { WebIcon } from "./WebIcon";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

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
        borderRadius: cssRadius.pill,
        border: `2px solid ${active ? cssColor("accent") : cssColor("borderStrong")}`,
        backgroundColor: active ? cssColor(tokens.component.chip.activeBg) : cssColor(tokens.component.chip.inactiveBg),
        boxShadow: active ? `0 0 14px ${cssColor("accentSoft")}` : "none",
        color: active ? cssColor("accent") : cssColor("ink"),
        padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
        cursor: "pointer",
        fontFamily: cssFontFamily.default,
        fontSize: tokens.typography.bodySmallSize,
        fontWeight: 600
      }}
    >
      {leadingIcon ? <WebIcon name={leadingIcon} size={14} color={active ? cssColor("accent") : cssColor("ink")} /> : null}
      <span>{label}</span>
      {removable ? (
        <span
          role="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.();
          }}
          style={{ opacity: 0.72, display: "grid" }}
        >
          <WebIcon name="close" size={12} color={cssColor("inkSoft")} />
        </span>
      ) : null}
    </button>
  );
}
