import { WebSwitchRow } from "@hiro/ui-primitives/web";

const noop = () => {};
const wrap = { maxWidth: 360 } as const;
const stack = { maxWidth: 360, display: "flex", flexDirection: "column", gap: 10 } as const;

export const On = () => (
  <div style={wrap}>
    <WebSwitchRow label="Push notifications" value={true} onToggle={noop} />
  </div>
);

export const Off = () => (
  <div style={wrap}>
    <WebSwitchRow label="Quiet hours" value={false} onToggle={noop} />
  </div>
);

export const SettingsList = () => (
  <div style={stack}>
    <WebSwitchRow label="Push notifications" value={true} onToggle={noop} />
    <WebSwitchRow label="Chore reminders" value={true} onToggle={noop} />
    <WebSwitchRow label="Quiet hours" value={false} onToggle={noop} />
  </div>
);
