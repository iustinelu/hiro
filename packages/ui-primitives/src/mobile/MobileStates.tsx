import React from "react";
import { Pressable, Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import { defaultStateMessages } from "../shared/states";
import type { FeedbackStateProps } from "../shared/types";
import { resolveColor } from "./utils";

type FeedbackVariant = "loading" | "empty" | "error";

const variantConfig: Record<FeedbackVariant, { icon: string; accent: string }> = {
  loading: { icon: "●", accent: resolveColor("accent") },
  empty: { icon: "◆", accent: resolveColor("inkSoft") },
  error: { icon: "●", accent: resolveColor("error") }
};

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
  const config = variantConfig[variant];

  return (
    <View
      style={{
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: resolveColor("border"),
        backgroundColor: "rgba(15, 18, 30, 0.62)",
        padding: tokens.spacing.lg,
        gap: tokens.spacing.sm
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm }}>
        <Text
          style={{
            color: config.accent,
            fontSize: 18,
            lineHeight: 18
          }}
        >
          {config.icon}
        </Text>
        <Text
          style={{
            color: config.accent,
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySize,
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
            color: resolveColor("inkMuted"),
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySize,
            lineHeight: tokens.typography.lineHeightBody
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
              borderRadius: tokens.radius.md,
              borderWidth: 2,
              borderColor: resolveColor("inkMuted"),
              backgroundColor: "transparent",
              paddingVertical: tokens.spacing.sm,
              paddingHorizontal: tokens.spacing.lg
            }}
          >
            <Text
              style={{
                color: resolveColor("error"),
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.bodySmallSize,
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
