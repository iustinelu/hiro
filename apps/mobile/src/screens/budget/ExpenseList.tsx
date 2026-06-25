import React from "react";
import { View, Text, Alert } from "react-native";
import { MobileListRow, useTheme } from "@hiro/ui-primitives/mobile";
import { formatCurrency, type Expense, type CurrencyCode } from "@hiro/domain";

interface Props {
  expenses: Expense[];
  currency: CurrencyCode;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, currency, onDelete }: Props) {
  const t = useTheme();
  if (expenses.length === 0) return null;

  function confirmDelete(expense: Expense) {
    Alert.alert(
      "Delete Expense",
      `Delete "${expense.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(expense.id),
        },
      ]
    );
  }

  return (
    <View
      style={{
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.color.border,
        backgroundColor: t.color.surfaceMuted,
        padding: t.spacing.md,
        gap: t.spacing.sm,
      }}
    >
      <Text
        style={{
          color: t.color.inkMuted,
          fontFamily: t.typography.fontFamily,
          fontSize: t.typography.labelSize,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: "700",
        }}
      >
        Recent Expenses
      </Text>

      {expenses.map((expense) => {
        const dateStr = new Date(expense.date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return (
          <MobileListRow
            key={expense.id}
            title={expense.title}
            subtitle={`${dateStr} · ${expense.payerDisplayName ?? "Unknown"}`}
            meta={formatCurrency(expense.amount, currency)}
            onPress={() => confirmDelete(expense)}
          />
        );
      })}
    </View>
  );
}
