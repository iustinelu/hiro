"use client";

import type { Expense, MonthlyBreakdown } from "@hiro/domain";
import { getSupabaseBrowserClient } from "./supabase/client";

/* ─── createExpense ─────────────────────────────────────────────────────── */

export async function createExpense(
  householdId: string,
  title: string,
  amount: number,
  date: string,
  payerProfileId: string,
  participantIds: string[]
): Promise<{ expenseId: string | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("create_expense", {
    p_household_id: householdId,
    p_title: title,
    p_amount: amount,
    p_date: date,
    p_payer_profile_id: payerProfileId,
    p_participant_ids: participantIds,
  });

  if (error) {
    if (error.message.includes("NOT_HOUSEHOLD_MEMBER")) return { expenseId: null, error: "You are not a member of this household." };
    if (error.message.includes("PAYER_NOT_HOUSEHOLD_MEMBER")) return { expenseId: null, error: "Payer is not a household member." };
    if (error.message.includes("PARTICIPANT_NOT_HOUSEHOLD_MEMBER")) return { expenseId: null, error: "One or more participants are not household members." };
    if (error.message.includes("NO_PARTICIPANTS")) return { expenseId: null, error: "At least one participant is required." };
    return { expenseId: null, error: error.message };
  }

  const result = data as { expense_id: string };
  return { expenseId: result.expense_id, error: null };
}

/* ─── getMonthExpenses ──────────────────────────────────────────────────── */

export async function getMonthExpenses(
  householdId: string,
  year: number,
  month: number
): Promise<{ expenses: Expense[]; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const firstOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const firstOfNext = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("expenses")
    .select("*, profiles!payer_profile_id(display_name)")
    .eq("household_id", householdId)
    .gte("date", firstOfMonth)
    .lt("date", firstOfNext)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return { expenses: [], error: error.message };

  const expenses: Expense[] = (data ?? []).map((row) => {
    const profile = row.profiles as unknown as { display_name: string | null } | null;
    return {
      id: row.id,
      householdId: row.household_id,
      title: row.title,
      amount: Number(row.amount),
      date: row.date,
      payerProfileId: row.payer_profile_id,
      payerDisplayName: profile?.display_name ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  return { expenses, error: null };
}

/* ─── getMonthlyBreakdown ───────────────────────────────────────────────── */

export async function getMonthlyBreakdown(
  householdId: string,
  year: number,
  month: number
): Promise<{ breakdown: MonthlyBreakdown | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const firstOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const firstOfNext = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("expenses")
    .select("amount, payer_profile_id, profiles!payer_profile_id(display_name)")
    .eq("household_id", householdId)
    .gte("date", firstOfMonth)
    .lt("date", firstOfNext);

  if (error) return { breakdown: null, error: error.message };
  if (!data || data.length === 0) return { breakdown: null, error: null };

  let totalAmount = 0;
  const payerMap = new Map<string, { displayName: string | null; totalPaid: number }>();

  for (const row of data) {
    const amt = Number(row.amount);
    totalAmount += amt;
    const pid = row.payer_profile_id as string;
    const profile = row.profiles as unknown as { display_name: string | null } | null;
    const existing = payerMap.get(pid);
    if (existing) {
      existing.totalPaid += amt;
    } else {
      payerMap.set(pid, { displayName: profile?.display_name ?? null, totalPaid: amt });
    }
  }

  const byPayer = Array.from(payerMap.entries())
    .map(([profileId, { displayName, totalPaid }]) => ({ profileId, displayName, totalPaid }))
    .sort((a, b) => b.totalPaid - a.totalPaid);

  return {
    breakdown: {
      month: `${year}-${String(month).padStart(2, "0")}`,
      totalAmount,
      expenseCount: data.length,
      byPayer,
    },
    error: null,
  };
}

/* ─── deleteExpense ─────────────────────────────────────────────────────── */

export async function deleteExpense(
  expenseId: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  return { error: error?.message ?? null };
}
