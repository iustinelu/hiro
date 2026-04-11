import { appShellSections, type AppShellSectionId } from "@hiro/domain";
import styles from "./tabs-layout.module.css";

const sectionDescriptions: Record<AppShellSectionId, string> = {
  home: "Landing shell for household context and daily focus.",
  tasks: "Task workspace shell for capture, assign, and completion tracking.",
  progress: "Progress shell for goals, routines, and momentum indicators.",
  budget: "Budget shell for shared spend visibility and planning.",
  rewards: "Rewards marketplace for spending points on household perks.",
  more: "Utilities shell for settings, members, and secondary workflows."
};

export function SectionPlaceholder({ id }: { id: AppShellSectionId }) {
  const section = appShellSections.find((item) => item.id === id);

  if (!section) {
    return null;
  }

  return (
    <section className={styles.contentCard}>
      <h1 className={styles.title}>{section.label}</h1>
      <p className={styles.description}>{sectionDescriptions[id]}</p>
      <p className={styles.description}>
        Placeholder shell content for {section.label}. Feature-specific content is intentionally out of scope for HIR-32.
      </p>
    </section>
  );
}
