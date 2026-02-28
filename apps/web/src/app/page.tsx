import { appSections } from "@hiro/domain";

export default function WebShellPage() {
  return (
    <main>
      <h1>Hiro Web Shell</h1>
      <p>Responsive starter shell with shared IA tabs.</p>
      <ul>
        {appSections.map((tab) => (
          <li key={tab}>{tab}</li>
        ))}
      </ul>
    </main>
  );
}
