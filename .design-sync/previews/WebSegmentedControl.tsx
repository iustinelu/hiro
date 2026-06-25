import { WebSegmentedControl } from "@hiro/ui-primitives/web";

const noop = () => {};
const wrap = { maxWidth: 360 } as const;

const range = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" }
];

export const WeekSelected = () => (
  <div style={wrap}>
    <WebSegmentedControl options={range} value="week" onChange={noop} />
  </div>
);

export const DaySelected = () => (
  <div style={wrap}>
    <WebSegmentedControl options={range} value="day" onChange={noop} />
  </div>
);

export const TwoOptions = () => (
  <div style={wrap}>
    <WebSegmentedControl
      options={[
        { label: "All chores", value: "all" },
        { label: "My chores", value: "mine" }
      ]}
      value="mine"
      onChange={noop}
    />
  </div>
);
