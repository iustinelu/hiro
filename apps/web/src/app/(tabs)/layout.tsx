"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { SWRConfig } from "swr";
import { appShellSections } from "@hiro/domain";
import { WebIcon } from "@hiro/ui-primitives/web";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { logActivity } from "../../lib/activityService";
import { HouseholdProvider } from "./HouseholdProvider";
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
        <p className={styles.brand}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--hiro-color-accent)", marginRight: 6, verticalAlign: "middle" }} />
          Hiro
        </p>
        <nav className={styles.desktopTabs}>
          {appShellSections.map((section) => {
            const isActive = pathname === section.path;
            return (
              <Link
                key={section.id}
                href={section.path}
                className={withActiveClass(isActive, styles.desktopLink, styles.desktopLinkActive)}
              >
                <WebIcon name={section.id} size={16} />
                <span>{section.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header className={styles.mobileHeader}>
          <span className={styles.brand}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--hiro-color-accent)", marginRight: 6, verticalAlign: "middle" }} />
            Hiro
          </span>
          <h1 className={styles.title}>{activeSection.label}</h1>
          <span style={{ width: 28 }} />
        </header>
        <main className={styles.main}>
          <SWRConfig value={{ revalidateOnFocus: true, dedupingInterval: 5000, keepPreviousData: true }}>
            <HouseholdProvider>{children}</HouseholdProvider>
          </SWRConfig>
        </main>
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
              <WebIcon name={section.id} size={16} />
              <span>{section.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
