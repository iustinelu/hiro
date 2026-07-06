import React from "react";
import { View } from "react-native";
import type { HouseholdActivity, OneOffTask, RecurringTask } from "@hiro/domain";
import { MobileEmptyStatePanel, MobileTaskRow, useTheme } from "@hiro/ui-primitives/mobile";
import type { BacklogTask } from "../../lib/oneOffService";
import { cadenceLabel } from "../../lib/taskService";
import { SectionHeader } from "./SectionHeader";
import { DoneTodaySection } from "./DoneTodaySection";

export function BoardView({
  todayPending,
  upForGrabs,
  doneEvents,
  oneOffsById,
  profileId,
  busyId,
  onToggleComplete,
  onOpenRecurring,
  onOpenOneOff,
  onOpenDoneOneOff
}: {
  todayPending: RecurringTask[];
  upForGrabs: BacklogTask[];
  doneEvents: HouseholdActivity[];
  oneOffsById: Map<string, OneOffTask>;
  profileId: string | null;
  busyId: string | null;
  onToggleComplete: (taskId: string) => void;
  onOpenRecurring: (task: RecurringTask, completed: boolean) => void;
  onOpenOneOff: (task: BacklogTask) => void;
  onOpenDoneOneOff: (task: OneOffTask) => void;
}) {
  const t = useTheme();

  return (
    <View style={{ gap: t.spacing.sm }}>
      {/* ── Today ─────────────────────────────────────────────────────────── */}
      <SectionHeader label="Today" count={todayPending.length} />
      {todayPending.length === 0 ? (
        <MobileEmptyStatePanel
          variant="inline"
          icon="check"
          title="Nothing due today"
          description="You're all caught up. Grab something from Up for grabs to earn more."
        />
      ) : (
        todayPending.map((task) => (
          <MobileTaskRow
            key={task.id}
            title={task.name}
            meta={cadenceLabel(task.cadence, task.cadenceMeta)}
            points={task.points}
            leading={{ kind: "checkbox", onToggle: () => onToggleComplete(task.id), busy: busyId === task.id }}
            onPress={() => onOpenRecurring(task, false)}
          />
        ))
      )}

      {/* ── Anytime (HIR-84 fills this) ───────────────────────────────────── */}
      {/* Intentionally renders nothing until the Anytime pool ships in brief 02. */}

      {/* ── Up for grabs ──────────────────────────────────────────────────── */}
      <SectionHeader label="Up for grabs" count={upForGrabs.length} />
      {upForGrabs.length === 0 ? (
        <MobileEmptyStatePanel
          variant="inline"
          icon="tasks"
          title="Nothing up for grabs"
          description="Post a one-off chore anyone in the house can claim."
        />
      ) : (
        upForGrabs.map((item) => {
          const claimedByMe = item.status === "claimed" && item.claimedByProfileId === profileId;
          const claimedByOther = item.status === "claimed" && !claimedByMe;
          const meta = claimedByMe
            ? "You claimed this"
            : claimedByOther
              ? `Claimed by ${item.claimedByDisplayName ?? "a member"}`
              : `Posted by ${item.postedByDisplayName ?? "someone"}`;
          const leading = item.status === "claimed"
            ? ({ kind: "avatar", name: (claimedByMe ? "You" : item.claimedByDisplayName) ?? "Member", highlighted: claimedByMe } as const)
            : ({ kind: "glyph", icon: "tasks" } as const);
          return (
            <MobileTaskRow
              key={item.id}
              title={item.name}
              meta={meta}
              points={item.points}
              leading={leading}
              onPress={() => onOpenOneOff(item)}
            />
          );
        })
      )}

      {/* ── Done today ────────────────────────────────────────────────────── */}
      <SectionHeader label="Done today" count={doneEvents.length} />
      <DoneTodaySection events={doneEvents} oneOffsById={oneOffsById} onSelectOneOff={onOpenDoneOneOff} />
    </View>
  );
}
