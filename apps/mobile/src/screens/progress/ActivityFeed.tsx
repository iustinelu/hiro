import React from "react";
import { Text, View } from "react-native";
import type { HouseholdActivity, OneOffTask } from "@hiro/domain";
import { MobileButton, MobileCard, MobileStatusBadge, useTheme } from "@hiro/ui-primitives/mobile";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function metaString(event: HouseholdActivity, key: string): string {
  const v = event.metadata?.[key];
  return typeof v === "string" ? v : "";
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function hoursUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 3600000));
}

function describe(event: HouseholdActivity): string {
  const actor = event.actorDisplayName ?? "Someone";
  const name = metaString(event, "task_name");
  switch (event.kind) {
    case "task_completed": return `${actor} completed “${name}”`;
    case "one_off_posted": return `${actor} posted “${name}” up for grabs`;
    case "one_off_logged": return `${actor} logged “${name}”`;
    case "one_off_claimed": return `${actor} claimed “${name}”`;
    case "one_off_completed": return `${actor} completed “${name}”`;
    case "one_off_contested": return `${actor} contested “${name}”`;
    case "one_off_contest_withdrawn": return `${actor} withdrew the contest on “${name}”`;
    case "one_off_settled": return `“${name}” settled`;
    case "one_off_reverted": return `“${name}” was reverted`;
    case "reward_redeemed": return `${actor} redeemed “${metaString(event, "reward_title")}”`;
    case "member_joined": return `${actor} joined the household`;
    case "member_left": return `${actor} left ${metaString(event, "household_name") || "the household"}`;
    default: return actor;
  }
}

/* ─── Feed ────────────────────────────────────────────────────────────────── */

export function ActivityFeed({ events, oneOffsById, profileId, busyId, onContest, onWithdraw }: {
  events: HouseholdActivity[];
  oneOffsById: Map<string, OneOffTask>;
  profileId: string | null;
  busyId: string | null;
  onContest: (taskId: string) => void;
  onWithdraw: (taskId: string) => void;
}) {
  const t = useTheme();

  if (events.length === 0) {
    return (
      <MobileCard>
        <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySmallSize }}>
          No household activity yet. Completing tasks, claims, and contests will show up here.
        </Text>
      </MobileCard>
    );
  }

  return (
    <MobileCard title="Activity">
      <View style={{ gap: t.spacing.md }}>
        {events.map((event) => {
          // The "done" events (logged / completed) anchor the live contest/settle
          // controls, since each task has exactly one of them.
          const isDoneEvent = event.kind === "one_off_logged" || event.kind === "one_off_completed";
          const live = isDoneEvent && event.refId ? oneOffsById.get(event.refId) : undefined;

          const canContest =
            !!live && live.status === "completed" && !!live.settleAt &&
            new Date(live.settleAt).getTime() > Date.now() &&
            live.completedByProfileId !== profileId;
          const canWithdraw =
            !!live && live.status === "contested" && live.contestedByProfileId === profileId;

          const busy = !!live && busyId === live.id;
          const delta = event.pointsDelta;

          return (
            <View key={event.id} style={{ gap: t.spacing.xs }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: t.spacing.sm }}>
                <Text style={{ flex: 1, color: t.color.ink, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySize }}>
                  {describe(event)}
                </Text>
                {typeof delta === "number" && delta !== 0 && (
                  <Text style={{ color: delta > 0 ? t.color.success : t.color.inkMuted, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.labelSize, fontWeight: "700" }}>
                    {delta > 0 ? `+${delta}` : delta} pts
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, flexWrap: "wrap" }}>
                <Text style={{ color: t.color.inkSoft, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.labelSize }}>
                  {relativeTime(event.createdAt)}
                </Text>

                {live?.status === "completed" && !!live.settleAt && new Date(live.settleAt).getTime() > Date.now() && (
                  <MobileStatusBadge label={`Pending • settles in ${hoursUntil(live.settleAt)}h`} tone="warning" />
                )}
                {live?.status === "contested" && <MobileStatusBadge label="Contested" tone="error" />}
                {live?.status === "reverted" && <MobileStatusBadge label="Reverted" tone="error" />}

                {canContest && live && (
                  <MobileButton label={busy ? "…" : "Contest"} variant="secondary" size="sm" disabled={busy} onPress={() => onContest(live.id)} />
                )}
                {canWithdraw && live && (
                  <MobileButton label={busy ? "…" : "Withdraw"} variant="ghost" size="sm" disabled={busy} onPress={() => onWithdraw(live.id)} />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </MobileCard>
  );
}
