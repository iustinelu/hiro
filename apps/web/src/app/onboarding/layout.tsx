import type { ReactNode } from "react";
import { tokens } from "@hiro/ui-tokens";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div
          style={{
            background: tokens.color.surface,
            border: `1px solid ${tokens.color.border}`,
            borderRadius: tokens.radius.xl,
            boxShadow: `${tokens.elevation.mid}, 0 0 60px ${tokens.color.accentSoft}`,
            padding: tokens.spacing.xxl,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: tokens.spacing.xxl,
              fontFamily: tokens.typography.fontFamilyMono,
              letterSpacing: "0.3em",
              fontSize: tokens.typography.bodySmallSize,
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: tokens.color.accent, marginRight: "0.4em" }}>●</span>
            <span style={{ color: tokens.color.ink }}>HIRO</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
