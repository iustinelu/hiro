import { useMemo } from "react";
import { tokens } from "@hiro/ui-tokens";
import { defaultStateMessages } from "../shared/states";
import type { FeedbackStateProps } from "../shared/types";
import { WebButton } from "./WebButton";
import { resolveColor } from "./utils";

function WebFeedbackState({
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
    <section
      style={{
        display: "grid",
        gap: tokens.spacing.sm,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${resolveColor("border")}`,
        backgroundColor: background,
        padding: tokens.spacing.lg,
        boxShadow: tokens.elevation.low
      }}
    >
      <strong
        style={{
          fontFamily: tokens.typography.fontFamily,
          color: resolveColor("ink"),
          fontSize: tokens.typography.bodySize,
          letterSpacing: 0.2,
          textTransform: "uppercase"
        }}
      >
        {message.title}
      </strong>
      {message.description ? (
        <p style={{ margin: 0, fontFamily: tokens.typography.fontFamily, color: resolveColor("inkMuted") }}>
          {message.description}
        </p>
      ) : null}
      {retryLabel ? <WebButton label={retryLabel} variant="secondary" onPress={onRetry} /> : null}
    </section>
  );
}

export function WebLoadingState({ title, description }: FeedbackStateProps = {}) {
  const message = useMemo(
    () => ({
      title: title ?? defaultStateMessages.loading.title,
      description: description ?? defaultStateMessages.loading.description
    }),
    [description, title]
  );

  return <WebFeedbackState message={message} background={resolveColor(tokens.component.feedback.loading)} />;
}

export function WebEmptyState({ title, description }: FeedbackStateProps = {}) {
  const message = useMemo(
    () => ({
      title: title ?? defaultStateMessages.empty.title,
      description: description ?? defaultStateMessages.empty.description
    }),
    [description, title]
  );

  return <WebFeedbackState message={message} background={resolveColor(tokens.component.feedback.empty)} />;
}

export function WebErrorState({ title, description, retryLabel, onRetry }: FeedbackStateProps = {}) {
  const message = useMemo(
    () => ({
      title: title ?? defaultStateMessages.error.title,
      description: description ?? defaultStateMessages.error.description
    }),
    [description, title]
  );

  return (
    <WebFeedbackState
      message={message}
      background={resolveColor(tokens.component.feedback.error)}
      onRetry={onRetry}
      retryLabel={retryLabel ?? defaultStateMessages.error.retryLabel}
    />
  );
}
