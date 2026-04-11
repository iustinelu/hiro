"use client";

import { WebKpiTile } from "@hiro/ui-primitives/web";
import { formatCurrency, type MonthlyBreakdown, type CurrencyCode } from "@hiro/domain";
import styles from "./budget.module.css";

interface Props {
  breakdown: MonthlyBreakdown | null;
  currency: CurrencyCode;
}

export function MonthSummary({ breakdown, currency }: Props) {
  if (!breakdown) return null;

  const maxPayerTotal = Math.max(...breakdown.byPayer.map((p) => p.totalPaid), 1);

  return (
    <>
      <div className={styles.statsGrid}>
        <WebKpiTile title="Total Spent" value={formatCurrency(breakdown.totalAmount, currency)} bars={[]} />
        <WebKpiTile title="Expenses" value={`${breakdown.expenseCount}`} bars={[]} />
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Who Paid What</span>
        </div>
        {breakdown.byPayer.map((payer) => {
          const barWidth = (payer.totalPaid / maxPayerTotal) * 100;
          return (
            <div key={payer.profileId} className={styles.payerRow}>
              <span className={styles.payerName}>
                {payer.displayName ?? "Unknown"}
              </span>
              <div className={styles.payerBarTrack}>
                <div
                  className={styles.payerBarFill}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className={styles.payerAmount}>
                {formatCurrency(payer.totalPaid, currency)}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
