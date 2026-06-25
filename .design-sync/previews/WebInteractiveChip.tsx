import { WebInteractiveChip } from "@hiro/ui-primitives/web";

const noop = () => {};
const row = { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" } as const;

export const ActiveVsInactive = () => (
  <div style={row}>
    <WebInteractiveChip label="Kitchen" active onPress={noop} />
    <WebInteractiveChip label="Bathroom" onPress={noop} />
    <WebInteractiveChip label="Garden" onPress={noop} />
  </div>
);

export const WithLeadingIcon = () => (
  <div style={row}>
    <WebInteractiveChip label="Quick wins" active leadingIcon="spark" onPress={noop} />
    <WebInteractiveChip label="Home" leadingIcon="home" onPress={noop} />
  </div>
);

export const Removable = () => (
  <div style={row}>
    <WebInteractiveChip label="Alex" removable active onPress={noop} onRemove={noop} />
    <WebInteractiveChip label="Priya" removable onPress={noop} onRemove={noop} />
  </div>
);
