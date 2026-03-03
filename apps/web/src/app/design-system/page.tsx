"use client";

import { useState } from "react";
import {
  WebButton,
  WebCard,
  WebChartContainer,
  WebEmptyState,
  WebErrorState,
  WebInteractiveChip,
  WebInput,
  WebKpiTile,
  WebListRow,
  WebLoadingState,
  WebModalSheet,
  WebPresenceAvatar,
  WebSegmentedControl,
  WebStatusBadge,
  WebSwitchRow
} from "@hiro/ui-primitives/web";
import { tokens } from "@hiro/ui-tokens";

export default function DesignSystemGalleryPage() {
  const [inputValue, setInputValue] = useState("hiro_flow_01");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [segmentValue, setSegmentValue] = useState("view");
  const [activeListeners, setActiveListeners] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  return (
    <main style={{ minHeight: "100vh", padding: tokens.spacing.xl, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -2,
          background: `linear-gradient(180deg, ${tokens.color.bgCanvasTop} 0%, ${tokens.color.bgCanvasBottom} 100%)`
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

      <div
        style={{
          maxWidth: tokens.size.contentMax,
          margin: "0 auto",
          display: "grid",
          gap: tokens.spacing.xl
        }}
      >
        <section
          style={{
            borderRadius: tokens.radius.xxl,
            border: `1px solid ${tokens.color.border}`,
            backgroundColor: tokens.color.surface,
            boxShadow: tokens.elevation.high,
            padding: tokens.spacing.xxl,
            display: "grid",
            gap: tokens.spacing.md,
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `radial-gradient(${tokens.color.border} 1px, transparent 1px)`,
              backgroundSize: "22px 22px",
              opacity: 0.22,
              pointerEvents: "none"
            }}
          />
          <p
            style={{
              margin: 0,
              fontFamily: tokens.typography.fontFamily,
              color: tokens.color.accent,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontSize: tokens.typography.labelSize,
              fontWeight: 700,
              position: "relative"
            }}
          >
            System Library
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: tokens.typography.fontFamily,
              color: tokens.color.ink,
              fontSize: tokens.typography.displaySize,
              lineHeight: `${tokens.typography.lineHeightDisplay}px`,
              position: "relative"
            }}
          >
            Hiro Workflow System
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: tokens.typography.fontFamily,
              color: tokens.color.inkMuted,
              fontSize: tokens.typography.bodySize,
              maxWidth: 760,
              position: "relative"
            }}
          >
            Technical dark design language for nodes, execution states, and action patterns across web and mobile.
          </p>
          <div style={{ display: "flex", gap: tokens.spacing.sm, flexWrap: "wrap", position: "relative" }}>
            <WebButton label="Open Workflow Sheet" onPress={() => setIsSheetOpen(true)} />
            <WebButton label="Secondary Action" variant="secondary" />
            <WebButton label="Ghost Action" variant="ghost" />
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gap: tokens.spacing.lg,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))"
          }}
        >
          <WebCard title="Action Elements" description="Primary, secondary, ghost, and danger variants.">
            <div style={{ display: "flex", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
              <WebButton label="Primary Action" variant="primary" />
              <WebButton label="Secondary" variant="secondary" />
              <WebButton label="Ghost" variant="ghost" />
              <WebButton label="Danger" variant="danger" />
              <WebButton label="Disabled" disabled />
            </div>
          </WebCard>

          <WebCard title="Inputs & Forms" description="High-contrast fields and semantic states.">
            <div style={{ display: "grid", gap: tokens.spacing.md }}>
              <WebInput
                label="Username"
                value={inputValue}
                onChangeText={setInputValue}
                helperText="Unique workflow identifier"
              />
              <WebInput label="Execution Key" value="wf_9382" state="success" helperText="Validated and ready" />
              <WebInput label="Webhook URL" value="" state="error" helperText="Missing endpoint URL" />
            </div>
          </WebCard>
        </div>

        <div
          style={{
            display: "grid",
            gap: tokens.spacing.lg,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))"
          }}
        >
          <WebCard title="Inventory Expansion" description="Segmented controls, presence, KPI, badges, switches, and chips.">
            <div style={{ display: "grid", gap: tokens.spacing.md }}>
              <WebSegmentedControl
                options={[
                  { label: "View", value: "view" },
                  { label: "Edit", value: "edit" },
                  { label: "Manage", value: "manage" }
                ]}
                value={segmentValue}
                onChange={setSegmentValue}
              />
              <div style={{ display: "flex", gap: tokens.spacing.sm }}>
                <WebPresenceAvatar name="Sarah Jenkins" status="online" highlighted />
                <WebPresenceAvatar name="Michael Chen" status="idle" />
                <WebPresenceAvatar name="Emma Wilson" status="offline" />
              </div>
              <div style={{ display: "grid", gap: tokens.spacing.sm, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <WebKpiTile title="Sync Rate" value="98.4%" deltaLabel="+12%" deltaTone="success" />
                <WebKpiTile title="Latency" value="24ms" deltaLabel="-4ms" deltaTone="error" accent="accent" />
              </div>
              <div style={{ display: "flex", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
                <WebStatusBadge label="Operational" tone="success" />
                <WebStatusBadge label="Degraded" tone="warning" />
                <WebStatusBadge label="Critical" tone="error" />
                <WebStatusBadge label="Maintenance" tone="neutral" />
              </div>
              <div style={{ display: "grid", gap: tokens.spacing.sm }}>
                <WebSwitchRow label="Active listeners" value={activeListeners} onToggle={setActiveListeners} />
                <WebSwitchRow label="Debug mode" value={debugMode} onToggle={setDebugMode} />
              </div>
              <div style={{ display: "flex", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
                <WebInteractiveChip label="Performance" leadingIcon="+" />
                <WebInteractiveChip label="Security" leadingIcon="*" active />
                <WebInteractiveChip label="Integrations" leadingIcon="#" removable />
              </div>
            </div>
          </WebCard>

          <WebCard title="Workflow Nodes" description="Dense list styling with clean metadata alignment.">
            <div style={{ display: "grid", gap: tokens.spacing.sm }}>
              <WebListRow title="Parse incoming webhook payload" subtitle="Node: transform.input" meta="42ms" />
              <WebListRow
                title="Persist execution snapshot and telemetry"
                subtitle="Node: storage.write"
                meta="118ms"
                density="compact"
              />
            </div>
          </WebCard>

          <WebCard title="States & Logic" description="Reusable async and system feedback modules.">
            <div style={{ display: "grid", gap: tokens.spacing.sm }}>
              <WebLoadingState title="Execution running" description="Processing active node graph." />
              <WebEmptyState title="No triggers found" description="Waiting for incoming webhook events." />
              <WebErrorState title="Execution failed" description="Retry after checking auth node." onRetry={() => undefined} />
            </div>
          </WebCard>
        </div>

        <WebChartContainer title="Execution Throughput" subtitle="Chart wrapper baseline for observability views.">
          <div
            style={{
              height: 180,
              borderRadius: tokens.radius.lg,
              border: `1px solid ${tokens.color.border}`,
              backgroundColor: tokens.color.surfaceMuted,
              padding: tokens.spacing.md,
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: tokens.spacing.xs,
              alignItems: "end"
            }}
          >
            <div style={{ height: 22, borderRadius: tokens.radius.md, backgroundColor: tokens.color.accentSoft, width: "100%" }} />
            <div style={{ height: 44, borderRadius: tokens.radius.md, backgroundColor: tokens.color.accentSoft, width: "100%" }} />
            <div style={{ height: 64, borderRadius: tokens.radius.md, backgroundColor: tokens.color.accentSoft, width: "100%" }} />
            <div
              style={{
                height: 78,
                borderRadius: tokens.radius.md,
                width: "100%",
                background: `linear-gradient(90deg, ${tokens.color.accent} 0%, ${tokens.color.accentAlt} 100%)`
              }}
            />
          </div>
        </WebChartContainer>

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
