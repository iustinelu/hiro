import { WebModalSheet } from "@hiro/ui-primitives/web";

const noop = () => {};

const frame = { position: "relative", minHeight: 460, maxWidth: 420 } as const;

const bodyRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontFamily: "var(--hiro-fontFamily-default, inherit)",
  fontSize: 14,
  color: "var(--hiro-color-ink-muted)",
  padding: "10px 0",
  borderBottom: "1px solid var(--hiro-color-border)"
} as const;

export const ConfirmDelete = () => (
  <div style={frame}>
    <WebModalSheet
      open
      title="Delete this chore?"
      description="“Take out recycling” will be removed from Sam's list. Earned points stay on the leaderboard."
      primaryActionLabel="Delete chore"
      secondaryActionLabel="Cancel"
      onPrimaryAction={noop}
      onSecondaryAction={noop}
      onClose={noop}
    >
      <div style={{ display: "grid" }}>
        <div style={bodyRow}>
          <span>Assigned to</span>
          <span style={{ color: "var(--hiro-color-ink)" }}>Sam</span>
        </div>
        <div style={{ ...bodyRow, borderBottom: "none" }}>
          <span>Reward</span>
          <span style={{ color: "var(--hiro-color-accent)" }}>+10 pts</span>
        </div>
      </div>
    </WebModalSheet>
  </div>
);

export const RewardClaimed = () => (
  <div style={frame}>
    <WebModalSheet
      open
      title="Claim your reward"
      description="You've earned enough points to redeem a household reward this week."
      primaryActionLabel="Redeem 200 pts"
      secondaryActionLabel="Maybe later"
      onPrimaryAction={noop}
      onSecondaryAction={noop}
      onClose={noop}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--hiro-fontFamily-default, inherit)",
          fontSize: 14,
          lineHeight: "20px",
          color: "var(--hiro-color-ink-muted)"
        }}
      >
        Movie night pick goes to whoever redeems first. Maya is 40 points behind.
      </p>
    </WebModalSheet>
  </div>
);
