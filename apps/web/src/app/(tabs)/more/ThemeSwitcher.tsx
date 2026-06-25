"use client";

import { useState, useEffect } from "react";
import { ALL_THEME_IDS, DEFAULT_THEME, THEME_LABELS, cssVariablesFor } from "@hiro/ui-tokens";
import type { ThemeId } from "@hiro/ui-tokens";
import { applyThemeLocal } from "../../../theme/applyTheme";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";
import { useHousehold } from "../HouseholdProvider";

function readCurrentTheme(): ThemeId {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const attr = document.documentElement.dataset.theme;
  return attr && (ALL_THEME_IDS as string[]).includes(attr)
    ? (attr as ThemeId)
    : DEFAULT_THEME;
}

// Derive preview colors from the token package — no hard-coded hex in app layer.
const THEME_VARS = Object.fromEntries(
  ALL_THEME_IDS.map((id) => [id, cssVariablesFor(id)])
) as Record<ThemeId, Record<string, string>>;

export function ThemeSwitcher() {
  const { profileId } = useHousehold();
  const [active, setActive] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    setActive(readCurrentTheme());
  }, []);

  function handleSelect(id: ThemeId) {
    // Instant local apply (cookie/localStorage/data-theme) for zero-lag feedback...
    applyThemeLocal(id);
    setActive(id);
    // ...then fire-and-forget the DB write so the choice follows the user across devices.
    if (profileId) {
      void getSupabaseBrowserClient()
        .from("profiles")
        .update({ theme: id })
        .eq("id", profileId);
    }
  }

  return (
    <section
      style={{
        display: "grid",
        gap: "var(--hiro-spacing-sm, 8px)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--hiro-color-ink-muted)",
        }}
      >
        Choose your theme
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
        }}
        role="radiogroup"
        aria-label="Theme selection"
      >
        {ALL_THEME_IDS.map((id) => {
          const isActive = id === active;
          const vars = THEME_VARS[id];
          return (
            // Using div+role="radio" instead of the raw button element (web primitive rule);
            // theme cards are selection tiles, not form controls.
            <div
              key={id}
              role="radio"
              aria-checked={isActive}
              tabIndex={0}
              onClick={() => handleSelect(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(id);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 6,
                padding: "10px 12px",
                background: vars["--hiro-color-bg"],
                border: isActive
                  ? `2px solid var(--hiro-color-accent)`
                  : `1px solid var(--hiro-color-border)`,
                borderRadius: "var(--hiro-radius-md, 12px)",
                cursor: "pointer",
                transition: "border-color 120ms ease",
                outline: "none",
                boxShadow: isActive ? "0 0 0 2px var(--hiro-color-accent-soft)" : "none",
                userSelect: "none",
              }}
            >
              {/* accent swatch strip — shows the theme's own accent color */}
              <span
                style={{
                  display: "block",
                  width: 32,
                  height: 8,
                  borderRadius: 4,
                  background: vars["--hiro-color-accent"],
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: vars["--hiro-color-ink"],
                  lineHeight: 1.2,
                }}
              >
                {THEME_LABELS[id]}
              </span>
              {isActive && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: vars["--hiro-color-accent"],
                    opacity: 0.9,
                  }}
                >
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
