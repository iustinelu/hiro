import React from "react";
import { View, Text } from "react-native";
import { MobileKpiTile, useTheme } from "@hiro/ui-primitives/mobile";
import { formatCurrency, type MonthlyBreakdown, type CurrencyCode } from "@hiro/domain";

interface Props {
  breakdown: MonthlyBreakdown;
  currency: CurrencyCode;
}

export function MonthSummary({ breakdown, currency }: Props) {
  const t = useTheme();
  const maxPayerTotal = Math.max(...breakdown.byPayer.map((p) => p.totalPaid), 1);

  return (
    <View style={{ gap: t.spacing.md }}>
      <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <MobileKpiTile
            title="Total Spent"
            value={formatCurrency(breakdown.totalAmount, currency)}
            bars={[]}
          />
        </View>
        <View style={{ flex: 1 }}>
          <MobileKpiTile
            title="Expenses"
            value={`${breakdown.expenseCount}`}
            bars={[]}
          />
        </View>
      </View>

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
          Who Paid What
        </Text>

        {breakdown.byPayer.map((payer) => {
          const barFraction = payer.totalPaid / maxPayerTotal;
          return (
            <View key={payer.profileId} style={{ gap: t.spacing.xs }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: t.color.ink,
                    fontFamily: t.typography.fontFamily,
                    fontSize: t.typography.bodySmallSize,
                    fontWeight: "600",
                    flex: 1,
                  }}
                >
                  {payer.displayName ?? "Unknown"}
                </Text>
                <Text
                  style={{
                    color: t.color.accentInk,
                    fontFamily: t.typography.fontFamily,
                    fontSize: t.typography.bodySmallSize,
                    fontWeight: "700",
                  }}
                >
                  {formatCurrency(payer.totalPaid, currency)}
                </Text>
              </View>
              <View
                style={{
                  height: 4,
                  borderRadius: t.radius.sm,
                  backgroundColor: t.color.border,
                }}
              >
                <View
                  style={{
                    height: 4,
                    borderRadius: t.radius.sm,
                    backgroundColor: t.color.accent,
                    width: `${Math.round(barFraction * 100)}%`,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
