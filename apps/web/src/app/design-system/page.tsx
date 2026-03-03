"use client";

import { useState } from "react";
import {
  WebButton,
  WebCard,
  WebChartContainer,
  WebEmptyState,
  WebEmptyStatePanel,
  WebErrorState,
  WebIconographySpec,
  WebInteractiveChip,
  WebInput,
  WebKpiTile,
  WebLoadingState,
  WebModalSheet,
  WebNavigationPattern,
  WebSegmentedControl,
  WebSpacingMatrix,
  WebStatusBadge,
  WebSwitchRow
} from "@hiro/ui-primitives/web";
import { tokens } from "@hiro/ui-tokens";

export default function DesignSystemGalleryPage() {
  const [inputValue, setInputValue] = useState("technical_input");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [segmentValue, setSegmentValue] = useState("edit");
  const [activeListeners, setActiveListeners] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [tabValue, setTabValue] = useState("active");

  return (
    <main style={{ minHeight: "100vh", padding: tokens.spacing.xl, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -3,
          background: `linear-gradient(180deg, ${tokens.color.bgCanvasTop} 0%, ${tokens.color.bgCanvasBottom} 100%)`
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -2,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          opacity: 0.24,
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          background: `radial-gradient(900px 420px at 0% 0%, ${tokens.color.accentSoft} 0%, transparent 70%), radial-gradient(760px 420px at 100% 20%, ${tokens.color.infoSoft} 0%, transparent 70%)`
        }}
      />

      <div style={{ maxWidth: tokens.size.contentMax, margin: "0 auto", display: "grid", gap: tokens.spacing.xl }}>
        <section
          style={{
            borderRadius: tokens.radius.xxl,
            border: `1px solid ${tokens.color.border}`,
            backgroundColor: "rgba(18, 21, 38, 0.9)",
            boxShadow: tokens.elevation.high,
            padding: tokens.spacing.xxl,
            display: "grid",
            gap: tokens.spacing.md
          }}
        >
          <p style={{ margin: 0, color: tokens.color.accent, textTransform: "uppercase", letterSpacing: 1.2, fontSize: tokens.typography.labelSize, fontFamily: tokens.typography.fontFamilyMono }}>
            Hiro System | Icon & Type Contract
          </p>
          <h1 style={{ margin: 0, color: tokens.color.ink, fontSize: tokens.typography.displaySize, fontFamily: tokens.typography.fontFamily, lineHeight: `${tokens.typography.lineHeightDisplay}px` }}>
            Design System Gallery
          </h1>
          <p style={{ margin: 0, color: tokens.color.inkMuted, fontSize: tokens.typography.bodySize, maxWidth: 760, fontFamily: tokens.typography.fontFamily }}>
            Technical dark language for execution, controls, states, and navigation patterns across web and mobile.
          </p>
          <div style={{ display: "flex", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
            <WebButton label="Open Workflow Sheet" onPress={() => setIsSheetOpen(true)} />
            <WebButton label="Secondary Action" variant="secondary" />
            <WebButton label="Ghost Action" variant="ghost" />
          </div>
        </section>

        <div style={{ display: "grid", gap: tokens.spacing.lg, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <WebCard title="Button States" description="Default, hover intent, pressed, loading, and disabled.">
            <div style={{ display: "grid", gap: tokens.spacing.sm }}>
              <WebButton label="Action" variant="primary" fullWidth />
              <WebButton label="Action" variant="primary" fullWidth size="lg" />
              <WebButton label="Action" variant="primary" fullWidth size="sm" />
              <WebButton label="Processing" variant="secondary" loading fullWidth />
              <WebButton label="Action Unavailable" variant="primary" disabled fullWidth />
            </div>
          </WebCard>

          <WebCard title="Input States" description="Focus glow, error, success, and disabled states.">
            <div style={{ display: "grid", gap: tokens.spacing.md }}>
              <WebInput label="Focus Glow State" value={inputValue} onChangeText={setInputValue} forceFocused helperText="ACTIVE" />
              <div style={{ display: "grid", gap: tokens.spacing.sm, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <WebInput label="Error" value="Invalid" state="error" helperText="Invalid" />
                <WebInput label="Success" value="Valid" state="success" helperText="Valid" />
              </div>
              <WebInput label="Disabled" value="Action Unavailable" state="disabled" helperText="Readonly" />
            </div>
          </WebCard>
        </div>

        <WebCard title="Segmented Controls" description="Active hover state treatment.">
          <div style={{ display: "grid", gap: tokens.spacing.sm }}>
            <p style={{ margin: 0, color: tokens.color.accent, fontFamily: tokens.typography.fontFamilyMono, fontSize: 16, fontStyle: "italic" }}>
              // active_hover_state
            </p>
            <WebSegmentedControl
              options={[
                { label: "View", value: "view" },
                { label: "Edit", value: "edit" },
                { label: "Manage", value: "manage" }
              ]}
              value={segmentValue}
              onChange={setSegmentValue}
            />
          </div>
        </WebCard>

        <WebCard title="States & Logic" description="System feedback and execution modules.">
          <div style={{ display: "grid", gap: tokens.spacing.sm }}>
            <WebLoadingState title="Execution running" description="Processing active node graph in real-time." />
            <WebEmptyState title="No triggers found" description="Waiting for incoming technical webhook events." />
            <WebErrorState title="Execution failed" description="Critical error: Retry after checking auth node credentials." onRetry={() => undefined} />
          </div>
        </WebCard>

        <WebEmptyStatePanel title="No data available" description="Check connector settings" />

        <WebSpacingMatrix />

        <div style={{ display: "grid", gap: tokens.spacing.lg, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <WebCard title="Badges" description="Operational status labels.">
            <div style={{ display: "flex", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
              <WebStatusBadge label="Operational" tone="success" />
              <WebStatusBadge label="Degraded" tone="warning" />
              <WebStatusBadge label="Critical" tone="error" />
              <WebStatusBadge label="Maintenance" tone="neutral" />
            </div>
          </WebCard>

          <WebCard title="Switches" description="Active and idle toggle treatment.">
            <div style={{ display: "grid", gap: tokens.spacing.sm }}>
              <WebSwitchRow label="Active" value={activeListeners} onToggle={setActiveListeners} />
              <WebSwitchRow label="Idle" value={debugMode} onToggle={setDebugMode} />
            </div>
          </WebCard>

          <WebCard title="Interactive Chips" description="Selectable and removable chips.">
            <div style={{ display: "flex", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
              <WebInteractiveChip label="Performance" leadingIcon="⚡" />
              <WebInteractiveChip label="Security" leadingIcon="✹" active />
              <WebInteractiveChip label="Integrations" leadingIcon="✣" removable />
            </div>
          </WebCard>

          <WebCard title="Data Viz Palette" description="Metric and sparkline tokens.">
            <div style={{ display: "grid", gap: tokens.spacing.sm, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <WebKpiTile title="Sync Rate" value="98.4%" deltaLabel="+12%" deltaTone="success" />
              <WebKpiTile title="Latency" value="24ms" deltaLabel="-4ms" deltaTone="error" accent="accent" />
            </div>
          </WebCard>
        </div>

        <WebIconographySpec />

        <WebNavigationPattern
          tabs={[
            { id: "active", label: "Active" },
            { id: "stats", label: "Stats" },
            { id: "tools", label: "Tools" }
          ]}
          activeTab={tabValue}
          onChange={setTabValue}
        />

        <WebCard title="Visual Containers" description="Layered cards and chart surfaces with premium block treatment.">
          <div style={{ display: "grid", gap: tokens.spacing.md }}>
            <WebChartContainer title="Weekly Report" subtitle="Updated 2h ago">
              <div style={{ height: 140, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.color.border}`, backgroundColor: "rgba(9, 12, 23, 0.95)", padding: tokens.spacing.md, display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", alignItems: "end", gap: tokens.spacing.xs }}>
                <span style={{ height: 44, borderRadius: tokens.radius.sm, backgroundColor: "rgba(255,109,36,0.35)" }} />
                <span style={{ height: 78, borderRadius: tokens.radius.sm, backgroundColor: "rgba(255,109,36,0.45)" }} />
                <span style={{ height: 58, borderRadius: tokens.radius.sm, backgroundColor: "rgba(255,109,36,0.35)" }} />
                <span style={{ height: 102, borderRadius: tokens.radius.sm, backgroundColor: tokens.color.accent, boxShadow: `0 0 14px ${tokens.color.accentSoft}` }} />
                <span style={{ height: 74, borderRadius: tokens.radius.sm, backgroundColor: "rgba(255,109,36,0.45)" }} />
                <span style={{ height: 60, borderRadius: tokens.radius.sm, backgroundColor: "rgba(255,109,36,0.35)" }} />
              </div>
            </WebChartContainer>
            <article style={{ borderRadius: tokens.radius.xl, border: `1px solid ${tokens.color.border}`, overflow: "hidden", background: "linear-gradient(180deg, rgba(14,20,36,0.9) 0%, rgba(10,12,24,0.95) 100%)", padding: tokens.spacing.lg, display: "grid", gap: tokens.spacing.sm }}>
              <span style={{ alignSelf: "start", padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`, borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.accentStrong}`, color: tokens.color.accent, fontFamily: tokens.typography.fontFamilyMono, fontWeight: 700, fontSize: 12 }}>PREMIUM</span>
              <strong style={{ color: tokens.color.ink, fontSize: 40, lineHeight: "46px", fontFamily: tokens.typography.fontFamily }}>Dark Mode Elements</strong>
              <span style={{ color: tokens.color.inkMuted, fontFamily: tokens.typography.fontFamily }}>High contrast components</span>
            </article>
          </div>
        </WebCard>

        <WebModalSheet
          open={isSheetOpen}
          title="Execute Workflow"
          description="Choose mode and confirm runtime settings before execution."
          primaryActionLabel="Execute"
          secondaryActionLabel="Cancel"
          onPrimaryAction={() => setIsSheetOpen(false)}
          onSecondaryAction={() => setIsSheetOpen(false)}
          onClose={() => setIsSheetOpen(false)}
        >
          <WebInput label="Execution Name" value="Nightly Sync" />
        </WebModalSheet>
      </div>
    </main>
  );
}
