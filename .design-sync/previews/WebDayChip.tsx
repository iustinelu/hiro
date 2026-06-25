import { WebDayChip } from "@hiro/ui-primitives/web";

const noop = () => {};
const row = { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" } as const;

export const WeekRow = () => (
  <div style={row}>
    <WebDayChip label="M" onPress={noop} />
    <WebDayChip label="T" onPress={noop} />
    <WebDayChip label="W" active onPress={noop} />
    <WebDayChip label="T" onPress={noop} />
    <WebDayChip label="F" onPress={noop} />
    <WebDayChip label="S" onPress={noop} />
    <WebDayChip label="S" onPress={noop} />
  </div>
);

export const Active = () => <WebDayChip label="W" active onPress={noop} />;

export const Inactive = () => <WebDayChip label="S" onPress={noop} />;
