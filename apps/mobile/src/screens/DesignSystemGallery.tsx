import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  MobileButton,
  MobileCard,
  MobileChartContainer,
  MobileEmptyState,
  MobileEmptyStatePanel,
  MobileErrorState,
  MobileIconographySpec,
  MobileInteractiveChip,
  MobileInput,
  MobileKpiTile,
  MobileLoadingState,
  MobileModalSheet,
  MobileNavigationPattern,
  MobileSegmentedControl,
  MobileSpacingMatrix,
  MobileStatusBadge,
  MobileSwitchRow
} from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";

function DotGridBackdrop() {
  const dots = useMemo(() => Array.from({ length: 180 }, (_, idx) => idx), []);
  return (
    <View style={{ position: "absolute", inset: 0, opacity: 0.2 }} pointerEvents="none">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, padding: 8 }}>
        {dots.map((dot) => (
          <View key={dot} style={{ width: 2, height: 2, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.4)" }} />
        ))}
      </View>
    </View>
  );
}

export function DesignSystemGalleryScreen() {
  const [inputValue, setInputValue] = useState("Technical Input");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [segmentValue, setSegmentValue] = useState("edit");
  const [activeListeners, setActiveListeners] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [tabValue, setTabValue] = useState("active");

  return (
    <>
      <View style={{ flex: 1, position: "relative", backgroundColor: tokens.color.bg }}>
        <DotGridBackdrop />
        <ScrollView
          contentContainerStyle={{
            gap: tokens.spacing.lg,
            padding: tokens.spacing.lg,
            paddingBottom: tokens.spacing.xxxl
          }}
        >
          <View
            style={{
              borderRadius: tokens.radius.xl,
              borderWidth: 1,
              borderColor: tokens.color.border,
              backgroundColor: "rgba(18, 21, 38, 0.9)",
              padding: tokens.spacing.xl,
              gap: tokens.spacing.sm
            }}
          >
            <Text style={{ color: tokens.color.accent, fontFamily: tokens.typography.fontFamilyMono, fontSize: tokens.typography.labelSize, textTransform: "uppercase", letterSpacing: 1.2 }}>
              Hiro System | Icon & Type Contract
            </Text>
            <Text style={{ color: tokens.color.ink, fontFamily: tokens.typography.fontFamily, fontSize: tokens.typography.headlineSize, fontWeight: "800" }}>Design System Gallery</Text>
            <Text style={{ color: tokens.color.inkMuted, fontFamily: tokens.typography.fontFamily, fontSize: tokens.typography.bodySmallSize }}>
              Technical dark language for execution, controls, states, and navigation patterns.
            </Text>
            <MobileButton label="Open Workflow Sheet" onPress={() => setSheetOpen(true)} />
          </View>

          <MobileCard title="Button States" description="Default, pressed intent, loading, disabled.">
            <View style={{ gap: tokens.spacing.sm }}>
              <MobileButton label="Action" variant="primary" fullWidth />
              <MobileButton label="Processing" variant="secondary" loading fullWidth />
              <MobileButton label="Action Unavailable" variant="primary" disabled fullWidth />
            </View>
          </MobileCard>

          <MobileCard title="Input States" description="Focus glow, error, success, disabled.">
            <View style={{ gap: tokens.spacing.md }}>
              <MobileInput label="Focus Glow State" value={inputValue} onChangeText={setInputValue} forceFocused helperText="ACTIVE" />
              <View style={{ flexDirection: "row", gap: tokens.spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <MobileInput label="Error" value="Invalid" state="error" helperText="Invalid" />
                </View>
                <View style={{ flex: 1 }}>
                  <MobileInput label="Success" value="Valid" state="success" helperText="Valid" />
                </View>
              </View>
              <MobileInput label="Disabled" value="Action Unavailable" state="disabled" helperText="Readonly" />
            </View>
          </MobileCard>

          <MobileCard title="Segmented Controls" description="Active hover state treatment.">
            <View style={{ gap: tokens.spacing.sm }}>
              <Text style={{ color: tokens.color.accent, fontFamily: tokens.typography.fontFamilyMono, fontSize: 14, fontStyle: "italic" }}>
                // active_hover_state
              </Text>
              <MobileSegmentedControl
                options={[
                  { label: "View", value: "view" },
                  { label: "Edit", value: "edit" },
                  { label: "Manage", value: "manage" }
                ]}
                value={segmentValue}
                onChange={setSegmentValue}
              />
            </View>
          </MobileCard>

          <MobileCard title="States & Logic" description="System feedback and execution modules.">
            <View style={{ gap: tokens.spacing.sm }}>
              <MobileLoadingState title="Execution running" description="Processing active node graph in real-time." />
              <MobileEmptyState title="No triggers found" description="Waiting for incoming technical webhook events." />
              <MobileErrorState title="Execution failed" description="Critical error: Retry after checking auth node credentials." onRetry={() => undefined} />
            </View>
          </MobileCard>

          <MobileEmptyStatePanel title="No data available" description="Check connector settings" />

          <MobileSpacingMatrix />

          <MobileCard title="Badges, Switches & Chips" description="Operational status and control affordances.">
            <View style={{ gap: tokens.spacing.md }}>
              <View style={{ flexDirection: "row", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
                <MobileStatusBadge label="Operational" tone="success" />
                <MobileStatusBadge label="Degraded" tone="warning" />
                <MobileStatusBadge label="Critical" tone="error" />
                <MobileStatusBadge label="Maintenance" tone="neutral" />
              </View>
              <View style={{ gap: tokens.spacing.sm }}>
                <MobileSwitchRow label="Active" value={activeListeners} onToggle={setActiveListeners} />
                <MobileSwitchRow label="Idle" value={debugMode} onToggle={setDebugMode} />
              </View>
              <View style={{ flexDirection: "row", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
                <MobileInteractiveChip label="Performance" leadingIcon="⚡" />
                <MobileInteractiveChip label="Security" leadingIcon="✹" active />
                <MobileInteractiveChip label="Integrations" leadingIcon="✣" removable />
              </View>
            </View>
          </MobileCard>

          <MobileCard title="Data Viz Palette" description="Metric and sparkline tokens.">
            <View style={{ flexDirection: "row", gap: tokens.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <MobileKpiTile title="Sync Rate" value="98.4%" deltaLabel="+12%" deltaTone="success" />
              </View>
              <View style={{ flex: 1 }}>
                <MobileKpiTile title="Latency" value="24ms" deltaLabel="-4ms" deltaTone="error" accent="accent" />
              </View>
            </View>
          </MobileCard>

          <MobileIconographySpec />

          <MobileNavigationPattern
            tabs={[
              { id: "active", label: "Active" },
              { id: "stats", label: "Stats" },
              { id: "tools", label: "Tools" }
            ]}
            activeTab={tabValue}
            onChange={setTabValue}
          />

          <MobileCard title="Visual Containers" description="Layered cards and premium treatment.">
            <View style={{ gap: tokens.spacing.md }}>
              <MobileChartContainer title="Weekly Report" subtitle="Updated 2h ago">
                <View
                  style={{
                    height: 120,
                    borderRadius: tokens.radius.lg,
                    borderWidth: 1,
                    borderColor: tokens.color.border,
                    backgroundColor: "rgba(9, 12, 23, 0.95)",
                    justifyContent: "flex-end",
                    flexDirection: "row",
                    gap: tokens.spacing.xs,
                    padding: tokens.spacing.md
                  }}
                >
                  <View style={{ flex: 1, height: 44, borderRadius: tokens.radius.sm, backgroundColor: "rgba(255,109,36,0.35)" }} />
                  <View style={{ flex: 1, height: 78, borderRadius: tokens.radius.sm, backgroundColor: "rgba(255,109,36,0.45)" }} />
                  <View style={{ flex: 1, height: 58, borderRadius: tokens.radius.sm, backgroundColor: "rgba(255,109,36,0.35)" }} />
                  <View style={{ flex: 1, height: 102, borderRadius: tokens.radius.sm, backgroundColor: tokens.color.accent }} />
                  <View style={{ flex: 1, height: 74, borderRadius: tokens.radius.sm, backgroundColor: "rgba(255,109,36,0.45)" }} />
                </View>
              </MobileChartContainer>
              <View style={{ borderRadius: tokens.radius.xl, borderWidth: 1, borderColor: tokens.color.border, overflow: "hidden", backgroundColor: "rgba(10,12,24,0.95)", padding: tokens.spacing.lg, gap: tokens.spacing.sm }}>
                <Text style={{ alignSelf: "flex-start", paddingVertical: tokens.spacing.xs, paddingHorizontal: tokens.spacing.sm, borderRadius: tokens.radius.sm, borderWidth: 1, borderColor: tokens.color.accentStrong, color: tokens.color.accent, fontFamily: tokens.typography.fontFamilyMono, fontWeight: "700", fontSize: 12 }}>PREMIUM</Text>
                <Text style={{ color: tokens.color.ink, fontFamily: tokens.typography.fontFamily, fontSize: 30, lineHeight: 36, fontWeight: "700" }}>Dark Mode Elements</Text>
                <Text style={{ color: tokens.color.inkMuted, fontFamily: tokens.typography.fontFamily }}>High contrast components</Text>
              </View>
            </View>
          </MobileCard>
        </ScrollView>
      </View>

      <MobileModalSheet
        open={sheetOpen}
        title="Execute Workflow"
        description="Choose mode and confirm runtime settings before execution."
        primaryActionLabel="Execute"
        secondaryActionLabel="Cancel"
        onPrimaryAction={() => setSheetOpen(false)}
        onSecondaryAction={() => setSheetOpen(false)}
        onClose={() => setSheetOpen(false)}
      >
        <MobileInput label="Execution Name" value="Nightly Sync" />
      </MobileModalSheet>
    </>
  );
}
