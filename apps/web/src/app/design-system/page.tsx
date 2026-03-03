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
  const [menuValue, setMenuValue] = useState("system");

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
          <WebCard title="Color Palette" description="Core surfaces, semantic states, and data-viz accents.">
            <div style={{ display: "grid", gap: tokens.spacing.sm }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: tokens.spacing.xs }}>
                {[
                  ["Accent", tokens.color.accent],
                  ["Accent Alt", tokens.color.accentAlt],
                  ["Info", tokens.color.info],
                  ["Success", tokens.color.success],
                  ["Warning", tokens.color.warning],
                  ["Error", tokens.color.error],
                  ["Surface", tokens.color.surface],
                  ["Surface M", tokens.color.surfaceMuted]
                ].map(([label, color]) => (
                  <div key={label} style={{ display: "grid", gap: 6 }}>
                    <div style={{ height: 34, borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.border}`, backgroundColor: color }} />
                    <span style={{ fontSize: 10, color: tokens.color.inkMuted, fontFamily: tokens.typography.fontFamily }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </WebCard>

          <WebCard title="Typography" description="Display, heading, body, and label standards.">
            <div style={{ display: "grid", gap: tokens.spacing.sm }}>
              <p style={{ margin: 0, color: tokens.color.ink, fontFamily: tokens.typography.fontFamily, fontSize: 32, fontWeight: 800 }}>Display 32</p>
              <p style={{ margin: 0, color: tokens.color.ink, fontFamily: tokens.typography.fontFamily, fontSize: 22, fontWeight: 700 }}>Heading 22</p>
              <p style={{ margin: 0, color: tokens.color.inkMuted, fontFamily: tokens.typography.fontFamily, fontSize: tokens.typography.bodySize }}>Body 16 for operational detail copy.</p>
              <p style={{ margin: 0, color: tokens.color.accent, fontFamily: tokens.typography.fontFamily, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>Label 11 uppercase token metadata</p>
            </div>
          </WebCard>

          <WebCard title="Action Elements" description="Primary, secondary, ghost, and danger variants.">
            <div style={{ display: "flex", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
              <WebButton label="Primary Action" variant="primary" />
              <WebButton label="Secondary" variant="secondary" />
              <WebButton label="Ghost" variant="ghost" />
              <WebButton label="Danger" variant="danger" />
              <WebButton label="Disabled Primary" variant="primary" disabled />
              <WebButton label="Disabled Secondary" variant="secondary" disabled />
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
              <WebInput label="Read-only secret" value="************" state="disabled" helperText="Disabled input style" />
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

        <div
          style={{
            display: "grid",
            gap: tokens.spacing.lg,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))"
          }}
        >
          <WebCard title="Data Viz Palette" description="Ordered palette for chart bars and legends.">
            <div style={{ display: "grid", gap: tokens.spacing.sm }}>
              {[
                ["Primary Trend", tokens.color.accent],
                ["Secondary Trend", tokens.color.accentAlt],
                ["Info Series", tokens.color.info],
                ["Success Series", tokens.color.success]
              ].map(([label, color]) => (
                <div key={label} style={{ display: "grid", gap: 4 }}>
                  <span style={{ color: tokens.color.inkMuted, fontSize: 11, fontFamily: tokens.typography.fontFamily }}>{label}</span>
                  <div style={{ height: 8, borderRadius: tokens.radius.pill, backgroundColor: color }} />
                </div>
              ))}
            </div>
          </WebCard>

          <WebCard title="Iconography Standard" description="Use consistent size rhythm for control and navigation icons.">
            <div style={{ display: "grid", gap: tokens.spacing.sm }}>
              {[
                ["Small", `${tokens.size.iconSm}px`, "for dense lists"],
                ["Medium", `${tokens.size.iconMd}px`, "for controls"],
                ["Large", `${tokens.size.iconLg}px`, "for primary nav"]
              ].map(([name, px, usage]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
                  <div style={{ width: Number.parseInt(px, 10), height: Number.parseInt(px, 10), borderRadius: tokens.radius.sm, backgroundColor: tokens.color.surfaceStrong, border: `1px solid ${tokens.color.border}` }} />
                  <span style={{ color: tokens.color.ink, fontSize: 12, fontWeight: 700, fontFamily: tokens.typography.fontFamily }}>{name}</span>
                  <span style={{ color: tokens.color.inkMuted, fontSize: 12, fontFamily: tokens.typography.fontFamily }}>{px} {usage}</span>
                </div>
              ))}
            </div>
          </WebCard>

          <WebCard title="Mobile Menu Pattern" description="Bottom-tab token treatment preview.">
            <div style={{ borderRadius: tokens.radius.lg, border: `1px solid ${tokens.color.border}`, backgroundColor: tokens.color.bgElevated, padding: tokens.spacing.sm }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: tokens.spacing.xs }}>
                {[
                  { id: "system", label: "System" },
                  { id: "comp", label: "Comp" },
                  { id: "patterns", label: "Patterns" },
                  { id: "settings", label: "Settings" }
                ].map((item) => {
                  const active = menuValue === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMenuValue(item.id)}
                      style={{
                        border: "none",
                        borderRadius: tokens.radius.md,
                        backgroundColor: active ? tokens.color.surfaceStrong : "transparent",
                        color: active ? tokens.color.accent : tokens.color.inkSoft,
                        padding: `${tokens.spacing.sm}px ${tokens.spacing.xs}px`,
                        fontFamily: tokens.typography.fontFamily,
                        fontSize: 11,
                        fontWeight: active ? 700 : 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        cursor: "pointer"
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </WebCard>
        </div>

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
