import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  MobileButton,
  MobileCard,
  MobileChartContainer,
  MobileEmptyState,
  MobileErrorState,
  MobileInput,
  MobileListRow,
  MobileLoadingState,
  MobileModalSheet
} from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";

export function DesignSystemGalleryScreen() {
  const [nameValue, setNameValue] = useState("hiro_user_01");
  const [sheetOpen, setSheetOpen] = useState(false);

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
