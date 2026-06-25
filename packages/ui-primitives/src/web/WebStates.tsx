import { useMemo } from "react";
import { tokens } from "@hiro/ui-tokens";
import { defaultStateMessages } from "../shared/states";
import type { FeedbackStateProps, IconName } from "../shared/types";
import { WebIcon } from "./WebIcon";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

type FeedbackVariant = "loading" | "empty" | "error";

const variantConfig: Record<FeedbackVariant, { icon: IconName; accentKey: "accent" | "inkSoft" | "error" }> = {
  loading: { icon: "loading", accentKey: "accent" },
  empty: { icon: "empty", accentKey: "inkSoft" },
  error: { icon: "error", accentKey: "error" }
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
  const accentColor = cssColor(config.accentKey);

  return (
    <section
      style={{
        display: "grid",
        gap: tokens.spacing.sm,
        borderRadius: cssRadius.lg,
        border: `1px solid ${cssColor("border")}`,
        backgroundColor: cssColor(tokens.component.feedback[variant]),
        padding: tokens.spacing.lg
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
        <span style={{ display: "grid", color: accentColor, filter: variant === "loading" ? `drop-shadow(0 0 6px ${accentColor})` : "none" }}>
          <WebIcon name={config.icon} size={18} color={accentColor} />
        </span>
        <strong
          style={{
            fontFamily: cssFontFamily.default,
            color: accentColor,
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
            fontFamily: cssFontFamily.default,
            color: cssColor("inkMuted"),
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
              borderRadius: cssRadius.md,
              border: `2px solid ${cssColor("inkMuted")}`,
              background: "transparent",
              color: cssColor("error"),
              padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
              fontFamily: cssFontFamily.default,
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
