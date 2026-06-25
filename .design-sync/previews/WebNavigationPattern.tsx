import { WebNavigationPattern } from "@hiro/ui-primitives/web";

const noop = () => {};
const wrap = { maxWidth: 420 } as const;

const tabs = [
  { id: "home", label: "Home" },
  { id: "tasks", label: "Tasks" },
  { id: "budget", label: "Budget" },
  { id: "rewards", label: "Rewards" },
  { id: "progress", label: "Progress" }
];

export const HomeActive = () => (
  <div style={wrap}>
    <WebNavigationPattern
      activeTabLabel="TAB_BAR · HOME"
      tabs={tabs}
      activeTab="home"
      onChange={noop}
    />
  </div>
);

export const BudgetActive = () => (
  <div style={wrap}>
    <WebNavigationPattern
      activeTabLabel="TAB_BAR · BUDGET"
      tabs={tabs}
      activeTab="budget"
      onChange={noop}
    />
  </div>
);
