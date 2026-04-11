"use client";

import { WebButton } from "@hiro/ui-primitives/web";
import type { Expense } from "@hiro/domain";
import styles from "./budget.module.css";

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onDelete }: Props) {
  if (expenses.length === 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Recent Expenses</span>
      </div>
      {expenses.map((expense) => {
        const dateStr = new Date(expense.date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return (
          <div key={expense.id} className={styles.expenseRow}>
            <div className={styles.expenseInfo}>
              <span className={styles.expenseTitle}>{expense.title}</span>
              <span className={styles.expenseSubtitle}>
                {dateStr} &middot; {expense.payerDisplayName ?? "Unknown"}
              </span>
            </div>
            <div className={styles.expenseRight}>
              <span className={styles.expenseAmount}>${expense.amount.toFixed(2)}</span>
              <WebButton label="Delete" variant="ghost" size="sm" onPress={() => onDelete(expense.id)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
