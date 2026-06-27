import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  MobileButton,
  MobileKpiTile,
  useTheme,
} from "@hiro/ui-primitives/mobile";
import type { Reward, RewardRedemptionWithDetails } from "@hiro/domain";
import { ServiceErrorCode, pointsShortfall } from "@hiro/domain";
import { supabase } from "../lib/supabase";
import { getMyHousehold } from "../lib/householdService";
import {
  getHouseholdRewards,
  getPointBalance,
  getRedemptionHistory,
  redeemReward,
  createReward,
  archiveReward,
} from "../lib/rewardService";
import { RewardCardGrid } from "./rewards/RewardCardGrid";
import { RedemptionFeed } from "./rewards/RedemptionFeed";
import { RewardCreateModal } from "./rewards/RewardCreateModal";

/* ─── Redeem Celebration ────────────────────────────────────────────────────
 * Lightweight pill that springs up and fades out. Uses RN Animated only.
 */

interface RedeemBurstProps {
  points: number;
  title: string;
  onComplete: () => void;
}

function RedeemBurst({ points, title, onComplete }: RedeemBurstProps) {
  const t = useTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.sequence([
      Animated.spring(progress, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
      Animated.delay(500),
      Animated.timing(progress, { toValue: 2, duration: 250, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
    ]).start(() => onComplete());
  }, [progress, onComplete, points, title]);

  const translateY = progress.interpolate({ inputRange: [0, 1, 2], outputRange: [20, -30, -50] });
  const scale = progress.interpolate({ inputRange: [0, 1, 2], outputRange: [0.5, 1, 1] });
  const opacity = progress.interpolate({ inputRange: [0, 1, 1.5, 2], outputRange: [0, 1, 1, 0] });

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing.sm,
          paddingVertical: t.spacing.sm,
          paddingHorizontal: t.spacing.lg,
          borderRadius: t.radius.pill,
          backgroundColor: t.color.surface,
          borderWidth: 2,
          borderColor: t.color.accent,
          transform: [{ translateY }, { scale }],
          opacity,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "800", color: t.color.accent, fontFamily: t.typography.fontFamily }}>
          -{points}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontSize: 15, fontWeight: "600", color: t.color.ink, maxWidth: 180, fontFamily: t.typography.fontFamily }}
        >
          {title} redeemed!
        </Text>
      </Animated.View>
    </View>
  );
}

/* ─── RewardsScreen ─────────────────────────────────────────────────────── */

export function RewardsScreen() {
  const t = useTheme();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [redemptions, setRedemptions] = useState<RewardRedemptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ points: number; title: string } | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  /* ── Bootstrap ────────────────────────────────────────────────────── */

  useEffect(() => {
    supabase.rpc("current_profile_id").then(({ data }) => {
      if (data) setProfileId(data as string);
    });
    getMyHousehold().then(({ household }) => {
      if (household) setHouseholdId(household.id);
    });
  }, []);

  /* ── Data loading ────────────────────────────────────────────────── */

  const loadData = useCallback(async (pid: string, hid: string) => {
    const [rewardsRes, balanceRes, feedRes] = await Promise.all([
      getHouseholdRewards(hid),
      getPointBalance(pid, hid),
      getRedemptionHistory(hid),
    ]);
    setRewards(rewardsRes.rewards);
    setBalance(balanceRes.balance);
    setRedemptions(feedRes.redemptions);
    setLoading(false);
  }, []);

  /* Reload the balance + rewards every time the tab gains focus (tab screens
   * stay mounted, so a plain mount effect would never refresh on revisit). */
  useFocusEffect(
    useCallback(() => {
      if (profileId && householdId) {
        void loadData(profileId, householdId);
      }
    }, [profileId, householdId, loadData])
  );

  /* ── Realtime subscription ───────────────────────────────────────── */

  useEffect(() => {
    if (!householdId || !profileId) return;

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
        async () => {
          const [feedRes, balRes] = await Promise.all([
            getRedemptionHistory(householdId),
            getPointBalance(profileId, householdId),
          ]);
          if (!feedRes.error) setRedemptions(feedRes.redemptions);
          if (!balRes.error) setBalance(balRes.balance);
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [householdId, profileId]);

  /* ── Handlers ───────────────────────────────────────────────────── */

  const handleCreate = useCallback(async (title: string, pointCost: number) => {
    if (!householdId || !profileId) throw new Error("Not ready");
    const { error } = await createReward(householdId, title, pointCost);
    if (error) throw new Error(error);
    await loadData(profileId, householdId);
  }, [householdId, profileId, loadData]);

  const handleConfirmRedeem = useCallback((rewardId: string) => {
    setConfirming(rewardId);
    setRedeemError(null);
  }, []);

  const handleRedeem = useCallback(async (reward: Reward) => {
    if (!profileId || !householdId) return;
    setRedeeming(reward.id);
    setRedeemError(null);
    const result = await redeemReward(reward.id);
    setRedeeming(null);
    setConfirming(null);

    if (result.error) {
      if (result.error === ServiceErrorCode.INSUFFICIENT_POINTS) {
        setRedeemError(`Need ${pointsShortfall(balance, reward.pointCost)} more pts to redeem "${reward.title}"`);
      } else {
        setRedeemError(result.error);
      }
      return;
    }

    setBalance(result.remainingBalance);
    setBurst({ points: result.pointsSpent, title: result.rewardTitle });
    await loadData(profileId, householdId);
  }, [balance, profileId, householdId, loadData]);

  const handleArchive = useCallback(async (rewardId: string) => {
    if (!profileId || !householdId) return;
    await archiveReward(rewardId);
    await loadData(profileId, householdId);
  }, [profileId, householdId, loadData]);

  /* ── Render ─────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamily }}>
          Loading rewards…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}
      >
        {/* Balance KPI */}
        <MobileKpiTile
          title="Your balance"
          value={`${balance} pts`}
          accent="primary"
        />

        {/* Error banner */}
        {redeemError && (
          <View
            style={{
              backgroundColor: t.color.feedbackErrorBg,
              borderRadius: t.radius.lg,
              borderWidth: 1,
              borderColor: t.color.error,
              padding: t.spacing.md,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: t.color.error, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySmallSize, flex: 1 }}>
              {redeemError}
            </Text>
            <MobileButton
              label="Dismiss"
              variant="ghost"
              size="sm"
              onPress={() => setRedeemError(null)}
            />
          </View>
        )}

        {/* New Reward button */}
        <MobileButton
          label="+ New Reward"
          variant="secondary"
          onPress={() => setModalOpen(true)}
        />

        {/* Reward grid */}
        <RewardCardGrid
          rewards={rewards}
          balance={balance}
          confirming={confirming}
          redeeming={redeeming}
          onConfirm={handleConfirmRedeem}
          onRedeem={(r) => { void handleRedeem(r); }}
          onCancelConfirm={() => setConfirming(null)}
          onArchive={(id) => { void handleArchive(id); }}
          onCreateNew={() => setModalOpen(true)}
        />

        {/* Redemption feed */}
        <RedemptionFeed redemptions={redemptions} />
      </ScrollView>

      {/* Create modal */}
      <RewardCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
      />

      {/* Celebration burst */}
      {burst && (
        <RedeemBurst
          points={burst.points}
          title={burst.title}
          onComplete={() => setBurst(null)}
        />
      )}
    </View>
  );
}
