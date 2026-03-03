import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  MobileButton,
  MobileCard,
  MobileChartContainer,
  MobileEmptyState,
  MobileErrorState,
  MobileInteractiveChip,
  MobileInput,
  MobileKpiTile,
  MobileListRow,
  MobileLoadingState,
  MobileModalSheet,
  MobilePresenceAvatar,
  MobileSegmentedControl,
  MobileStatusBadge,
  MobileSwitchRow
} from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";

export function DesignSystemGalleryScreen() {
  const [nameValue, setNameValue] = useState("hiro_user_01");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [segmentValue, setSegmentValue] = useState("view");
  const [activeListeners, setActiveListeners] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [menuValue, setMenuValue] = useState("system");

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          backgroundColor: tokens.color.bg,
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
            backgroundColor: tokens.color.surface,
            padding: tokens.spacing.xl,
            gap: tokens.spacing.sm
          }}
        >
          <Text
            style={{
              color: tokens.color.accent,
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.labelSize,
              fontWeight: "700",
              letterSpacing: 1,
              textTransform: "uppercase"
            }}
          >
            System Library
          </Text>
          <Text
            style={{
              color: tokens.color.ink,
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.headlineSize,
              fontWeight: "800"
            }}
          >
            Hiro Workflow System
          </Text>
          <Text
            style={{
              color: tokens.color.inkMuted,
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.bodySmallSize
            }}
          >
            Technical dark mode for execution flows, workflow nodes, and shared system components.
          </Text>
          <MobileButton label="Open Workflow Sheet" onPress={() => setSheetOpen(true)} />
        </View>

        <MobileCard title="Action Elements" description="Primary, secondary, and ghost actions.">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.sm }}>
            <MobileButton label="Primary" variant="primary" />
            <MobileButton label="Secondary" variant="secondary" />
            <MobileButton label="Ghost" variant="ghost" />
            <MobileButton label="Danger" variant="danger" />
            <MobileButton label="Disabled" variant="primary" disabled />
          </View>
        </MobileCard>

        <MobileCard title="Inputs & Forms" description="High-contrast forms with clear signal states.">
          <View style={{ gap: tokens.spacing.md }}>
            <MobileInput
              label="Username"
              value={nameValue}
              onChangeText={setNameValue}
              helperText="Unique workflow identifier"
            />
            <MobileInput label="Execution Key" value="wf_9382" state="success" helperText="Validated and ready" />
            <MobileInput label="Webhook URL" value="" state="error" helperText="Missing endpoint URL" />
            <MobileInput label="Read-only secret" value="************" state="disabled" helperText="Disabled input style" />
          </View>
        </MobileCard>

        <MobileCard title="Color Palette" description="Core surfaces, semantic states, and data-viz accents.">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.sm }}>
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
              <View key={label} style={{ width: 70, gap: 4 }}>
                <View
                  style={{
                    height: 32,
                    borderRadius: tokens.radius.sm,
                    borderWidth: 1,
                    borderColor: tokens.color.border,
                    backgroundColor: color
                  }}
                />
                <Text style={{ color: tokens.color.inkMuted, fontFamily: tokens.typography.fontFamily, fontSize: 10 }}>{label}</Text>
              </View>
            ))}
          </View>
        </MobileCard>

        <MobileCard title="Typography" description="Display, heading, body, and label standards.">
          <View style={{ gap: tokens.spacing.sm }}>
            <Text style={{ color: tokens.color.ink, fontFamily: tokens.typography.fontFamily, fontSize: 32, fontWeight: "800" }}>Display 32</Text>
            <Text style={{ color: tokens.color.ink, fontFamily: tokens.typography.fontFamily, fontSize: 22, fontWeight: "700" }}>Heading 22</Text>
            <Text style={{ color: tokens.color.inkMuted, fontFamily: tokens.typography.fontFamily, fontSize: tokens.typography.bodySize }}>Body 16 for operational detail copy.</Text>
            <Text style={{ color: tokens.color.accent, fontFamily: tokens.typography.fontFamily, fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" }}>Label 11 uppercase token metadata</Text>
          </View>
        </MobileCard>

        <MobileCard title="Workflow Nodes" description="Tight list rhythm and metadata alignment.">
          <View style={{ gap: tokens.spacing.sm }}>
            <MobileListRow title="Parse incoming webhook payload" subtitle="Node: transform.input" meta="42ms" />
            <MobileListRow
              title="Persist execution snapshot and telemetry"
              subtitle="Node: storage.write"
              meta="118ms"
              density="compact"
            />
          </View>
        </MobileCard>

        <MobileCard title="States & Logic" description="Reusable operational feedback blocks.">
          <View style={{ gap: tokens.spacing.sm }}>
            <MobileLoadingState title="Execution running" description="Processing active node graph." />
            <MobileEmptyState title="No triggers found" description="Waiting for incoming webhook events." />
            <MobileErrorState title="Execution failed" description="Retry after checking auth node." onRetry={() => undefined} />
          </View>
        </MobileCard>

        <MobileCard title="Inventory Expansion" description="Segmented controls, presence, KPI, badges, switches, and chips.">
          <View style={{ gap: tokens.spacing.md }}>
            <MobileSegmentedControl
              options={[
                { label: "View", value: "view" },
                { label: "Edit", value: "edit" },
                { label: "Manage", value: "manage" }
              ]}
              value={segmentValue}
              onChange={setSegmentValue}
            />
            <View style={{ flexDirection: "row", gap: tokens.spacing.sm }}>
              <MobilePresenceAvatar name="Sarah Jenkins" status="online" highlighted />
              <MobilePresenceAvatar name="Michael Chen" status="idle" />
              <MobilePresenceAvatar name="Emma Wilson" status="offline" />
            </View>
            <View style={{ flexDirection: "row", gap: tokens.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <MobileKpiTile title="Sync Rate" value="98.4%" deltaLabel="+12%" deltaTone="success" />
              </View>
              <View style={{ flex: 1 }}>
                <MobileKpiTile title="Latency" value="24ms" deltaLabel="-4ms" deltaTone="error" accent="accent" />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
              <MobileStatusBadge label="Operational" tone="success" />
              <MobileStatusBadge label="Degraded" tone="warning" />
              <MobileStatusBadge label="Critical" tone="error" />
              <MobileStatusBadge label="Maintenance" tone="neutral" />
            </View>
            <View style={{ gap: tokens.spacing.sm }}>
              <MobileSwitchRow label="Active listeners" value={activeListeners} onToggle={setActiveListeners} />
              <MobileSwitchRow label="Debug mode" value={debugMode} onToggle={setDebugMode} />
            </View>
            <View style={{ flexDirection: "row", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
              <MobileInteractiveChip label="Performance" leadingIcon="+" />
              <MobileInteractiveChip label="Security" leadingIcon="*" active />
              <MobileInteractiveChip label="Integrations" leadingIcon="#" removable />
            </View>
          </View>
        </MobileCard>

        <MobileChartContainer title="Execution Throughput" subtitle="Chart wrapper for observability modules.">
          <View
            style={{
              height: 160,
              borderRadius: tokens.radius.lg,
              borderWidth: 1,
              borderColor: tokens.color.border,
              backgroundColor: tokens.color.surfaceMuted,
              justifyContent: "flex-end",
              gap: tokens.spacing.xs,
              padding: tokens.spacing.md
            }}
          >
            <View style={{ height: 18, borderRadius: tokens.radius.md, backgroundColor: tokens.color.accentSoft }} />
            <View style={{ height: 36, borderRadius: tokens.radius.md, backgroundColor: tokens.color.accentSoft }} />
            <View style={{ height: 62, borderRadius: tokens.radius.md, backgroundColor: tokens.color.accent }} />
          </View>
        </MobileChartContainer>

        <MobileCard title="Data Viz Palette" description="Ordered palette for chart bars and legends.">
          <View style={{ gap: tokens.spacing.sm }}>
            {[
              ["Primary Trend", tokens.color.accent],
              ["Secondary Trend", tokens.color.accentAlt],
              ["Info Series", tokens.color.info],
              ["Success Series", tokens.color.success]
            ].map(([label, color]) => (
              <View key={label} style={{ gap: 4 }}>
                <Text style={{ color: tokens.color.inkMuted, fontFamily: tokens.typography.fontFamily, fontSize: 11 }}>{label}</Text>
                <View style={{ height: 8, borderRadius: tokens.radius.pill, backgroundColor: color }} />
              </View>
            ))}
          </View>
        </MobileCard>

        <MobileCard title="Iconography Standard" description="Use icon size rhythm across controls and navigation.">
          <View style={{ gap: tokens.spacing.sm }}>
            {[
              ["Small", tokens.size.iconSm, "dense lists"],
              ["Medium", tokens.size.iconMd, "controls"],
              ["Large", tokens.size.iconLg, "primary nav"]
            ].map(([name, px, usage]) => (
              <View key={name} style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm }}>
                <View
                  style={{
                    width: Number(px),
                    height: Number(px),
                    borderRadius: tokens.radius.sm,
                    backgroundColor: tokens.color.surfaceStrong,
                    borderWidth: 1,
                    borderColor: tokens.color.border
                  }}
                />
                <Text style={{ color: tokens.color.ink, fontFamily: tokens.typography.fontFamily, fontSize: 12, fontWeight: "700" }}>{name}</Text>
                <Text style={{ color: tokens.color.inkMuted, fontFamily: tokens.typography.fontFamily, fontSize: 12 }}>{px}px {usage}</Text>
              </View>
            ))}
          </View>
        </MobileCard>

        <MobileCard title="Mobile Menu Pattern" description="Bottom-tab token treatment preview.">
          <View style={{ borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: tokens.color.border, backgroundColor: tokens.color.bgElevated, padding: tokens.spacing.sm }}>
            <View style={{ flexDirection: "row", gap: tokens.spacing.xs }}>
              {[
                { id: "system", label: "System" },
                { id: "comp", label: "Comp" },
                { id: "patterns", label: "Patterns" },
                { id: "settings", label: "Settings" }
              ].map((item) => {
                const active = menuValue === item.id;
                return (
                  <View key={item.id} style={{ flex: 1 }}>
                    <MobileButton
                      label={item.label}
                      variant={active ? "primary" : "ghost"}
                      size="sm"
                      onPress={() => setMenuValue(item.id)}
                      fullWidth
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </MobileCard>
      </ScrollView>

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
