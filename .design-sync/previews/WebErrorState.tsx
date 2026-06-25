import { WebErrorState } from "@hiro/ui-primitives/web";

const wrap = { maxWidth: 380 } as const;
const noop = () => {};

export const CouldNotLoadExpenses = () => (
  <div style={wrap}>
    <WebErrorState title="Couldn't load expenses" description="Check your connection and try again." />
  </div>
);

export const WithRetry = () => (
  <div style={wrap}>
    <WebErrorState
      title="Couldn't sync chores"
      description="We lost connection to your household. Tap retry to refresh."
      retryLabel="Retry sync"
      onRetry={noop}
    />
  </div>
);

export const Default = () => (
  <div style={wrap}>
    <WebErrorState onRetry={noop} />
  </div>
);
