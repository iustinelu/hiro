"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { WebButton, WebCard } from "@hiro/ui-primitives/web";
import { tokens } from "@hiro/ui-tokens";
import type { Reward } from "@hiro/domain";
import {
  getHouseholdRewards,
  getPointBalance,
  redeemReward,
  createReward,
  archiveReward,
} from "../../../lib/rewardService";
import { RewardCreateModal } from "./RewardCreateModal";
import PointsBurst from "../home/PointsBurst";

interface Props {
  householdId: string;
  profileId: string;
}

export function RewardsSection({ householdId, profileId }: Props) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ points: number; title: string } | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [rewardsRes, balanceRes] = await Promise.all([
      getHouseholdRewards(householdId),
      getPointBalance(profileId, householdId),
    ]);
    setRewards(rewardsRes.rewards);
    setBalance(balanceRes.balance);
    setLoading(false);
  }, [householdId, profileId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = useCallback(async (title: string, pointCost: number) => {
    const { error } = await createReward(householdId, title, pointCost);
    if (error) throw new Error(error);
    await loadData();
  }, [householdId, loadData]);

  const handleConfirmRedeem = useCallback((rewardId: string) => {
    setConfirming(rewardId);
    setRedeemError(null);
  }, []);

  const handleRedeem = useCallback(async (reward: Reward) => {
    setRedeeming(reward.id);
    setRedeemError(null);
    const result = await redeemReward(reward.id);
    setRedeeming(null);
    setConfirming(null);

    if (result.error) {
      if (result.error === "INSUFFICIENT_POINTS") {
        setRedeemError(`Need ${reward.pointCost - balance} more pts to redeem "${reward.title}"`);
      } else {
        setRedeemError(result.error);
      }
      return;
    }

    setBalance(result.remainingBalance);
    setBurst({ points: result.pointsSpent, title: result.rewardTitle });
    await loadData();
  }, [balance, loadData]);

  const handleArchive = useCallback(async (rewardId: string) => {
    await archiveReward(rewardId);
    await loadData();
  }, [loadData]);

  if (loading) {
    return (
      <WebCard title="Rewards">
        <p style={{ color: tokens.color.inkMuted, fontSize: 14 }}>Loading rewards…</p>
      </WebCard>
    );
  }

  return (
    <>
      <WebCard title="Rewards">
        {/* Balance banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
            background: tokens.color.accentSoft,
            borderRadius: tokens.radius.md,
            marginBottom: tokens.spacing.md,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: tokens.color.accentInk, textTransform: "uppercase", letterSpacing: "0.4px" }}>
            Your balance
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: tokens.color.accent }}>
            {balance} pts
          </span>
        </div>

        {redeemError && (
          <p style={{ color: tokens.color.accent, fontSize: 13, fontWeight: 600, marginBottom: tokens.spacing.sm }}>
            {redeemError}
          </p>
        )}

        {/* Reward list */}
        {rewards.length === 0 ? (
          <p style={{ color: tokens.color.inkMuted, fontSize: 14, textAlign: "center", padding: `${tokens.spacing.lg} 0` }}>
            No rewards yet. Create one to give people something to work toward!
          </p>
        ) : (
          <div style={{ display: "grid", gap: tokens.spacing.sm, marginBottom: tokens.spacing.md }}>
            {rewards.map((reward) => {
              const canAfford = balance >= reward.pointCost;
              const isConfirming = confirming === reward.id;
              const isRedeeming = redeeming === reward.id;

              return (
                <div
                  key={reward.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: tokens.spacing.sm,
                    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    background: tokens.color.surface,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 600,
                        color: tokens.color.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {reward.title}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: canAfford ? tokens.color.accent : tokens.color.inkMuted }}>
                      {reward.pointCost} pts
                      {!canAfford && ` · Need ${reward.pointCost - balance} more`}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.xs }}>
                    {isConfirming ? (
                      <>
                        <WebButton
                          label={isRedeeming ? "…" : "Confirm"}
                          variant="primary"
                          size="sm"
                          loading={isRedeeming}
                          loadingLabel="…"
                          onPress={() => void handleRedeem(reward)}
                        />
                        <WebButton
                          label="Cancel"
                          variant="ghost"
                          size="sm"
                          onPress={() => setConfirming(null)}
                        />
                      </>
                    ) : (
                      <>
                        <WebButton
                          label="Redeem"
                          variant={canAfford ? "primary" : "secondary"}
                          size="sm"
                          onPress={() => canAfford ? handleConfirmRedeem(reward.id) : undefined}
                        />
                        <WebButton
                          label="Archive"
                          variant="ghost"
                          size="sm"
                          onPress={() => void handleArchive(reward.id)}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <WebButton
          label="+ New Reward"
          variant="secondary"
          onPress={() => setModalOpen(true)}
        />
      </WebCard>

      <RewardCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
      />

      <AnimatePresence>
        {burst && (
          <PointsBurst
            key="reward-burst"
            points={burst.points}
            taskName={burst.title}
            combo={1}
            onComplete={() => setBurst(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
