import { tokens } from "@hiro/ui-tokens";
import type { NavigationPatternProps } from "../shared/types";
import { WebIcon } from "./WebIcon";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

export function WebNavigationPattern({ activeTabLabel = "TAB_BAR_ACTIVE_STATE", tabs, activeTab, onChange }: NavigationPatternProps) {
  return (
    <section style={{ display: "grid", gap: tokens.spacing.md }}>
      <header style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
        <span style={{ display: "grid", color: cssColor("accent") }}>
          <WebIcon name="navigation" size={20} color={cssColor("accent")} />
        </span>
        <strong style={{ color: cssColor("inkMuted"), fontFamily: cssFontFamily.default, fontSize: tokens.typography.titleSize, lineHeight: `${tokens.typography.lineHeightHeadline}px`, textTransform: "uppercase" }}>Navigation Patterns</strong>
      </header>
      <div style={{ borderRadius: cssRadius.xl, border: `1px solid ${cssColor("border")}`, backgroundColor: cssColor("surfaceMuted"), padding: tokens.spacing.xl, display: "grid", gap: tokens.spacing.lg }}>
        <span style={{ color: cssColor("inkSoft"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px` }}>{activeTabLabel}</span>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, gap: tokens.spacing.md }}>
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange?.(tab.id)}
                style={{ border: "none", background: "transparent", color: active ? cssColor("ink") : cssColor("inkMuted"), display: "grid", justifyItems: "center", gap: 8, cursor: "pointer", padding: tokens.spacing.sm, minWidth: 0 }}
              >
                <span
                  style={{
                    width: 32,
                    height: 4,
                    borderRadius: cssRadius.pill,
                    background: active
                      ? `linear-gradient(90deg, ${cssColor(tokens.component.navigation.activeIndicatorFrom)} 0%, ${cssColor(tokens.component.navigation.activeIndicatorTo)} 100%)`
                      : "transparent",
                    boxShadow: active ? `0 0 8px ${cssColor("accentSoft")}` : "none"
                  }}
                />
                <span style={{ display: "grid" }}>
                  <WebIcon name={active ? "strokeFill" : "strokeOutline"} size={22} color={active ? cssColor("ink") : cssColor("inkSoft")} />
                </span>
                <span style={{ textTransform: "uppercase", fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px`, overflowWrap: "anywhere", textAlign: "center" }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <article style={{ borderRadius: cssRadius.lg, backgroundColor: cssColor("surface"), padding: tokens.spacing.lg, border: `1px solid ${cssColor("border")}`, display: "grid", gap: tokens.spacing.sm }}>
          <span style={{ color: cssColor("accentAlt"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySize }}>Indicator Logic</span>
          <p style={{ margin: 0, color: cssColor("inkMuted"), fontFamily: cssFontFamily.default, fontSize: tokens.typography.bodySize, lineHeight: `${tokens.typography.lineHeightBody}px` }}>
            Active tab uses cobalt-to-orange gradient bar (32x4dp) anchored to top border with 8px blur glow.
          </p>
        </article>
        <footer style={{ borderTop: `1px solid ${cssColor("accentStrong")}`, backgroundColor: cssColor("accentSoft"), borderRadius: cssRadius.md, textAlign: "center", padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`, color: cssColor("accent"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px`, letterSpacing: 2 }}>
          IOS SAFE AREA (34PT)
        </footer>
      </div>
    </section>
  );
}
