"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { appShellSections } from "@hiro/domain";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { logActivity } from "../../lib/activityService";
import styles from "./tabs-layout.module.css";
import type { ReactNode } from "react";

function withActiveClass(isActive: boolean, baseClass: string, activeClass: string) {
  return isActive ? `${baseClass} ${activeClass}` : baseClass;
}

export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeSection = appShellSections.find((section) => pathname === section.path) ?? appShellSections[0];
  const mountedRef = useRef(false);

  useEffect(() => {
    // Skip the initial mount — only log navigation after the first render
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const client = getSupabaseBrowserClient();
    void logActivity(client, "tab_viewed", { tab: activeSection.id });
  }, [pathname, activeSection.id]);

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
