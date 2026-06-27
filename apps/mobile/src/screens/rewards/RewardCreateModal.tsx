import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { MobileModalSheet, MobileInput, useTheme } from "@hiro/ui-primitives/mobile";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, pointCost: number) => Promise<void>;
  /** Pre-fills the point cost when opened (the onboarding tour sets this to the
   * user's balance so the new reward is immediately claimable). Defaults to 10. */
  initialPointCost?: number;
}

export function RewardCreateModal({ open, onClose, onSave, initialPointCost }: Props) {
  const t = useTheme();
  const [title, setTitle] = useState("");
  const [pointCost, setPointCost] = useState("10");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the form only when the sheet opens. `initialPointCost` is intentionally
  // NOT a dep: re-seeding mid-edit (e.g. a realtime balance change) would wipe
  // what the user has typed. The value is read fresh at each open.
  useEffect(() => {
    if (open) {
      setTitle("");
      setPointCost(String(initialPointCost ?? 10));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <MobileModalSheet
      open={open}
      title="New Reward"
      primaryActionLabel={saving ? "Saving…" : "Save"}
      secondaryActionLabel="Cancel"
      onPrimaryAction={() => { void handleSave(); }}
      onSecondaryAction={onClose}
      onClose={onClose}
    >
      <View style={{ gap: t.spacing.md }}>
        <MobileInput
          label="Reward Name"
          placeholder="e.g. Movie Night"
          value={title}
          onChangeText={setTitle}
          state={error && !title.trim() ? "error" : "default"}
          helperText={error && !title.trim() ? error : undefined}
        />
        <MobileInput
          label="Point Cost"
          placeholder="10"
          value={pointCost}
          keyboardType="number-pad"
          onChangeText={(v) => setPointCost(v.replace(/\D/g, ""))}
          state={error && (!parseInt(pointCost, 10) || parseInt(pointCost, 10) < 1) ? "error" : "default"}
          helperText={error && (!parseInt(pointCost, 10) || parseInt(pointCost, 10) < 1) ? error : undefined}
        />
      </View>
    </MobileModalSheet>
  );
}
