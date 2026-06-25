import styles from "./loading.module.css";

export default function TabsLoading() {
  return (
    <div className={styles.skeleton} aria-hidden>
      <div className={`${styles.bar} ${styles.barHeader}`} />
      <div className={`${styles.bar} ${styles.barRow}`} />
      <div className={`${styles.bar} ${styles.barRow}`} />
      <div className={`${styles.bar} ${styles.barRow}`} />
    </div>
  );
}
