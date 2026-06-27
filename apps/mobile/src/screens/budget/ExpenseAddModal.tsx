import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import {
  MobileModalSheet,
  MobileInput,
  MobileInteractiveChip,
  useTheme,
} from "@hiro/ui-primitives/mobile";
import type { HouseholdMemberWithProfile } from "@hiro/domain";

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

export function ExpenseAddModal({
  open,
  members,
  currentProfileId,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr);
  const [payerProfileId, setPayerProfileId] = useState(currentProfileId);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const t = useTheme();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setAmount("");
      setDate(todayStr());
      setPayerProfileId(currentProfileId);
      setParticipantIds(members.map((m) => m.profileId));
      setSaving(false);
      setError(null);
    }
  }, [open, currentProfileId, members]);

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const parsedAmount = parseFloat(amount);
  const isValid =
    title.trim().length > 0 &&
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    participantIds.length > 0;

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(title.trim(), parsedAmount, date, payerProfileId, participantIds);
      onClose();
    } catch {
      setError("Couldn't save this expense. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileModalSheet
      open={open}
      title="Add Expense"
      primaryActionLabel={saving ? "Saving…" : "Save"}
      secondaryActionLabel="Cancel"
      onPrimaryAction={() => void handleSave()}
      onSecondaryAction={onClose}
      onClose={onClose}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 420 }}
        contentContainerStyle={{ gap: t.spacing.md }}
      >
        {error && (
          <Text
            style={{
              color: t.color.error,
              fontFamily: t.typography.fontFamily,
              fontSize: t.typography.bodySmallSize,
            }}
          >
            {error}
          </Text>
        )}
        <MobileInput
          label="Title"
          placeholder="e.g. Groceries"
          value={title}
          onChangeText={setTitle}
        />
        <MobileInput
          label="Amount"
          placeholder="0.00"
          value={amount}
          keyboardType="decimal-pad"
          onChangeText={setAmount}
        />
        <MobileInput
          label="Date (YYYY-MM-DD)"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <View style={{ gap: t.spacing.sm }}>
          <Text
            style={{
              color: t.color.inkMuted,
              fontFamily: t.typography.fontFamily,
              fontSize: t.typography.labelSize,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            Who paid?
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.sm }}>
            {members.map((m) => (
              <MobileInteractiveChip
                key={m.profileId}
                label={m.profile.displayName ?? "Unknown"}
                active={payerProfileId === m.profileId}
                onPress={() => setPayerProfileId(m.profileId)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <Text
            style={{
              color: t.color.inkMuted,
              fontFamily: t.typography.fontFamily,
              fontSize: t.typography.labelSize,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            Split between
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.sm }}>
            {members.map((m) => (
              <MobileInteractiveChip
                key={m.profileId}
                label={m.profile.displayName ?? "Unknown"}
                active={participantIds.includes(m.profileId)}
                onPress={() => toggleParticipant(m.profileId)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </MobileModalSheet>
  );
}
