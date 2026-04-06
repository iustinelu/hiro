"use client";

import { useState, useEffect } from "react";
import type { RecurringTask, TaskCadence, CadenceMeta } from "@hiro/domain";
import { WebModalSheet, WebInput, WebInteractiveChip, WebDayChip } from "@hiro/ui-primitives/web";
import styles from "./tasks.module.css";

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

interface Props {
  open: boolean;
  editingTask: RecurringTask | null;
  onClose: () => void;
  onSave: (name: string, points: number, cadence: TaskCadence, cadenceMeta: CadenceMeta, description: string | null) => Promise<void>;
  onUpdate: (taskId: string, updates: { name?: string; points?: number; cadence?: TaskCadence; cadenceMeta?: CadenceMeta; description?: string | null }) => Promise<void>;
}

export function TaskCreateModal({ open, editingTask, onClose, onSave, onUpdate }: Props) {
  const [name, setName] = useState("");
  const [points, setPoints] = useState("5");
  const [cadence, setCadence] = useState<TaskCadence>("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = editingTask !== null;

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
    if ((cadence === "weekly" || cadence === "custom") && selectedDays.length === 0) {
      setError("Select at least one day."); return;
    }

    setSaving(true);
    setError(null);

    try {
      const meta = buildCadenceMeta();
      if (isEdit && editingTask) {
        await onUpdate(editingTask.id, { name: trimmed, points: pts, cadence, cadenceMeta: meta, description: description.trim() || null });
      } else {
        await onSave(trimmed, pts, cadence, meta, description.trim() || null);
      }
      onClose();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WebModalSheet
      open={open}
      title={isEdit ? "Edit Task" : "New Task"}
      primaryActionLabel={saving ? "Saving..." : isEdit ? "Update" : "Save"}
      secondaryActionLabel="Cancel"
      onPrimaryAction={handleSave}
      onSecondaryAction={onClose}
      onClose={onClose}
    >
      <div className={styles.formFields}>
        <WebInput
          label="Task Name"
          placeholder="e.g. Vacuum living room"
          value={name}
          onChangeText={setName}
          state={error && !name.trim() ? "error" : "default"}
        />

        <WebInput
          label="Points"
          placeholder="5"
          value={points}
          onChangeText={(v) => setPoints(v.replace(/\D/g, ""))}
          state={error && (!parseInt(points, 10) || parseInt(points, 10) < 1) ? "error" : "default"}
        />

        <div>
          <span className={styles.fieldLabel}>Cadence</span>
          <div className={styles.cadenceRow}>
            {(["daily", "weekly", "custom"] as const).map((c) => (
              <WebInteractiveChip
                key={c}
                label={c === "daily" ? "Daily" : c === "weekly" ? "Weekly" : "Custom"}
                active={cadence === c}
                onPress={() => { setCadence(c); setSelectedDays([]); }}
              />
            ))}
          </div>
        </div>

        {(cadence === "weekly" || cadence === "custom") && (
          <div>
            <span className={styles.fieldLabel}>
              {cadence === "weekly" ? "Pick a day" : "Pick days"}
            </span>
            <div className={styles.dayChips}>
              {DAYS.map((d) => (
                <WebDayChip
                  key={d.key}
                  label={d.label}
                  active={selectedDays.includes(d.key)}
                  onPress={() => toggleDay(d.key)}
                />
              ))}
            </div>
          </div>
        )}

        <WebInput
          label="Description (optional)"
          placeholder="Add details..."
          value={description}
          onChangeText={setDescription}
        />

        {error && (
          <span style={{ color: "var(--hiro-color-accent)", fontSize: 13, fontWeight: 600 }}>
            {error}
          </span>
        )}
      </div>
    </WebModalSheet>
  );
}
