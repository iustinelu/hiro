import { WebKpiTile } from "@hiro/ui-primitives/web";

const wrap = { maxWidth: 260 } as const;

export const Default = () => (
  <div style={wrap}>
    <WebKpiTile title="Tasks completed" value="24" deltaLabel="+12%" deltaTone="success" bars={[0.35, 0.58, 0.42, 0.74, 0.92]} />
  </div>
);

export const OverdueWarning = () => (
  <div style={wrap}>
    <WebKpiTile title="Overdue" value="3" deltaLabel="+2 today" deltaTone="warning" bars={[0.2, 0.4, 0.3, 0.6, 0.8]} />
  </div>
);

export const PointsAltAccent = () => (
  <div style={wrap}>
    <WebKpiTile title="Points earned" value="1,250" deltaLabel="+8%" deltaTone="success" accent="accent" bars={[0.5, 0.45, 0.7, 0.65, 0.95]} />
  </div>
);

// All four Hiro themes. Each panel sets data-theme on its own canvas so the
// [data-theme="…"] token overrides apply to the component inside it.
const THEMES = [
  ["aurora", "Aurora"],
  ["daylight", "Daylight"],
  ["superchore", "Super Chore"],
  ["neon", "Neon Grid"]
] as const;
const panel = {
  background: "var(--hiro-color-bg)",
  color: "var(--hiro-color-ink)",
  fontFamily: "var(--hiro-font-family)",
  padding: 16,
  borderRadius: 16,
  width: 220,
  display: "grid",
  gap: 10
} as const;
const themeLabel = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  fontWeight: 700,
  color: "var(--hiro-color-ink-muted)"
} as const;

export const Themes = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
    {THEMES.map(([id, name]) => (
      <div key={id} data-theme={id} style={panel}>
        <span style={themeLabel}>{name}</span>
        <WebKpiTile title="Tasks done" value="24" deltaLabel="+12%" deltaTone="success" />
      </div>
    ))}
  </div>
);
