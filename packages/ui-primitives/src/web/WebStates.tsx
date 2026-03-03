import { useMemo } from "react";
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

function WebFeedbackState({
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
    <section
      style={{
        display: "grid",
        gap: tokens.spacing.sm,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${resolveColor("border")}`,
        backgroundColor: "rgba(15, 18, 30, 0.62)",
        padding: tokens.spacing.lg,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
        <span
          style={{
            color: config.accent,
            fontSize: 18,
            lineHeight: "18px",
            filter: variant === "loading" ? `drop-shadow(0 0 6px ${config.accent})` : "none"
          }}
        >
          {config.icon}
        </span>
        <strong
          style={{
            fontFamily: tokens.typography.fontFamily,
            color: config.accent,
            fontSize: tokens.typography.bodySize,
            letterSpacing: 0.6,
            textTransform: "uppercase"
          }}
        >
          {message.title}
        </strong>
      </div>
      {message.description ? (
        <p
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontFamily,
            color: resolveColor("inkMuted"),
            fontSize: tokens.typography.bodySize,
            lineHeight: `${tokens.typography.lineHeightBody}px`
          }}
        >
          {message.description}
        </p>
      ) : null}
      {retryLabel ? (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onRetry}
            style={{
              borderRadius: tokens.radius.md,
              border: `2px solid ${resolveColor("inkMuted")}`,
              background: "transparent",
              color: resolveColor("error"),
              padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.bodySmallSize,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              cursor: "pointer"
            }}
          >
            {retryLabel}
          </button>
        </div>
      ) : null}
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

  return <WebFeedbackState variant="loading" message={message} />;
}

export function WebEmptyState({ title, description }: FeedbackStateProps = {}) {
  const message = useMemo(
    () => ({
      title: title ?? defaultStateMessages.empty.title,
      description: description ?? defaultStateMessages.empty.description
    }),
    [description, title]
  );

  return <WebFeedbackState variant="empty" message={message} />;
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
      variant="error"
      message={message}
      onRetry={onRetry}
      retryLabel={retryLabel ?? defaultStateMessages.error.retryLabel}
    />
  );
}
