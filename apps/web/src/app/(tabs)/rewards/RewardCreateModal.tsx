"use client";

import { useState, useEffect } from "react";
import { WebModalSheet, WebInput } from "@hiro/ui-primitives/web";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, pointCost: number) => Promise<void>;
}

export function RewardCreateModal({ open, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [pointCost, setPointCost] = useState("10");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setPointCost("10");
      setError(null);
    }
  }, [open]);

  async function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) { setError("Reward name is required."); return; }
    const cost = parseInt(pointCost, 10);
    if (!cost || cost < 1) { setError("Point cost must be at least 1."); return; }

    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed, cost);
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
      title="New Reward"
      primaryActionLabel={saving ? "Saving..." : "Save"}
      secondaryActionLabel="Cancel"
      onPrimaryAction={handleSave}
      onSecondaryAction={onClose}
      onClose={onClose}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <WebInput
          label="Reward Name"
          placeholder="e.g. Movie Night"
          value={title}
          onChangeText={setTitle}
          state={error && !title.trim() ? "error" : "default"}
        />
        <WebInput
          label="Point Cost"
          placeholder="10"
          value={pointCost}
          onChangeText={(v) => setPointCost(v.replace(/\D/g, ""))}
          state={error && (!parseInt(pointCost, 10) || parseInt(pointCost, 10) < 1) ? "error" : "default"}
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
