import { ALL_THEME_IDS, DEFAULT_THEME, cssVariablesFor } from "@hiro/ui-tokens";

/**
 * Server component — emits a <style> tag with all 4 theme CSS-variable blocks.
 * Each theme is scoped to [data-theme="<id>"].
 * The :root block (= aurora, the default) ensures vars are available even before
 * data-theme is applied.
 */
export function ThemeCssVars() {
  const blocks = ALL_THEME_IDS.map((id) => {
    const vars = cssVariablesFor(id);
    const declarations = Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");
    return `[data-theme="${id}"] {\n${declarations}\n}`;
  });

  // Also emit default (aurora) as :root so the page has vars even during SSR
  // before data-theme is set on <html>.
  const defaultVars = cssVariablesFor(DEFAULT_THEME);
  const rootDeclarations = Object.entries(defaultVars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  const rootBlock = `:root {\n${rootDeclarations}\n}`;

  const css = [rootBlock, ...blocks].join("\n\n");

  // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional CSS injection
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
