"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { RewardRedemptionWithDetails } from "@hiro/domain";
import { RedemptionFeedItem } from "./RedemptionFeedItem";
import styles from "./rewards.module.css";

interface Props {
  redemptions: RewardRedemptionWithDetails[];
}

export function RedemptionFeed({ redemptions }: Props) {
  return (
    <div className={styles.feed}>
      <div className={styles.feedHeader}>
        <h3 className={styles.feedTitle}>Household Activity</h3>
      </div>

      {redemptions.length === 0 ? (
        <p className={styles.feedEmpty}>No redemptions yet.</p>
      ) : (
        <AnimatePresence initial={false}>
          {redemptions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <RedemptionFeedItem redemption={r} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
