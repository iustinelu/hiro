// This file is kept for back-compat. The theme system now injects CSS variables
// via ThemeCssVars (server component, <style> tag in layout) scoped per
// [data-theme="<id>"] attribute, and sets data-theme from the hiro-theme cookie
// in layout.tsx. ThemeBootstrap (client) syncs localStorage on hydration.
//
// If you need the old imperative apply, import cssVariablesFor from @hiro/ui-tokens.

export {};
