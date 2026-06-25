import { WebLoadingState } from "@hiro/ui-primitives/web";

const wrap = { maxWidth: 380 } as const;

export const LoadingHousehold = () => (
  <div style={wrap}>
    <WebLoadingState title="Loading your household…" description="Just a moment while we gather chores, expenses, and points." />
  </div>
);

export const SyncingTasks = () => (
  <div style={wrap}>
    <WebLoadingState title="Syncing tasks…" description="Catching up on everyone's latest progress." />
  </div>
);

export const Default = () => (
  <div style={wrap}>
    <WebLoadingState />
  </div>
);
