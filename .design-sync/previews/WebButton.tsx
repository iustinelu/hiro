import { WebButton } from "@hiro/ui-primitives/web";

const noop = () => {};
const row = { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" } as const;

export const Primary = () => <WebButton label="Add chore" variant="primary" onPress={noop} />;

export const Variants = () => (
  <div style={row}>
    <WebButton label="Add chore" variant="primary" onPress={noop} />
    <WebButton label="Mark done" variant="secondary" onPress={noop} />
    <WebButton label="Skip" variant="ghost" onPress={noop} />
    <WebButton label="Delete" variant="danger" onPress={noop} />
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <WebButton label="Small" size="sm" onPress={noop} />
    <WebButton label="Medium" size="md" onPress={noop} />
    <WebButton label="Large" size="lg" onPress={noop} />
  </div>
);

export const States = () => (
  <div style={row}>
    <WebButton label="Saving" loading loadingLabel="Saving…" onPress={noop} />
    <WebButton label="Unavailable" disabled onPress={noop} />
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
        <WebButton label="Add chore" variant="primary" onPress={noop} />
      </div>
    ))}
  </div>
);
