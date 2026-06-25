import React from "react";
import { View, Text, Alert } from "react-native";
import { MobileListRow } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { formatCurrency, type Expense, type CurrencyCode } from "@hiro/domain";

interface Props {
  expenses: Expense[];
  currency: CurrencyCode;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, currency, onDelete }: Props) {
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
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: tokens.color.border,
        backgroundColor: "rgba(255,255,255,0.03)",
        padding: tokens.spacing.md,
        gap: tokens.spacing.sm,
      }}
    >
      <Text
        style={{
          color: tokens.color.inkMuted,
          fontFamily: tokens.typography.fontFamilyMobile,
          fontSize: tokens.typography.labelSize,
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
