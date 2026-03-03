import { tokens } from "@hiro/ui-tokens";
import type { NavigationPatternProps } from "../shared/types";
import { resolveColor } from "./utils";

export function WebNavigationPattern({ activeTabLabel = "TAB_BAR_ACTIVE_STATE", tabs, activeTab, onChange }: NavigationPatternProps) {
  return (
    <section style={{ display: "grid", gap: tokens.spacing.md }}>
      <header style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
        <span style={{ color: resolveColor("accent"), fontSize: 22 }}>▲</span>
        <strong style={{ color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamily, fontSize: 32, textTransform: "uppercase" }}>Navigation Patterns</strong>
      </header>
      <div style={{ borderRadius: tokens.radius.xl, border: `1px solid ${resolveColor("border")}`, backgroundColor: "rgba(11, 15, 29, 0.92)", padding: tokens.spacing.xl, display: "grid", gap: tokens.spacing.lg }}>
        <span style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamilyMono, fontSize: 22 }}>{activeTabLabel}</span>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, gap: tokens.spacing.md }}>
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange?.(tab.id)}
                style={{ border: "none", background: "transparent", color: active ? resolveColor("ink") : resolveColor("inkSoft"), display: "grid", justifyItems: "center", gap: 8, cursor: "pointer", padding: tokens.spacing.sm }}
              >
                <span
                  style={{
                    width: 32,
                    height: 4,
                    borderRadius: tokens.radius.pill,
                    background: active
                      ? `linear-gradient(90deg, ${resolveColor(tokens.component.navigation.activeIndicatorFrom)} 0%, ${resolveColor(tokens.component.navigation.activeIndicatorTo)} 100%)`
                      : "transparent",
                    boxShadow: active ? `0 0 8px ${resolveColor("accentSoft")}` : "none"
                  }}
                />
                <span style={{ fontSize: 22 }}>{active ? "▦" : "◻"}</span>
                <span style={{ textTransform: "uppercase", fontFamily: tokens.typography.fontFamilyMono, fontSize: 18 }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <article style={{ borderRadius: tokens.radius.lg, backgroundColor: "rgba(4, 7, 16, 0.95)", padding: tokens.spacing.lg, border: `1px solid ${resolveColor("border")}`, display: "grid", gap: tokens.spacing.sm }}>
          <span style={{ color: resolveColor("accentAlt"), fontFamily: tokens.typography.fontFamilyMono, fontSize: 24 }}>Indicator Logic</span>
          <p style={{ margin: 0, color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamily, fontSize: 34, lineHeight: "44px" }}>
            Active tab uses cobalt-to-orange gradient bar (32x4dp) anchored to top border with 8px blur glow.
          </p>
        </article>
        <footer style={{ borderTop: `1px solid ${resolveColor("accentStrong")}`, backgroundColor: "rgba(92, 42, 20, 0.28)", borderRadius: tokens.radius.md, textAlign: "center", padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`, color: resolveColor("accent"), fontFamily: tokens.typography.fontFamilyMono, letterSpacing: 2 }}>
          IOS SAFE AREA (34PT)
        </footer>
      </div>
    </section>
  );
}
