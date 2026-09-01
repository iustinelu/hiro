import React from "react";
import { Pressable, Text, View } from "react-native";
import type { TaskRowLeading, TaskRowProps } from "../shared/types";
import { MobileIcon } from "./MobileIcon";
import { useTheme } from "./theme-context";
import type { ResolvedTheme } from "./theme-context";
import { resolveColor, resolveFontFamily, resolveFontFamilyMono } from "./utils";

/* ─── MobileTaskRow (HIR-83) ──────────────────────────────────────────────────
 * The single household-chore row used across the Tasks board, Home, and Manage.
 * Leading affordance encodes the role (complete-circle / member avatar / cadence
 * glyph); the body is tappable to open a detail sheet; the trailing points chip
 * is accent-tinted and scales subtly with value.
 */

const CIRCLE = 28;
const AVATAR = 36;

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// Higher-value chores read a touch louder without breaking the rhythm.
function pointsFontSize(t: ResolvedTheme, points: number): number {
  if (points >= 15) return t.typography.bodySmallSize + 2;
  if (points >= 8) return t.typography.bodySmallSize + 1;
  return t.typography.labelSize;
}

function LeadingAffordance({ leading, completed, disabled }: {
  leading: TaskRowLeading;
  completed: boolean;
  disabled: boolean;
}) {
  const t = useTheme();

  if (leading.kind === "checkbox") {
    const filled = completed;
    return (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: filled, disabled: disabled || leading.busy }}
        disabled={disabled || leading.busy}
        onPress={leading.onToggle}
        hitSlop={8}
        style={{ width: t.size.touchMin, height: t.size.touchMin, alignItems: "center", justifyContent: "center", marginLeft: -t.spacing.sm }}
      >
        <View
          style={{
            width: CIRCLE,
            height: CIRCLE,
            borderRadius: t.radius.pill,
            borderWidth: 2,
            borderColor: filled ? resolveColor(t, "success") : resolveColor(t, "borderStrong"),
            backgroundColor: filled ? resolveColor(t, "success") : "transparent",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {filled ? <MobileIcon name="check" size={18} color={resolveColor(t, "bg")} /> : null}
        </View>
      </Pressable>
    );
  }

  if (leading.kind === "avatar") {
    return (
      <View
        style={{
          width: AVATAR,
          height: AVATAR,
          borderRadius: t.radius.pill,
          borderWidth: 2,
          borderColor: leading.highlighted ? resolveColor(t, "accent") : resolveColor(t, "borderStrong"),
          backgroundColor: resolveColor(t, "surfaceMuted"),
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text style={{ color: resolveColor(t, "ink"), fontFamily: resolveFontFamily(t, 700), fontSize: t.typography.labelSize }}>
          {initials(leading.name)}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width: AVATAR,
        height: AVATAR,
        borderRadius: t.radius.md,
        borderWidth: t.flags.borderWidth,
        borderColor: resolveColor(t, "border"),
        backgroundColor: resolveColor(t, "surfaceStrong"),
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <MobileIcon name={leading.icon} size={18} color={resolveColor(t, "accent")} />
    </View>
  );
}

export function MobileTaskRow({
  title,
  meta,
  points,
  leading,
  completed = false,
  disabled = false,
  onPress,
  actions
}: TaskRowProps) {
  const t = useTheme();

  const body = (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.md, minHeight: 56 - t.spacing.sm * 2 }}>
        {leading ? <LeadingAffordance leading={leading} completed={completed} disabled={disabled} /> : null}

        <View style={{ flex: 1, gap: 2 }}>
          <Text
            numberOfLines={1}
            style={{
              color: completed ? resolveColor(t, "inkSoft") : resolveColor(t, "ink"),
              textDecorationLine: completed ? "line-through" : "none",
              fontFamily: resolveFontFamily(t, 700),
              fontSize: t.typography.bodySize,
              textTransform: t.flags.textTransform
            }}
          >
            {title}
          </Text>
          {meta ? (
            <Text
              numberOfLines={1}
              style={{
                color: resolveColor(t, "inkMuted"),
                fontFamily: resolveFontFamily(t, 500),
                fontSize: t.typography.bodySmallSize
              }}
            >
              {meta}
            </Text>
          ) : null}
        </View>

        {typeof points === "number" ? (
          <View
            style={{
              flexShrink: 0,
              paddingVertical: t.spacing.xs,
              paddingHorizontal: t.spacing.sm,
              borderRadius: t.radius.pill,
              borderWidth: t.flags.borderWidth,
              borderColor: resolveColor(t, "accent"),
              backgroundColor: resolveColor(t, "accentSoft")
            }}
          >
            <Text
              style={{
                color: resolveColor(t, "accentInk"),
                fontFamily: resolveFontFamilyMono(t, 700),
                fontSize: pointsFontSize(t, points)
              }}
            >
              {points}
            </Text>
          </View>
        ) : null}
      </View>

      {actions ? (
        <View style={{ flexDirection: "row", gap: t.spacing.sm, marginTop: t.spacing.sm, flexWrap: "wrap" }}>
          {actions}
        </View>
      ) : null}
    </>
  );

  const containerStyle = (pressed: boolean) => ({
    minHeight: t.size.touchMin,
    borderRadius: t.radius.lg,
    borderWidth: t.flags.borderWidth,
    borderColor: resolveColor(t, t.component.listRow.border as keyof typeof t.color),
    backgroundColor: pressed && onPress
      ? resolveColor(t, t.component.listRow.pressedBg as keyof typeof t.color)
      : resolveColor(t, t.component.listRow.bg as keyof typeof t.color),
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
    opacity: disabled ? 0.6 : 1
  });

  if (!onPress) {
    return <View style={containerStyle(false)}>{body}</View>;
  }

  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => containerStyle(pressed)}>
      {body}
    </Pressable>
  );
}
