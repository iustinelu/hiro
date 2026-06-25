import { WebStatusBadge } from "@hiro/ui-primitives/web";

const row = { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" } as const;

export const AllTones = () => (
  <div style={row}>
    <WebStatusBadge label="Done" tone="success" />
    <WebStatusBadge label="Due soon" tone="warning" />
    <WebStatusBadge label="Overdue" tone="error" />
    <WebStatusBadge label="Draft" tone="neutral" />
  </div>
);

export const ChoreDone = () => <WebStatusBadge label="Done" tone="success" />;

export const ChoreOverdue = () => <WebStatusBadge label="Overdue" tone="error" />;

export const DefaultNeutral = () => <WebStatusBadge label="Unassigned" />;

// All four Hiro themes. Each panel sets data-theme on its own canvas so the
// [data-theme="…"] token overrides apply to the badges inside it.
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
  minWidth: 190,
  display: "grid",
  gap: 10,
  justifyItems: "start"
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
        <div style={row}>
          <WebStatusBadge label="Done" tone="success" />
          <WebStatusBadge label="Overdue" tone="error" />
        </div>
      </div>
    ))}
  </div>
);
