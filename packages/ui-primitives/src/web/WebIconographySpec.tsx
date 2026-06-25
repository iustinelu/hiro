import { tokens } from "@hiro/ui-tokens";
import type { IconographySpecProps } from "../shared/types";
import { WebIcon } from "./WebIcon";
import { cssColor, cssFontFamily, cssRadius } from "./utils";

export function WebIconographySpec({ title = "Iconography Standards" }: IconographySpecProps) {
  return (
    <section style={{ display: "grid", gap: tokens.spacing.md }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ color: cssColor("inkMuted"), fontSize: tokens.typography.titleSize, fontFamily: cssFontFamily.default, textTransform: "uppercase" }}>{title}</strong>
        <span style={{ color: cssColor("inkSoft"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px` }}>SPEC_V1.2</span>
      </header>
      <div style={{ display: "grid", gap: tokens.spacing.md, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <article style={{ borderRadius: cssRadius.lg, border: `1px solid ${cssColor("border")}`, backgroundColor: cssColor("surface"), padding: tokens.spacing.lg, display: "grid", gap: tokens.spacing.sm }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: cssColor("inkMuted"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px` }}>Grid</span>
            <span style={{ color: cssColor("accent"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px` }}>24px</span>
          </div>
          <div style={{ height: 170, borderRadius: cssRadius.md, border: `1px solid ${cssColor("borderStrong")}`, backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "8px 8px", display: "grid", placeItems: "center" }}>
            <span style={{ width: 58, height: 58, borderRadius: cssRadius.pill, border: `3px solid ${cssColor("accent")}`, display: "grid", placeItems: "center" }}>
              <WebIcon name="home" size={28} color={cssColor("ink")} />
            </span>
          </div>
          <p style={{ margin: 0, color: cssColor("inkSoft"), fontFamily: cssFontFamily.default, fontSize: tokens.typography.bodySize }}>Fixed 24px bounding box with 2px safe padding.</p>
        </article>
        <article style={{ borderRadius: cssRadius.lg, border: `1px solid ${cssColor("border")}`, backgroundColor: cssColor("surface"), padding: tokens.spacing.lg, display: "grid", gap: tokens.spacing.sm }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: cssColor("inkMuted"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px` }}>Stroke</span>
            <span style={{ color: cssColor("accent"), fontFamily: cssFontFamily.mono, fontSize: tokens.typography.bodySmallSize, lineHeight: `${tokens.typography.lineHeightLabel}px` }}>1.5px</span>
          </div>
          <div style={{ height: 170, borderRadius: cssRadius.md, backgroundColor: cssColor("surfaceMuted"), display: "grid", placeItems: "center", gap: tokens.spacing.sm }}>
            <span style={{ color: cssColor("ink"), display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
              <WebIcon name="strokeOutline" size={24} color={cssColor("ink")} />
              <WebIcon name="strokeFill" size={24} color={cssColor("ink")} />
            </span>
            <span style={{ width: 120, height: 4, borderRadius: cssRadius.pill, backgroundColor: cssColor("accent") }} />
          </div>
          <p style={{ margin: 0, color: cssColor("inkSoft"), fontFamily: cssFontFamily.default, fontSize: tokens.typography.bodySize }}>Outlined inactive to filled active transition.</p>
        </article>
      </div>
    </section>
  );
}
