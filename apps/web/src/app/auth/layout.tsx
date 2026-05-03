import type { ReactNode } from "react";
import { tokens } from "@hiro/ui-tokens";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: tokens.color.bg,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div
          style={{
            background: tokens.color.surface,
            border: `1px solid ${tokens.color.border}`,
            borderRadius: tokens.radius.xl,
            boxShadow: tokens.elevation.mid,
            padding: tokens.spacing.xxl,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: tokens.spacing.xxl,
              gap: 8,
              fontFamily: tokens.typography.fontFamily,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: tokens.color.accent,
            }} />
            <span style={{ color: tokens.color.ink }}>Hiro</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
