import { appSections } from "@hiro/domain";

export default function WebShellPage() {
  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "var(--hiro-spacing-xxl)",
        borderRadius: "var(--hiro-radius-lg)",
        border: "1px solid var(--hiro-color-border)",
        backgroundColor: "var(--hiro-color-surface)",
        boxShadow: "var(--hiro-elevation-low)"
      }}
    >
      <h1
        style={{
          marginTop: 0,
          marginBottom: "var(--hiro-spacing-sm)",
          fontSize: "var(--hiro-font-size-title)",
          lineHeight: "var(--hiro-line-height-title)",
          fontWeight: "var(--hiro-font-weight-semibold)"
        }}
      >
        Hiro Web Shell
      </h1>
      <p
        style={{
          marginTop: 0,
          marginBottom: "var(--hiro-spacing-xl)",
          color: "var(--hiro-color-text-secondary)",
          fontSize: "var(--hiro-font-size-body)",
          lineHeight: "var(--hiro-line-height-body)"
        }}
      >
        Responsive starter shell with shared IA tabs.
      </p>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "grid",
          gap: "var(--hiro-spacing-sm)"
        }}
      >
        {appSections.map((tab) => (
          <li
            key={tab}
            style={{
              padding: "var(--hiro-spacing-sm) var(--hiro-spacing-md)",
              borderRadius: "var(--hiro-radius-md)",
              border: "1px solid var(--hiro-color-border)",
              backgroundColor: "var(--hiro-color-surface-muted)"
            }}
          >
            {tab}
          </li>
        ))}
      </ul>
    </main>
  );
}
