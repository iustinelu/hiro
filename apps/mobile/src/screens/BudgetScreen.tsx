import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View, Text, RefreshControl } from "react-native";
import {
  MobileButton,
  MobileEmptyState,
  MobileErrorState,
  useTheme,
} from "@hiro/ui-primitives/mobile";
import type { CurrencyCode, Expense, HouseholdMemberWithProfile, MonthlyBreakdown } from "@hiro/domain";
import { supabase } from "../lib/supabase";
import { getMyHousehold, getHouseholdMembers } from "../lib/householdService";
import {
  getMonthExpenses,
  getMonthlyBreakdown,
  createExpense,
  deleteExpense,
} from "../lib/expenseService";
import { MonthSummary } from "./budget/MonthSummary";
import { ExpenseList } from "./budget/ExpenseList";
import { ExpenseAddModal } from "./budget/ExpenseAddModal";

function currentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function BudgetScreen() {
  const t = useTheme();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  const [month, setMonth] = useState(currentMonth);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [breakdown, setBreakdown] = useState<MonthlyBreakdown | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Bootstrap profileId and household on mount
  useEffect(() => {
    supabase.rpc("current_profile_id").then(({ data }) => {
      if (data) setProfileId(data as string);
    });
    getMyHousehold().then(({ household }) => {
      if (household) {
        setHouseholdId(household.id);
        if (household.currency) setCurrency(household.currency);
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (!householdId) return;
    const [expRes, bdRes, memRes] = await Promise.all([
      getMonthExpenses(householdId, month.year, month.month),
      getMonthlyBreakdown(householdId, month.year, month.month),
      getHouseholdMembers(householdId),
    ]);
    if (expRes.error || bdRes.error || memRes.error) {
      setLoadError(true);
      return;
    }
    setLoadError(false);
    setExpenses(expRes.expenses);
    setBreakdown(bdRes.breakdown);
    setMembers(memRes.members);
  }, [householdId, month.year, month.month]);

  useEffect(() => {
    if (!householdId) return;
    setLoading(true);
    void fetchData().finally(() => setLoading(false));
  }, [fetchData, householdId]);

  const handleRetry = () => {
    setLoading(true);
    void fetchData().finally(() => setLoading(false));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handlePrevMonth = () => {
    setMonth((prev) =>
      prev.month === 1
        ? { year: prev.year - 1, month: 12 }
        : { year: prev.year, month: prev.month - 1 }
    );
  };

  const handleNextMonth = () => {
    setMonth((prev) =>
      prev.month === 12
        ? { year: prev.year + 1, month: 1 }
        : { year: prev.year, month: prev.month + 1 }
    );
  };

  const handleCreate = async (
    title: string,
    amount: number,
    date: string,
    payerProfileId: string,
    participantIds: string[]
  ) => {
    if (!householdId) return;
    const { error } = await createExpense(householdId, title, amount, date, payerProfileId, participantIds);
    if (error) throw new Error(error);
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteExpense(id);
    if (error) {
      setWriteError("Couldn't delete that expense. Check your connection and try again.");
      return;
    }
    await fetchData();
  };

  const monthLabel = new Date(month.year, month.month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} />
        }
      >
        {/* Month navigator + Add button */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: t.spacing.sm,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs }}>
            <MobileButton label="<" variant="ghost" size="sm" onPress={handlePrevMonth} />
            <Text
              style={{
                color: t.color.ink,
                fontFamily: t.typography.fontFamily,
                fontSize: t.typography.subtitleSize,
                fontWeight: "800",
                minWidth: 140,
                textAlign: "center",
              }}
            >
              {monthLabel}
            </Text>
            <MobileButton label=">" variant="ghost" size="sm" onPress={handleNextMonth} />
          </View>
          <MobileButton
            label="+ Add"
            variant="primary"
            size="sm"
            onPress={() => setModalOpen(true)}
            disabled={!householdId || !profileId}
          />
        </View>

        {/* Write-error banner (add/delete failures) */}
        {writeError && (
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
              {writeError}
            </Text>
            <MobileButton
              label="Dismiss"
              variant="ghost"
              size="sm"
              onPress={() => setWriteError(null)}
            />
          </View>
        )}

        {loading ? (
          <Text
            style={{
              color: t.color.inkMuted,
              fontFamily: t.typography.fontFamily,
              fontSize: t.typography.bodySize,
              textAlign: "center",
              marginTop: t.spacing.xl,
            }}
          >
            Loading…
          </Text>
        ) : loadError ? (
          <MobileErrorState
            description="We couldn't load this month's budget. Check your connection and try again."
            onRetry={handleRetry}
          />
        ) : breakdown === null ? (
          <MobileEmptyState
            title="No expenses"
            description="Add your first expense to start tracking this month."
          />
        ) : (
          <>
            <MonthSummary breakdown={breakdown} currency={currency} />
            <ExpenseList
              expenses={expenses}
              currency={currency}
              onDelete={(id) => void handleDelete(id)}
            />
          </>
        )}
      </ScrollView>

      {householdId && profileId && (
        <ExpenseAddModal
          open={modalOpen}
          members={members}
          currentProfileId={profileId}
          onClose={() => setModalOpen(false)}
          onSave={handleCreate}
        />
      )}
    </>
  );
}
