import React from "react";
import { Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import { defaultStateMessages } from "../shared/states";
import type { FeedbackStateProps } from "../shared/types";
import { MobileButton } from "./MobileButton";
import { resolveColor } from "./utils";

function MobileFeedbackState({
  message,
  background,
  onRetry,
  retryLabel
}: {
  message: { title: string; description?: string };
  background: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <View
      style={{
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: resolveColor("border"),
        backgroundColor: background,
        padding: tokens.spacing.lg,
        gap: tokens.spacing.sm
      }}
    >
      <Text
        style={{
          color: resolveColor("ink"),
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
          fontWeight: "800",
          textTransform: "uppercase"
        }}
      >
        {message.title}
      </Text>
      {message.description ? (
        <Text
          style={{
            color: resolveColor("inkMuted"),
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySmallSize
          }}
        >
          {message.description}
        </Text>
      ) : null}
      {retryLabel ? <MobileButton label={retryLabel} variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function MobileLoadingState({ title, description }: FeedbackStateProps = {}) {
  return (
    <MobileFeedbackState
      message={{
        title: title ?? defaultStateMessages.loading.title,
        description: description ?? defaultStateMessages.loading.description
      }}
      background={resolveColor(tokens.component.feedback.loading)}
    />
  );
}

export function MobileEmptyState({ title, description }: FeedbackStateProps = {}) {
  return (
    <MobileFeedbackState
      message={{
        title: title ?? defaultStateMessages.empty.title,
        description: description ?? defaultStateMessages.empty.description
      }}
      background={resolveColor(tokens.component.feedback.empty)}
    />
  );
}

export function MobileErrorState({ title, description, retryLabel, onRetry }: FeedbackStateProps = {}) {
  return (
    <MobileFeedbackState
      message={{
        title: title ?? defaultStateMessages.error.title,
        description: description ?? defaultStateMessages.error.description
      }}
      background={resolveColor(tokens.component.feedback.error)}
      onRetry={onRetry}
      retryLabel={retryLabel ?? defaultStateMessages.error.retryLabel}
    />
  );
}
