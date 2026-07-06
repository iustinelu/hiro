import React from "react";
import { View } from "react-native";
import type { HouseholdActivity, OneOffTask } from "@hiro/domain";
import { MobileEmptyStatePanel, MobileTaskRow } from "@hiro/ui-primitives/mobile";
import { relativeTime } from "../../lib/relativeTime";

/* Activity kinds that represent "someone finished a chore today". Recurring
 * completions plus one-off done/logged events. Settlement/revert are excluded so
 * each finished chore shows once. HIR-85 expands this into the full done log. */
const DONE_KINDS: ReadonlySet<HouseholdActivity["kind"]> = new Set([
  "task_completed",
  "one_off_completed",
  "one_off_logged"
]);

export function isDoneTodayEvent(event: HouseholdActivity): boolean {
  if (!DONE_KINDS.has(event.kind)) return false;
  const created = new Date(event.createdAt);
  const now = new Date();
  return (
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth() &&
    created.getDate() === now.getDate()
  );
}

function metaString(event: HouseholdActivity, key: string): string {
  const v = event.metadata?.[key];
  return typeof v === "string" ? v : "";
}

/**
 * Minimal v1 of the "Done today" board section: one row per completion, showing
 * who did it, when, and the points. Tapping a one-off row (which may still be in
 * its settle/contest window) opens the detail sheet via onSelectOneOff.
 */
export function DoneTodaySection({ events, oneOffsById, onSelectOneOff }: {
  events: HouseholdActivity[];
  oneOffsById: Map<string, OneOffTask>;
  onSelectOneOff: (task: OneOffTask) => void;
}) {
  if (events.length === 0) {
    return (
      <MobileEmptyStatePanel
        variant="inline"
        icon="check"
        title="Nothing done yet today"
        description="Complete a task to kick off the day and rack up points."
      />
    );
  }

  return (
    <View style={{ gap: 8 }}>
      {events.map((event) => {
        const actor = event.actorDisplayName ?? "Someone";
        const name = metaString(event, "task_name") || "a chore";
        const delta = event.pointsDelta;
        const live = event.refId ? oneOffsById.get(event.refId) : undefined;
        const tappable = !!live;
        return (
          <MobileTaskRow
            key={event.id}
            title={name}
            meta={`${actor} • ${relativeTime(event.createdAt)}`}
            points={typeof delta === "number" && delta > 0 ? delta : undefined}
            leading={{ kind: "avatar", name: actor }}
            completed
            onPress={tappable && live ? () => onSelectOneOff(live) : undefined}
          />
        );
      })}
    </View>
  );
}
