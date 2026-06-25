import type { ThemeId } from "@hiro/ui-tokens";

const THEME_STORAGE_KEY = "hiro-theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Apply a theme to the local fast-path layers only: the live <html data-theme>
 * attribute, localStorage, and the SSR cookie.
 *
 * Theme precedence: cookie/localStorage paint instantly (SSR + ThemeBootstrap) →
 * the DB value reconciles on login (HouseholdProvider) → a user switch writes all
 * three local layers here AND the DB row (ThemeSwitcher). The DB write is the
 * caller's responsibility; this helper is the shared client-side write path.
 */
export function applyThemeLocal(id: ThemeId): void {
  // 1. Instant DOM apply (CSS vars already injected via <style>; just update data-theme)
  document.documentElement.dataset.theme = id;

  // 2. Persist to localStorage
  localStorage.setItem(THEME_STORAGE_KEY, id);

  // 3. Write cookie (1-year, path=/) so SSR picks it up on next hard load
  document.cookie = `${THEME_STORAGE_KEY}=${id}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}
