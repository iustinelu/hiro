import { WebListRow } from "@hiro/ui-primitives/web";

const noop = () => {};
const stack = { display: "grid", gap: 8, maxWidth: 420 } as const;

export const ChoreList = () => (
  <div style={stack}>
    <WebListRow title="Take out recycling" subtitle="Due today · Assigned to Sam" meta="+10 pts" onPress={noop} />
    <WebListRow title="Vacuum living room" subtitle="Due tomorrow · Assigned to Maya" meta="+15 pts" onPress={noop} />
    <WebListRow title="Water the plants" subtitle="Every 3 days · Rotating" meta="+5 pts" onPress={noop} />
  </div>
);

export const Comfortable = () => (
  <div style={stack}>
    <WebListRow title="Grocery run" subtitle="Sunday · Shared list" meta="+20 pts" density="comfortable" onPress={noop} />
    <WebListRow title="Clean bathroom" subtitle="Saturday · Assigned to Dad" meta="+15 pts" density="comfortable" onPress={noop} />
  </div>
);

export const Compact = () => (
  <div style={stack}>
    <WebListRow title="Load dishwasher" subtitle="After dinner" meta="+5 pts" density="compact" onPress={noop} />
    <WebListRow title="Feed the cat" subtitle="Morning & evening" meta="+5 pts" density="compact" onPress={noop} />
    <WebListRow title="Wipe counters" subtitle="Daily" meta="+5 pts" density="compact" onPress={noop} />
  </div>
);

export const Disabled = () => (
  <div style={stack}>
    <WebListRow title="Mow the lawn" subtitle="Locked until spring" meta="+30 pts" disabled onPress={noop} />
    <WebListRow title="Wash the car" subtitle="Completed by Sam" meta="Done" disabled onPress={noop} />
  </div>
);
