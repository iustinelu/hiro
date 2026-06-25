import { WebCard } from "@hiro/ui-primitives/web";

// Render on the real Aurora canvas (the preview card HTML otherwise uses a white
// page, over which the translucent `warning` tone fill composites to an
// unreadable cream). This matches how cards actually appear in-app.
const wrap = {
  maxWidth: 360,
  background: "var(--hiro-color-bg)",
  padding: 20,
  borderRadius: 20
} as const;
const statRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12
} as const;
const bigStat = { fontSize: 28, fontWeight: 800, color: "var(--hiro-color-ink)" } as const;
const mutedLabel = { fontSize: 13, color: "var(--hiro-color-ink-muted)" } as const;

export const Default = () => (
  <div style={wrap}>
    <WebCard title="This week's chores" description="Shared across the Patel household">
      <div style={statRow}>
        <span style={bigStat}>18 / 24</span>
        <span style={mutedLabel}>completed</span>
      </div>
    </WebCard>
  </div>
);

export const Accent = () => (
  <div style={wrap}>
    <WebCard
      tone="accent"
      title="Reward unlocked"
      description="Movie night for the whole family"
    >
      <div style={statRow}>
        <span style={bigStat}>1,250 pts</span>
        <span style={mutedLabel}>redeemed</span>
      </div>
    </WebCard>
  </div>
);

export const Warning = () => (
  <div style={wrap}>
    <WebCard
      tone="warning"
      title="3 chores overdue"
      description="Take out recycling, water plants, vacuum stairs"
    >
      <div style={statRow}>
        <span style={bigStat}>3</span>
        <span style={mutedLabel}>need attention today</span>
      </div>
    </WebCard>
  </div>
);

export const TextOnly = () => (
  <div style={wrap}>
    <WebCard
      title="House rules"
      description="Dishes done by 8pm, shoes off at the door, and weekend chores wrapped before screen time."
    />
  </div>
);

// All four Hiro themes. Each panel sets data-theme on its own canvas so the
// [data-theme="…"] token overrides apply to the card inside it.
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
  width: 260,
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
        <WebCard title="This week's chores" description="Shared across the Patel household">
          <div style={statRow}>
            <span style={bigStat}>18 / 24</span>
            <span style={mutedLabel}>completed</span>
          </div>
        </WebCard>
      </div>
    ))}
  </div>
);
