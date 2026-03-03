import { tokens } from "@hiro/ui-tokens";
import type { InputProps } from "../shared/types";
import { resolveColor } from "./utils";

export function WebInput({
  label,
  placeholder,
  value,
  state = "default",
  helperText,
  onChangeText,
  secureTextEntry,
  forceFocused
}: InputProps) {
  const borderColor =
    state === "error"
      ? resolveColor(tokens.component.input.errorBorder)
      : state === "success"
        ? resolveColor(tokens.component.input.successBorder)
        : resolveColor(tokens.component.input.border);

  return (
    <label style={{ display: "grid", gap: tokens.spacing.xs, width: "100%" }}>
      {label ? (
        <span
          style={{
            fontFamily: tokens.typography.fontFamily,
            color: resolveColor("inkMuted"),
            fontSize: tokens.typography.labelSize,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: "uppercase"
          }}
        >
          {label}
        </span>
      ) : null}
      <input
        type={secureTextEntry ? "password" : "text"}
        value={value}
        placeholder={placeholder}
        disabled={state === "disabled"}
        onChange={(event) => onChangeText?.(event.target.value)}
        style={{
          minHeight: tokens.size.touchMin,
          width: "100%",
          borderRadius: tokens.radius.lg,
          border: `1px solid ${borderColor}`,
          backgroundColor: resolveColor(tokens.component.input.bg),
          color: resolveColor(tokens.component.input.fg),
          padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
          outlineColor: resolveColor(tokens.component.input.focusBorder),
          boxShadow:
            forceFocused || state === "default"
              ? `inset 0 0 0 1px ${resolveColor("accentSoft")}, 0 0 0 2px ${forceFocused ? resolveColor("accentSoft") : "transparent"}`
              : "none",
          transition: `all ${tokens.motion.duration.fast}ms ${tokens.motion.easing.standard}`
        }}
      />
      {helperText ? (
        <span
          style={{
            fontFamily: tokens.typography.fontFamily,
            color: state === "error" ? resolveColor("error") : resolveColor("inkSoft"),
            fontSize: tokens.typography.labelSize
          }}
        >
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
