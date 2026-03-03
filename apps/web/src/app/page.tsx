import Link from "next/link";
import { tokens } from "@hiro/ui-tokens";

export default function WebShellPage() {
  return (
    <main
      style={{
        display: "grid",
        gap: tokens.spacing.lg,
        maxWidth: 760,
        margin: "0 auto",
        padding: tokens.spacing.xl
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: tokens.typography.fontFamily,
          color: tokens.color.ink
        }}
      >
        Hiro Web Shell
      </h1>
      <p
        style={{
          margin: 0,
          fontFamily: tokens.typography.fontFamily,
          color: tokens.color.inkMuted
        }}
      >
        Core navigation shell is active. Open the design-system gallery for HIR-31 QA.
      </p>
      <Link
        href="/design-system"
        style={{
          width: "fit-content",
          textDecoration: "none",
          padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
          borderRadius: tokens.radius.pill,
          border: `1px solid ${tokens.color.borderStrong}`,
          color: tokens.color.ink,
          fontFamily: tokens.typography.fontFamily,
          fontWeight: 700
        }}
      >
        Open Design System Gallery
      </Link>
    </main>
  );
}
