import { WebEmptyState } from "@hiro/ui-primitives/web";

const wrap = { maxWidth: 380 } as const;

export const NoChores = () => (
  <div style={wrap}>
    <WebEmptyState title="No chores yet" description="Add your first chore to get everyone in the household started." />
  </div>
);

export const NoExpenses = () => (
  <div style={wrap}>
    <WebEmptyState title="No shared expenses" description="Log a purchase to start splitting costs across your household." />
  </div>
);

export const Default = () => (
  <div style={wrap}>
    <WebEmptyState />
  </div>
);
