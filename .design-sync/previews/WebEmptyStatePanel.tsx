import { WebEmptyStatePanel } from "@hiro/ui-primitives/web";

const wrap = { maxWidth: 380 } as const;

export const NoChores = () => (
  <div style={wrap}>
    <WebEmptyStatePanel
      title="No chores assigned"
      description="Create a chore to get your household moving"
      icon="empty"
    />
  </div>
);

export const NoRewards = () => (
  <div style={wrap}>
    <WebEmptyStatePanel
      title="No rewards yet"
      description="Earn points to unlock household rewards"
      icon="spark"
      subtitle="REWARDS"
    />
  </div>
);
