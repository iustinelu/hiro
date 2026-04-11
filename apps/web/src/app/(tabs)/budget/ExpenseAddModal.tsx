"use client";

import { useState, useEffect } from "react";
import { WebModalSheet, WebInput, WebInteractiveChip } from "@hiro/ui-primitives/web";
import type { HouseholdMemberWithProfile } from "@hiro/domain";
import styles from "./budget.module.css";

interface Props {
  open: boolean;
  members: HouseholdMemberWithProfile[];
  currentProfileId: string;
  onClose: () => void;
  onSave: (
    title: string,
    amount: number,
    date: string,
    payerProfileId: string,
    participantIds: string[]
  ) => Promise<void>;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ExpenseAddModal({ open, members, currentProfileId, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr);
  const [payerProfileId, setPayerProfileId] = useState(currentProfileId);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setAmount("");
      setDate(todayStr());
      setPayerProfileId(currentProfileId);
      setParticipantIds(members.map((m) => m.profileId));
      setSaving(false);
    }
  }, [open, currentProfileId, members]);

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const isValid =
    title.trim().length > 0 &&
    parseFloat(amount) > 0 &&
    !isNaN(parseFloat(amount)) &&
    participantIds.length > 0;

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    await onSave(title.trim(), parseFloat(amount), date, payerProfileId, participantIds);
    setSaving(false);
  };

  return (
    <WebModalSheet
      open={open}
      title="Add Expense"
      primaryActionLabel={saving ? "Saving..." : "Save"}
      secondaryActionLabel="Cancel"
      onPrimaryAction={handleSave}
      onSecondaryAction={onClose}
      onClose={onClose}
    >
      <div className={styles.formFields}>
        <WebInput
          label="Title"
          placeholder="e.g. Groceries"
          value={title}
          onChangeText={setTitle}
        />
        <WebInput
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
        />
        <WebInput
          label="Date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <div>
          <div className={styles.fieldLabel}>Who paid?</div>
          <div className={styles.chipRow}>
            {members.map((m) => (
              <WebInteractiveChip
                key={m.profileId}
                label={m.profile.displayName ?? "Unknown"}
                active={payerProfileId === m.profileId}
                onPress={() => setPayerProfileId(m.profileId)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className={styles.fieldLabel}>Split between</div>
          <div className={styles.chipRow}>
            {members.map((m) => (
              <WebInteractiveChip
                key={m.profileId}
                label={m.profile.displayName ?? "Unknown"}
                active={participantIds.includes(m.profileId)}
                onPress={() => toggleParticipant(m.profileId)}
              />
            ))}
          </div>
        </div>
      </div>
    </WebModalSheet>
  );
}
