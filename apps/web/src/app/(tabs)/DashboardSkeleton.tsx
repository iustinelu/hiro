import styles from "./loading.module.css";

/**
 * Shown by a tab dashboard on its first-ever load, before SWR has any cached data.
 * On subsequent visits SWR serves the cache synchronously, so this never appears and
 * the tab paints instantly. Reuses the route-level loading skeleton styles.
 */
export function DashboardSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden>
      <div className={`${styles.bar} ${styles.barHeader}`} />
      <div className={`${styles.bar} ${styles.barRow}`} />
      <div className={`${styles.bar} ${styles.barRow}`} />
      <div className={`${styles.bar} ${styles.barRow}`} />
    </div>
  );
}
