import { tokens } from "@hiro/ui-tokens";
import type { InputProps } from "../shared/types";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

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
      ? cssColor(tokens.component.input.errorBorder)
      : state === "success"
        ? cssColor(tokens.component.input.successBorder)
        : cssColor(tokens.component.input.border);

  return (
    <label style={{ display: "grid", gap: tokens.spacing.xs, width: "100%" }}>
      {label ? (
        <span
          style={{
            fontFamily: cssFontFamily.default,
            color: cssColor("inkMuted"),
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
          borderRadius: cssRadius.lg,
          border: `1px solid ${borderColor}`,
          backgroundColor: cssColor(tokens.component.input.bg),
          color: cssColor(tokens.component.input.fg),
          padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
          fontFamily: cssFontFamily.default,
          fontSize: tokens.typography.bodySize,
          outlineColor: cssColor(tokens.component.input.focusBorder),
          boxShadow:
            forceFocused || state === "default"
              ? `inset 0 0 0 1px ${cssColor("accentSoft")}, 0 0 0 2px ${forceFocused ? cssColor("accentSoft") : "transparent"}`
              : "none",
          transition: `all ${tokens.motion.duration.fast}ms ${tokens.motion.easing.standard}`
        }}
      />
      {helperText ? (
        <span
          style={{
            fontFamily: cssFontFamily.default,
            color: state === "error" ? cssColor("error") : cssColor("inkSoft"),
            fontSize: tokens.typography.labelSize
          }}
        >
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
