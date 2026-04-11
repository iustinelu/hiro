"use client";

import { WebKpiTile } from "@hiro/ui-primitives/web";
import type { MonthlyBreakdown } from "@hiro/domain";
import styles from "./budget.module.css";

interface Props {
  breakdown: MonthlyBreakdown | null;
}

export function MonthSummary({ breakdown }: Props) {
  if (!breakdown) return null;

  const maxPayerTotal = Math.max(...breakdown.byPayer.map((p) => p.totalPaid), 1);

  return (
    <>
      <div className={styles.statsGrid}>
        <WebKpiTile title="Total Spent" value={`$${breakdown.totalAmount.toFixed(2)}`} />
        <WebKpiTile title="Expenses" value={`${breakdown.expenseCount}`} />
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
                ${payer.totalPaid.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
