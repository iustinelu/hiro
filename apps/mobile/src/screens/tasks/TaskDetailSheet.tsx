import React from "react";
import { Text, View } from "react-native";
import type { OneOffTask, RecurringTask } from "@hiro/domain";
import { MobileModalSheet, MobileStatusBadge, useTheme } from "@hiro/ui-primitives/mobile";
import { cadenceLabel } from "../../lib/taskService";
import { hoursUntil } from "../../lib/relativeTime";

/* The row the detail sheet is describing. Recurring tasks carry a completed flag;
 * one-offs carry the poster/claimer display names resolved by the caller. */
export type DetailTarget =
  | { type: "recurring"; task: RecurringTask; completed: boolean }
  | { type: "oneoff"; task: OneOffTask; postedByName: string | null; claimedByName: string | null };

interface Props {
  target: DetailTarget | null;
  profileId: string | null;
  busy: boolean;
  onClose: () => void;
  onCompleteRecurring: (taskId: string) => void;
  onUndoRecurring: (taskId: string) => void;
  onClaim: (id: string) => void;
  onCompleteOneOff: (id: string) => void;
  onContest: (id: string) => void;
  onWithdraw: (id: string) => void;
}

interface ResolvedAction {
  label: string;
  variant: "primary" | "secondary" | "danger";
  run: () => void;
}

export function TaskDetailSheet(props: Props) {
  const { target } = props;
  const t = useTheme();
  if (!target) return null;

  const isRecurring = target.type === "recurring";
  const name = target.task.name;
  const description = target.task.description ?? null;
  const points = target.task.points;

  // The single, state-appropriate primary action + any read-only status copy.
  const { action, statusLabel, statusTone, metaLine } = resolve(props, target);

  return (
    <MobileModalSheet
      open
      title={name}
      primaryActionLabel={action?.label}
      primaryActionVariant={action?.variant}
      primaryActionDisabled={props.busy}
      secondaryActionLabel="Close"
      onPrimaryAction={action?.run}
      onSecondaryAction={props.onClose}
      onClose={props.onClose}
    >
      <View style={{ gap: t.spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, flexWrap: "wrap" }}>
          <View
            style={{
              paddingVertical: t.spacing.xs,
              paddingHorizontal: t.spacing.sm,
              borderRadius: t.radius.pill,
              borderWidth: t.flags.borderWidth,
              borderColor: t.color.accent,
              backgroundColor: t.color.accentSoft
            }}
          >
            <Text style={{ color: t.color.accentInk, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.bodySmallSize, fontWeight: "700" }}>
              {points} pts
            </Text>
          </View>
          <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySmallSize }}>
            {isRecurring ? cadenceLabel(target.task.cadence, target.task.cadenceMeta) : "One-off chore"}
          </Text>
        </View>

        {description ? (
          <Text style={{ color: t.color.ink, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySize, lineHeight: t.typography.lineHeightBody }}>
            {description}
          </Text>
        ) : null}

        {metaLine ? (
          <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySmallSize }}>
            {metaLine}
          </Text>
        ) : null}

        {statusLabel ? <MobileStatusBadge label={statusLabel} tone={statusTone} /> : null}
      </View>
    </MobileModalSheet>
  );
}

function resolve(props: Props, target: DetailTarget): {
  action: ResolvedAction | null;
  statusLabel: string | null;
  statusTone: "success" | "warning" | "error" | "neutral";
  metaLine: string | null;
} {
  const { profileId } = props;

  if (target.type === "recurring") {
    if (target.completed) {
      return {
        action: { label: "Undo", variant: "secondary", run: () => props.onUndoRecurring(target.task.id) },
        statusLabel: "Done today",
        statusTone: "success",
        metaLine: null
      };
    }
    return {
      action: { label: "Mark done", variant: "primary", run: () => props.onCompleteRecurring(target.task.id) },
      statusLabel: null,
      statusTone: "neutral",
      metaLine: null
    };
  }

  const o: OneOffTask = target.task;
  const poster = target.postedByName ?? "someone";
  const claimer = target.claimedByName ?? "a member";
  const postedLine = `Posted by ${poster}`;

  if (o.status === "open") {
    return {
      action: { label: "Claim", variant: "primary", run: () => props.onClaim(o.id) },
      statusLabel: null,
      statusTone: "neutral",
      metaLine: postedLine
    };
  }

  if (o.status === "claimed") {
    const mine = o.claimedByProfileId === profileId;
    if (mine) {
      return {
        action: { label: "Mark done", variant: "primary", run: () => props.onCompleteOneOff(o.id) },
        statusLabel: "You claimed this",
        statusTone: "success",
        metaLine: postedLine
      };
    }
    return {
      action: null,
      statusLabel: `${claimer} is on it`,
      statusTone: "neutral",
      metaLine: postedLine
    };
  }

  if (o.status === "completed" && o.settleAt && new Date(o.settleAt).getTime() > Date.now()) {
    const mine = o.completedByProfileId === profileId;
    const countdown = `Settles in ${hoursUntil(o.settleAt)}h`;
    if (mine) {
      return { action: null, statusLabel: countdown, statusTone: "warning", metaLine: postedLine };
    }
    return {
      action: { label: "Contest", variant: "danger", run: () => props.onContest(o.id) },
      statusLabel: countdown,
      statusTone: "warning",
      metaLine: postedLine
    };
  }

  if (o.status === "contested") {
    const mine = o.contestedByProfileId === profileId;
    if (mine) {
      return {
        action: { label: "Withdraw contest", variant: "secondary", run: () => props.onWithdraw(o.id) },
        statusLabel: "You contested this",
        statusTone: "error",
        metaLine: postedLine
      };
    }
    return { action: null, statusLabel: "Contested, under review", statusTone: "error", metaLine: postedLine };
  }

  if (o.status === "settled") {
    return { action: null, statusLabel: "Settled", statusTone: "success", metaLine: postedLine };
  }
  if (o.status === "reverted") {
    return { action: null, statusLabel: "Reverted", statusTone: "error", metaLine: postedLine };
  }

  return { action: null, statusLabel: null, statusTone: "neutral", metaLine: postedLine };
}
