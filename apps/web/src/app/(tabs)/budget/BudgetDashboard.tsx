"use client";

import { useCallback, useEffect, useState } from "react";
import { WebButton } from "@hiro/ui-primitives/web";
import type { Expense, HouseholdMemberWithProfile, MonthlyBreakdown } from "@hiro/domain";
import { getMonthExpenses, getMonthlyBreakdown, createExpense, deleteExpense } from "../../../lib/expenseService";
import { getHouseholdMembers } from "../../../lib/householdService";
import { MonthSummary } from "./MonthSummary";
import { ExpenseList } from "./ExpenseList";
import { ExpenseAddModal } from "./ExpenseAddModal";
import styles from "./budget.module.css";

interface Props {
  householdId: string;
  profileId: string;
}

function currentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function BudgetDashboard({ householdId, profileId }: Props) {
  const [month, setMonth] = useState(currentMonth);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [breakdown, setBreakdown] = useState<MonthlyBreakdown | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [expRes, bdRes, memRes] = await Promise.all([
      getMonthExpenses(householdId, month.year, month.month),
      getMonthlyBreakdown(householdId, month.year, month.month),
      getHouseholdMembers(householdId),
    ]);
    setExpenses(expRes.expenses);
    setBreakdown(bdRes.breakdown);
    setMembers(memRes.members);
    setLoading(false);
  }, [householdId, month.year, month.month]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

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
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    await fetchData();
  };

  const monthLabel = new Date(month.year, month.month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return <div className={styles.loading}>Loading expenses...</div>;
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
          <MonthSummary breakdown={breakdown} />
          <ExpenseList expenses={expenses} onDelete={handleDelete} />
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
