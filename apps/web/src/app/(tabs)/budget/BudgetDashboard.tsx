"use client";

import { useState } from "react";
import useSWR from "swr";
import { WebButton } from "@hiro/ui-primitives/web";
import type { Expense, HouseholdMemberWithProfile, MonthlyBreakdown, CurrencyCode } from "@hiro/domain";
import { getMonthExpenses, getMonthlyBreakdown, createExpense, deleteExpense } from "../../../lib/expenseService";
import { getHouseholdMembers, getMyHousehold } from "../../../lib/householdService";
import { cacheKeys, revalidateHousehold } from "../../../lib/cacheKeys";
import { DashboardSkeleton } from "../DashboardSkeleton";
import { MonthSummary } from "./MonthSummary";
import { ExpenseList } from "./ExpenseList";
import { ExpenseAddModal } from "./ExpenseAddModal";
import styles from "./budget.module.css";

interface Props {
  householdId: string;
  profileId: string;
}

interface BudgetData {
  expenses: Expense[];
  breakdown: MonthlyBreakdown | null;
  members: HouseholdMemberWithProfile[];
  currency: CurrencyCode;
}

const EMPTY_EXPENSES: Expense[] = [];
const EMPTY_MEMBERS: HouseholdMemberWithProfile[] = [];

function currentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

async function fetchBudgetData(householdId: string, year: number, month: number): Promise<BudgetData> {
  const [expRes, bdRes, memRes, hhRes] = await Promise.all([
    getMonthExpenses(householdId, year, month),
    getMonthlyBreakdown(householdId, year, month),
    getHouseholdMembers(householdId),
    getMyHousehold(),
  ]);
  return {
    expenses: expRes.expenses,
    breakdown: bdRes.breakdown,
    members: memRes.members,
    currency: (hhRes.household?.currency as CurrencyCode) ?? "EUR",
  };
}

export function BudgetDashboard({ householdId, profileId }: Props) {
  const [month, setMonth] = useState(currentMonth);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, mutate } = useSWR(
    cacheKeys.budget(householdId, month.year, month.month),
    () => fetchBudgetData(householdId, month.year, month.month),
  );

  const expenses = data?.expenses ?? EMPTY_EXPENSES;
  const breakdown = data?.breakdown ?? null;
  const members = data?.members ?? EMPTY_MEMBERS;
  const currency = data?.currency ?? "EUR";

  const handlePrevMonth = () => {
    setMonth((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setMonth((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleCreate = async (
    title: string,
    amount: number,
    date: string,
    payerProfileId: string,
    participantIds: string[]
  ) => {
    await createExpense(householdId, title, amount, date, payerProfileId, participantIds);
    setModalOpen(false);
    await mutate();
    void revalidateHousehold(householdId);
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    await mutate();
    void revalidateHousehold(householdId);
  };

  const monthLabel = new Date(month.year, month.month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.monthNav}>
          <WebButton label="<" variant="ghost" size="sm" onPress={handlePrevMonth} />
          <span className={styles.monthLabel}>{monthLabel}</span>
          <WebButton label=">" variant="ghost" size="sm" onPress={handleNextMonth} />
        </div>
        <WebButton label="+ Add Expense" variant="primary" size="sm" onPress={() => setModalOpen(true)} />
      </div>

      {breakdown === null ? (
        <div className={styles.emptyState}>No expenses this month.</div>
      ) : (
        <>
          <MonthSummary breakdown={breakdown} currency={currency} />
          <ExpenseList expenses={expenses} currency={currency} onDelete={handleDelete} />
        </>
      )}

      <ExpenseAddModal
        open={modalOpen}
        members={members}
        currentProfileId={profileId}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
      />
    </div>
  );
}
