import { WebPresenceAvatar } from "@hiro/ui-primitives/web";

const row = { display: "flex", gap: 12, alignItems: "center" } as const;

export const StatusSweep = () => (
  <div style={row}>
    <WebPresenceAvatar name="Alex Rivera" status="online" />
    <WebPresenceAvatar name="Sam Chen" status="idle" />
    <WebPresenceAvatar name="Jordan Lee" status="offline" />
    <WebPresenceAvatar name="Maya Cole" status="online" highlighted />
  </div>
);

export const SizeSweep = () => (
  <div style={row}>
    <WebPresenceAvatar name="Sam Chen" status="online" size="sm" />
    <WebPresenceAvatar name="Alex Rivera" status="idle" size="md" />
    <WebPresenceAvatar name="Jordan Lee" status="offline" size="lg" />
  </div>
);

export const ActiveMembers = () => (
  <div style={row}>
    <WebPresenceAvatar name="Maya Cole" status="online" size="lg" highlighted />
    <WebPresenceAvatar name="Dad" status="online" size="md" />
    <WebPresenceAvatar name="Alex Rivera" status="idle" size="md" />
    <WebPresenceAvatar name="Sam Chen" status="offline" size="sm" />
  </div>
);
