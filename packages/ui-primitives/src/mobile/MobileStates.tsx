import React from "react";
import { Pressable, Text, View } from "react-native";
import { defaultStateMessages } from "../shared/states";
import type { FeedbackStateProps, IconName } from "../shared/types";
import { MobileIcon } from "./MobileIcon";
import { useTheme, type ResolvedTheme } from "./theme-context";
import { resolveColor } from "./utils";

type FeedbackVariant = "loading" | "empty" | "error";

function variantConfigFor(t: ResolvedTheme): Record<FeedbackVariant, { icon: IconName; accent: string }> {
  return {
    loading: { icon: "loading", accent: resolveColor(t, "accent") },
    empty: { icon: "empty", accent: resolveColor(t, "inkSoft") },
    error: { icon: "error", accent: resolveColor(t, "error") }
  };
}

function MobileFeedbackState({
  variant,
  message,
  onRetry,
  retryLabel
}: {
  variant: FeedbackVariant;
  message: { title: string; description?: string };
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const t = useTheme();
  const config = variantConfigFor(t)[variant];

  return (
    <View
      style={{
        borderRadius: t.radius.lg,
        borderWidth: t.flags.borderWidth,
        borderColor: resolveColor(t, "border"),
        backgroundColor: resolveColor(t, "surfaceMuted"),
        padding: t.spacing.lg,
        gap: t.spacing.sm
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <MobileIcon name={config.icon} size={18} color={config.accent} />
        </View>
        <Text
          style={{
            color: config.accent,
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.bodySize,
            fontWeight: "800",
            letterSpacing: 0.6,
            textTransform: "uppercase"
          }}
        >
          {message.title}
        </Text>
      </View>
      {message.description ? (
        <Text
          style={{
            color: resolveColor(t, "inkMuted"),
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.bodySize,
            lineHeight: t.typography.lineHeightBody
          }}
        >
          {message.description}
        </Text>
      ) : null}
      {retryLabel ? (
        <View style={{ alignItems: "flex-end" }}>
          <Pressable
            onPress={onRetry}
            style={{
              borderRadius: t.radius.md,
              borderWidth: 2,
              borderColor: resolveColor(t, "inkMuted"),
              backgroundColor: "transparent",
              paddingVertical: t.spacing.sm,
              paddingHorizontal: t.spacing.lg
            }}
          >
            <Text
              style={{
                color: resolveColor(t, "error"),
                fontFamily: t.typography.fontFamily,
                fontSize: t.typography.bodySmallSize,
                fontWeight: "800",
                letterSpacing: 1.2,
                textTransform: "uppercase"
              }}
            >
              {retryLabel}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export function MobileLoadingState({ title, description }: FeedbackStateProps = {}) {
  return (
    <MobileFeedbackState
      variant="loading"
      message={{
        title: title ?? defaultStateMessages.loading.title,
        description: description ?? defaultStateMessages.loading.description
      }}
    />
  );
}

export function MobileEmptyState({ title, description }: FeedbackStateProps = {}) {
  return (
    <MobileFeedbackState
      variant="empty"
      message={{
        title: title ?? defaultStateMessages.empty.title,
        description: description ?? defaultStateMessages.empty.description
      }}
    />
  );
}

export function MobileErrorState({ title, description, retryLabel, onRetry }: FeedbackStateProps = {}) {
  return (
    <MobileFeedbackState
      variant="error"
      message={{
        title: title ?? defaultStateMessages.error.title,
        description: description ?? defaultStateMessages.error.description
      }}
      onRetry={onRetry}
      retryLabel={retryLabel ?? defaultStateMessages.error.retryLabel}
    />
  );
}
