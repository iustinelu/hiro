import React from "react";
import { View, Text } from "react-native";
import { MobileKpiTile } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { formatCurrency, type MonthlyBreakdown, type CurrencyCode } from "@hiro/domain";

interface Props {
  breakdown: MonthlyBreakdown;
  currency: CurrencyCode;
}

export function MonthSummary({ breakdown, currency }: Props) {
  const maxPayerTotal = Math.max(...breakdown.byPayer.map((p) => p.totalPaid), 1);

  return (
    <View style={{ gap: tokens.spacing.md }}>
      <View style={{ flexDirection: "row", gap: tokens.spacing.sm }}>
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
          Who Paid What
        </Text>

        {breakdown.byPayer.map((payer) => {
          const barFraction = payer.totalPaid / maxPayerTotal;
          return (
            <View key={payer.profileId} style={{ gap: tokens.spacing.xs }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: tokens.color.ink,
                    fontFamily: tokens.typography.fontFamilyMobile,
                    fontSize: tokens.typography.bodySmallSize,
                    fontWeight: "600",
                    flex: 1,
                  }}
                >
                  {payer.displayName ?? "Unknown"}
                </Text>
                <Text
                  style={{
                    color: tokens.color.accentInk,
                    fontFamily: tokens.typography.fontFamilyMobile,
                    fontSize: tokens.typography.bodySmallSize,
                    fontWeight: "700",
                  }}
                >
                  {formatCurrency(payer.totalPaid, currency)}
                </Text>
              </View>
              <View
                style={{
                  height: 4,
                  borderRadius: tokens.radius.sm,
                  backgroundColor: tokens.color.border,
                }}
              >
                <View
                  style={{
                    height: 4,
                    borderRadius: tokens.radius.sm,
                    backgroundColor: tokens.color.accent,
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
