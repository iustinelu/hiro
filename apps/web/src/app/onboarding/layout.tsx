import type { ReactNode } from "react";
import { tokens } from "@hiro/ui-tokens";
import { cssColor, cssShadow, cssRadius, cssFontFamily } from "@hiro/ui-primitives/web";

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
            background: cssColor("surface"),
            border: `1px solid ${cssColor("border")}`,
            borderRadius: cssRadius.xl,
            boxShadow: `${cssShadow.mid}, 0 0 60px ${cssColor("accentSoft")}`,
            padding: tokens.spacing.xxl,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: tokens.spacing.xxl,
              fontFamily: cssFontFamily.mono,
              letterSpacing: "0.3em",
              fontSize: tokens.typography.bodySmallSize,
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: cssColor("accent"), marginRight: "0.4em" }}>●</span>
            <span style={{ color: cssColor("ink") }}>HIRO</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
