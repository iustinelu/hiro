import { tokens } from "@hiro/ui-tokens";
import type { IconographySpecProps } from "../shared/types";
import { resolveColor } from "./utils";

export function WebIconographySpec({ title = "Iconography Standards" }: IconographySpecProps) {
  return (
    <section style={{ display: "grid", gap: tokens.spacing.md }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ color: resolveColor("inkMuted"), fontSize: tokens.typography.titleSize, fontFamily: tokens.typography.fontFamily, textTransform: "uppercase" }}>{title}</strong>
        <span style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamilyMono }}>SPEC_V1.2</span>
      </header>
      <div style={{ display: "grid", gap: tokens.spacing.md, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <article style={{ borderRadius: tokens.radius.lg, border: `1px solid ${resolveColor("border")}`, backgroundColor: "rgba(12, 16, 30, 0.9)", padding: tokens.spacing.lg, display: "grid", gap: tokens.spacing.sm }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamilyMono }}>Grid</span>
            <span style={{ color: resolveColor("accent"), fontFamily: tokens.typography.fontFamilyMono }}>24px</span>
          </div>
          <div style={{ height: 170, borderRadius: tokens.radius.md, border: `1px solid ${resolveColor("borderStrong")}`, backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "8px 8px", display: "grid", placeItems: "center" }}>
            <span style={{ width: 58, height: 58, borderRadius: tokens.radius.pill, border: `3px solid ${resolveColor("accent")}`, display: "grid", placeItems: "center", color: resolveColor("ink"), fontSize: 28 }}>⌂</span>
          </div>
          <p style={{ margin: 0, color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamily, fontSize: tokens.typography.bodySize }}>Fixed 24px bounding box with 2px safe padding.</p>
        </article>
        <article style={{ borderRadius: tokens.radius.lg, border: `1px solid ${resolveColor("border")}`, backgroundColor: "rgba(12, 16, 30, 0.9)", padding: tokens.spacing.lg, display: "grid", gap: tokens.spacing.sm }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamilyMono }}>Stroke</span>
            <span style={{ color: resolveColor("accent"), fontFamily: tokens.typography.fontFamilyMono }}>1.5px</span>
          </div>
          <div style={{ height: 170, borderRadius: tokens.radius.md, backgroundColor: "rgba(7, 10, 18, 0.95)", display: "grid", placeItems: "center", gap: tokens.spacing.sm }}>
            <span style={{ color: resolveColor("ink"), fontSize: tokens.typography.titleSize }}>◌  ◉</span>
            <span style={{ width: 120, height: 4, borderRadius: tokens.radius.pill, backgroundColor: resolveColor("accent") }} />
          </div>
          <p style={{ margin: 0, color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamily, fontSize: tokens.typography.bodySize }}>Outlined inactive to filled active transition.</p>
        </article>
      </div>
    </section>
  );
}
