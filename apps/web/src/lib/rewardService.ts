"use client";

import type { Reward, RewardRedemption } from "@hiro/domain";
import { getSupabaseBrowserClient } from "./supabase/client";

export async function createReward(
  householdId: string,
  title: string,
  pointCost: number
): Promise<{ reward: Reward | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data: profileId } = await supabase.rpc("current_profile_id");
  if (!profileId) return { reward: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("rewards")
    .insert({
      household_id: householdId,
      title,
      point_cost: pointCost,
      created_by_profile_id: profileId,
    })
    .select()
    .single();

  if (error) return { reward: null, error: error.message };

  return {
    reward: mapReward(data),
    error: null,
  };
}

export async function updateReward(
  rewardId: string,
  updates: { title?: string; pointCost?: number }
): Promise<{ reward: Reward | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.pointCost !== undefined) payload.point_cost = updates.pointCost;

  const { data, error } = await supabase
    .from("rewards")
    .update(payload)
    .eq("id", rewardId)
    .select()
    .single();

  if (error) return { reward: null, error: error.message };

  return { reward: mapReward(data), error: null };
}

export async function archiveReward(rewardId: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("rewards")
    .update({ is_archived: true })
    .eq("id", rewardId);

  return { error: error?.message ?? null };
}

export async function getHouseholdRewards(
  householdId: string
): Promise<{ rewards: Reward[]; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("household_id", householdId)
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) return { rewards: [], error: error.message };

  return { rewards: (data ?? []).map(mapReward), error: null };
}

export async function redeemReward(
  rewardId: string
): Promise<{ pointsSpent: number; rewardTitle: string; remainingBalance: number; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("redeem_reward", { p_reward_id: rewardId });

  if (error) {
    if (error.message.includes("REWARD_NOT_FOUND")) return { pointsSpent: 0, rewardTitle: "", remainingBalance: 0, error: "Reward not found." };
    if (error.message.includes("REWARD_ARCHIVED")) return { pointsSpent: 0, rewardTitle: "", remainingBalance: 0, error: "Reward is no longer available." };
    if (error.message.includes("INSUFFICIENT_POINTS")) return { pointsSpent: 0, rewardTitle: "", remainingBalance: 0, error: "INSUFFICIENT_POINTS" };
    if (error.message.includes("NOT_HOUSEHOLD_MEMBER")) return { pointsSpent: 0, rewardTitle: "", remainingBalance: 0, error: "You are not a member of this household." };
    return { pointsSpent: 0, rewardTitle: "", remainingBalance: 0, error: error.message };
  }

  const result = data as { points_spent: number; reward_title: string; remaining_balance: number };
  return {
    pointsSpent: result.points_spent,
    rewardTitle: result.reward_title,
    remainingBalance: result.remaining_balance,
    error: null,
  };
}

export async function getPointBalance(
  profileId: string,
  householdId: string
): Promise<{ balance: number; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const [earnedRes, spentRes] = await Promise.all([
    supabase
      .from("task_completions")
      .select("points_earned")
      .eq("completed_by_profile_id", profileId)
      .eq("household_id", householdId),
    supabase
      .from("reward_redemptions")
      .select("points_spent")
      .eq("redeemed_by_profile_id", profileId)
      .eq("household_id", householdId),
  ]);

  if (earnedRes.error) return { balance: 0, error: earnedRes.error.message };
  if (spentRes.error) return { balance: 0, error: spentRes.error.message };

  const earned = (earnedRes.data ?? []).reduce((sum, r) => sum + (r.points_earned as number), 0);
  const spent = (spentRes.data ?? []).reduce((sum, r) => sum + (r.points_spent as number), 0);

  return { balance: earned - spent, error: null };
}

export async function getRedemptionHistory(
  householdId: string
): Promise<{ redemptions: RewardRedemption[]; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("reward_redemptions")
    .select("*")
    .eq("household_id", householdId)
    .order("redeemed_at", { ascending: false })
    .limit(20);

  if (error) return { redemptions: [], error: error.message };

  const redemptions: RewardRedemption[] = (data ?? []).map((row) => ({
    id: row.id as string,
    rewardId: row.reward_id as string,
    redeemedByProfileId: row.redeemed_by_profile_id as string,
    householdId: row.household_id as string,
    pointsSpent: row.points_spent as number,
    redeemedAt: row.redeemed_at as string,
    createdAt: row.created_at as string,
  }));

  return { redemptions, error: null };
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function mapReward(row: Record<string, unknown>): Reward {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    title: row.title as string,
    pointCost: row.point_cost as number,
    isArchived: row.is_archived as boolean,
    createdByProfileId: row.created_by_profile_id as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
