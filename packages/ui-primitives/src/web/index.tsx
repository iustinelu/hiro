import { tokens } from "@hiro/ui-tokens";

export function WebButton(props: { label: string; disabled?: boolean }) {
  return (
    <button
      disabled={props.disabled}
      style={{
        padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
        borderRadius: tokens.radius.md,
        border: `1px solid ${tokens.color.border}`,
        backgroundColor: props.disabled ? tokens.color.border : tokens.color.accent,
        color: "white"
      }}
    >
      {props.label}
    </button>
  );
}

export function WebLoadingState() {
  return <div>Loading...</div>;
}

export function WebEmptyState() {
  return <div>Nothing here yet.</div>;
}

export function WebErrorState() {
  return <div>Something went wrong. Retry.</div>;
}
