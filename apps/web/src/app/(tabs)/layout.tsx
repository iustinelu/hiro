"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appShellSections } from "@hiro/domain";
import { WebButton } from "@hiro/ui-primitives/web";
import styles from "./tabs-layout.module.css";
import type { ReactNode } from "react";

function withActiveClass(isActive: boolean, baseClass: string, activeClass: string) {
  return isActive ? `${baseClass} ${activeClass}` : baseClass;
}

export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeSection = appShellSections.find((section) => pathname === section.path) ?? appShellSections[0];

  return (
    <div className={styles.shell}>
      <aside className={styles.desktopRail}>
        <p className={styles.brand}>Hiro Navigation</p>
        <nav className={styles.desktopTabs}>
          {appShellSections.map((section) => {
            const isActive = pathname === section.path;
            return (
              <Link
                key={section.id}
                href={section.path}
                className={withActiveClass(isActive, styles.desktopLink, styles.desktopLinkActive)}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div>
        <header className={styles.mobileHeader}>
          <h1 className={styles.title}>{activeSection.label}</h1>
          <div className={styles.actionButton}>
            <WebButton label={activeSection.headerActionLabel} variant="secondary" size="sm" />
          </div>
        </header>
        <main className={styles.main}>{children}</main>
      </div>

      <nav className={styles.mobileTabs}>
        {appShellSections.map((section) => {
          const isActive = pathname === section.path;
          return (
            <Link
              key={section.id}
              href={section.path}
              className={withActiveClass(isActive, styles.tabLink, styles.tabLinkActive)}
            >
              {section.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
