import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import type { RecurringTask, TaskCadence, CadenceMeta, OneOffTaskKind } from "@hiro/domain";
import {
  MobileModalSheet,
  MobileInput,
  MobileInteractiveChip,
  useTheme,
} from "@hiro/ui-primitives/mobile";

const DAYS = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
] as const;

const DAY_FULL: Record<string, string> = {
  mon: "monday", tue: "tuesday", wed: "wednesday",
  thu: "thursday", fri: "friday", sat: "saturday", sun: "sunday",
};

type TaskType = "recurring" | "oneoff";

interface Props {
  open: boolean;
  editingTask: RecurringTask | null;
  onClose: () => void;
  onSave: (name: string, points: number, cadence: TaskCadence, cadenceMeta: CadenceMeta, description: string | null) => Promise<void>;
  onUpdate: (taskId: string, updates: { name?: string; points?: number; cadence?: TaskCadence; cadenceMeta?: CadenceMeta; description?: string | null }) => Promise<void>;
  // When provided, the modal offers a Recurring / One-off toggle. One-off tasks
  // are either posted to the claimable backlog or logged as already-done.
  onCreateOneOff?: (name: string, points: number, kind: OneOffTaskKind, description: string | null) => Promise<void>;
}

export function TaskCreateModal({ open, editingTask, onClose, onSave, onUpdate, onCreateOneOff }: Props) {
  const t = useTheme();
  const [name, setName] = useState("");
  const [points, setPoints] = useState("5");
  const [cadence, setCadence] = useState<TaskCadence>("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("recurring");
  const [oneOffKind, setOneOffKind] = useState<OneOffTaskKind>("backlog");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = editingTask !== null;
  // Editing is recurring-only; the type toggle only appears when creating and a
  // one-off handler is wired in.
  const canChooseType = !isEdit && !!onCreateOneOff;
  const isOneOff = canChooseType && taskType === "oneoff";

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setPoints(String(editingTask.points));
      setCadence(editingTask.cadence);
      setDescription(editingTask.description ?? "");
      if (editingTask.cadence === "weekly" && editingTask.cadenceMeta.day) {
        const short = Object.entries(DAY_FULL).find(([, v]) => v === editingTask.cadenceMeta.day)?.[0];
        setSelectedDays(short ? [short] : []);
      } else if (editingTask.cadence === "custom") {
        setSelectedDays(editingTask.cadenceMeta.days ?? []);
      } else {
        setSelectedDays([]);
      }
    } else {
      setName(""); setPoints("5"); setCadence("daily");
      setSelectedDays([]); setDescription("");
      setTaskType("recurring"); setOneOffKind("backlog");
    }
    setError(null);
  }, [editingTask, open]);

  function toggleDay(day: string) {
    if (cadence === "weekly") {
      setSelectedDays([day]);
    } else {
      setSelectedDays((prev) =>
        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      );
    }
  }

  function buildCadenceMeta(): CadenceMeta {
    if (cadence === "daily") return {};
    if (cadence === "weekly") return { day: DAY_FULL[selectedDays[0]] ?? "monday" };
    return { days: selectedDays };
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Task name is required."); return; }
    const pts = parseInt(points, 10);
    if (!pts || pts < 1) { setError("Points must be at least 1."); return; }
    if (!isOneOff && (cadence === "weekly" || cadence === "custom") && selectedDays.length === 0) {
      setError("Select at least one day."); return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isOneOff && onCreateOneOff) {
        await onCreateOneOff(trimmed, pts, oneOffKind, description.trim() || null);
      } else if (isEdit && editingTask) {
        await onUpdate(editingTask.id, { name: trimmed, points: pts, cadence, cadenceMeta: buildCadenceMeta(), description: description.trim() || null });
      } else {
        await onSave(trimmed, pts, cadence, buildCadenceMeta(), description.trim() || null);
      }
      onClose();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const showDays = !isOneOff && (cadence === "weekly" || cadence === "custom");

  return (
    <MobileModalSheet
      open={open}
      title={isEdit ? "Edit Task" : "New Task"}
      primaryActionLabel={saving ? "Saving…" : isEdit ? "Update" : "Save"}
      secondaryActionLabel="Cancel"
      onPrimaryAction={() => void handleSave()}
      onSecondaryAction={onClose}
      onClose={onClose}
    >
      <View style={{ gap: t.spacing.md }}>
        {canChooseType && (
          <View style={{ gap: t.spacing.sm }}>
            <Text style={fieldLabelStyle(t)}>Type</Text>
            <View style={{ flexDirection: "row", gap: t.spacing.sm, flexWrap: "wrap" }}>
              <MobileInteractiveChip
                label="Recurring"
                active={taskType === "recurring"}
                onPress={() => setTaskType("recurring")}
              />
              <MobileInteractiveChip
                label="One-off"
                active={taskType === "oneoff"}
                onPress={() => setTaskType("oneoff")}
              />
            </View>
          </View>
        )}

        <MobileInput
          label="Task Name"
          placeholder="e.g. Vacuum living room"
          value={name}
          onChangeText={setName}
          state={error && !name.trim() ? "error" : "default"}
        />

        <MobileInput
          label="Points"
          placeholder="5"
          value={points}
          onChangeText={(v) => setPoints(v.replace(/\D/g, ""))}
          state={error && (!parseInt(points, 10) || parseInt(points, 10) < 1) ? "error" : "default"}
        />

        {isOneOff ? (
          <View style={{ gap: t.spacing.sm }}>
            <Text style={fieldLabelStyle(t)}>This task is…</Text>
            <View style={{ flexDirection: "row", gap: t.spacing.sm, flexWrap: "wrap" }}>
              <MobileInteractiveChip
                label="Up for grabs"
                active={oneOffKind === "backlog"}
                onPress={() => setOneOffKind("backlog")}
              />
              <MobileInteractiveChip
                label="I just did this"
                active={oneOffKind === "log"}
                onPress={() => setOneOffKind("log")}
              />
            </View>
            <Text style={hintStyle(t)}>
              {oneOffKind === "backlog"
                ? "Posted to the Backlog for anyone to claim."
                : "Logged as already done — points apply after a 24h contest window."}
            </Text>
          </View>
        ) : (
          <View style={{ gap: t.spacing.sm }}>
            <Text style={fieldLabelStyle(t)}>Cadence</Text>
            <View style={{ flexDirection: "row", gap: t.spacing.sm, flexWrap: "wrap" }}>
              {(["daily", "weekly", "custom"] as const).map((c) => (
                <MobileInteractiveChip
                  key={c}
                  label={c === "daily" ? "Daily" : c === "weekly" ? "Weekly" : "Custom"}
                  active={cadence === c}
                  onPress={() => { setCadence(c); setSelectedDays([]); }}
                />
              ))}
            </View>
          </View>
        )}

        {showDays && (
          <View style={{ gap: t.spacing.sm }}>
            <Text style={fieldLabelStyle(t)}>
              {cadence === "weekly" ? "Pick a day" : "Pick days"}
            </Text>
            <View style={{ flexDirection: "row", gap: t.spacing.xs, flexWrap: "wrap" }}>
              {DAYS.map((d, i) => (
                <MobileInteractiveChip
                  key={`${d.key}-${i}`}
                  label={d.label}
                  active={selectedDays.includes(d.key)}
                  onPress={() => toggleDay(d.key)}
                />
              ))}
            </View>
          </View>
        )}

        <MobileInput
          label="Description (optional)"
          placeholder="Add details…"
          value={description}
          onChangeText={setDescription}
        />

        {error && (
          <Text
            style={{
              color: t.color.accent,
              fontFamily: t.typography.fontFamily,
              fontSize: t.typography.bodySmallSize,
              fontWeight: "600",
            }}
          >
            {error}
          </Text>
        )}
      </View>
    </MobileModalSheet>
  );
}

function fieldLabelStyle(t: ReturnType<typeof useTheme>) {
  return {
    color: t.color.inkMuted,
    fontFamily: t.typography.fontFamily,
    fontSize: t.typography.labelSize,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
  };
}

function hintStyle(t: ReturnType<typeof useTheme>) {
  return {
    color: t.color.inkSoft,
    fontFamily: t.typography.fontFamily,
    fontSize: t.typography.bodySmallSize,
  };
}
