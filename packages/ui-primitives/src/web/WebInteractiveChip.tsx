import { tokens } from "@hiro/ui-tokens";
import type { InteractiveChipProps } from "../shared/types";
import { WebIcon } from "./WebIcon";
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
        border: `2px solid ${active ? resolveColor("accent") : resolveColor("border")}`,
        backgroundColor: active ? resolveColor("accentSoft") : resolveColor("surfaceStrong"),
        boxShadow: active ? "0 0 14px rgba(101,163,13,0.22)" : "none",
        color: active ? resolveColor("accentInk") : resolveColor("inkMuted"),
        padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
        cursor: "pointer",
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.bodySmallSize,
        fontWeight: 600
      }}
    >
      {leadingIcon ? <WebIcon name={leadingIcon} size={14} color={active ? resolveColor("accentInk") : resolveColor("inkMuted")} /> : null}
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
          <WebIcon name="close" size={12} color={resolveColor("inkSoft")} />
        </span>
      ) : null}
    </button>
  );
}
