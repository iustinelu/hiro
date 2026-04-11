"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Reward, RewardRedemptionWithDetails } from "@hiro/domain";
import { WebButton } from "@hiro/ui-primitives/web";
import {
  getHouseholdRewards,
  getPointBalance,
  getRedemptionHistory,
  redeemReward,
  createReward,
  archiveReward,
} from "../../../lib/rewardService";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";
import { RewardCardGrid } from "./RewardCardGrid";
import { RedemptionFeed } from "./RedemptionFeed";
import { RewardCreateModal } from "./RewardCreateModal";
import PointsBurst from "../home/PointsBurst";
import styles from "./rewards.module.css";

/* ─── Toast ─────────────────────────────────────────────────────────────── */

function RedemptionToast({
  redemption,
  onDismiss,
}: {
  redemption: RewardRedemptionWithDetails;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      className={styles.toast}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25 }}
    >
      <span className={styles.toastName}>
        {redemption.redeemedByDisplayName ?? "Someone"}
      </span>
      {" just redeemed "}
      <strong>{redemption.rewardTitle}</strong>
      {` for ${redemption.pointsSpent} pts!`}
    </motion.div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────── */

interface Props {
  householdId: string;
  profileId: string;
}

export function RewardsDashboard({ householdId, profileId }: Props) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [redemptions, setRedemptions] = useState<RewardRedemptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ points: number; title: string } | null>(null);
  const [toast, setToast] = useState<RewardRedemptionWithDetails | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  /* ── Data loading ───────────────────────────────────────────────────── */

  const loadData = useCallback(async () => {
    const [rewardsRes, balanceRes, feedRes] = await Promise.all([
      getHouseholdRewards(householdId),
      getPointBalance(profileId, householdId),
      getRedemptionHistory(householdId),
    ]);
    setRewards(rewardsRes.rewards);
    setBalance(balanceRes.balance);
    setRedemptions(feedRes.redemptions);
    setLoading(false);
  }, [householdId, profileId]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Realtime subscription ──────────────────────────────────────────── */

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`rewards-feed-${householdId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reward_redemptions",
          filter: `household_id=eq.${householdId}`,
        },
        async (payload) => {
          const row = payload.new as { redeemed_by_profile_id: string };
          const isOtherMember = row.redeemed_by_profile_id !== profileId;

          const [feedRes, balRes] = await Promise.all([
            getRedemptionHistory(householdId),
            getPointBalance(profileId, householdId),
          ]);

          if (!feedRes.error) {
            setRedemptions(feedRes.redemptions);
            if (isOtherMember && feedRes.redemptions[0]) {
              setToast(feedRes.redemptions[0]);
            }
          }
          if (!balRes.error) setBalance(balRes.balance);
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [householdId, profileId]);

  /* ── Handlers ───────────────────────────────────────────────────────── */

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

  /* ── Loading ────────────────────────────────────────────────────────── */

  if (loading) {
    return <div className={styles.loading}>Loading rewards…</div>;
  }

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.balance}>
          <span className={styles.balanceLabel}>Your balance</span>
          <span className={styles.balanceValue}>{balance} pts</span>
        </div>
        <WebButton
          label="+ New Reward"
          variant="secondary"
          size="sm"
          onPress={() => setModalOpen(true)}
        />
      </header>

      {redeemError && <p className={styles.error}>{redeemError}</p>}

      <RewardCardGrid
        rewards={rewards}
        balance={balance}
        confirming={confirming}
        redeeming={redeeming}
        onConfirm={handleConfirmRedeem}
        onRedeem={handleRedeem}
        onCancelConfirm={() => setConfirming(null)}
        onArchive={handleArchive}
        onCreateNew={() => setModalOpen(true)}
      />

      <RedemptionFeed redemptions={redemptions} />

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

      <AnimatePresence>
        {toast && (
          <RedemptionToast
            key="redemption-toast"
            redemption={toast}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
