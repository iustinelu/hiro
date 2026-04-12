"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { WebButton } from "@hiro/ui-primitives/web";
import { acceptInvite, acceptInviteAndLeave } from "../../../lib/inviteService";
import { getMyHousehold } from "../../../lib/householdService";
import { tokens } from "@hiro/ui-tokens";

interface Props {
  token: string;
  isAuthenticated: boolean;
}

type FormState =
  | { phase: "idle"; error?: string }
  | { phase: "loading" }
  | { phase: "confirming"; householdName: string }
  | { phase: "switching" };

export function AcceptInviteForm({ token, isAuthenticated }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<FormState>({ phase: "idle" });

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(pathname);
    return (
      <div style={{ display: "grid", gap: tokens.spacing.md }}>
        <Link href={`/auth/sign-in?redirect=${redirect}`}>
          <WebButton label="Sign in to accept" variant="primary" fullWidth />
        </Link>
        <Link href={`/auth/sign-up?redirect=${redirect}`}>
          <WebButton label="Create account" variant="secondary" fullWidth />
        </Link>
      </div>
    );
  }

  async function handleAccept() {
    setState({ phase: "loading" });
    const { error } = await acceptInvite(token);
    if (!error) {
      router.push("/home");
      return;
    }
    if (error.includes("another household")) {
      const { household } = await getMyHousehold();
      setState({ phase: "confirming", householdName: household?.name ?? "your current household" });
      return;
    }
    setState({ phase: "idle", error });
  }

  async function handleConfirm() {
    setState({ phase: "switching" });
    const { oldHouseholdDeleted, oldHouseholdName, error } = await acceptInviteAndLeave(token);
    if (error) {
      setState({ phase: "idle", error });
      return;
    }
    if (oldHouseholdDeleted && oldHouseholdName) {
      // Brief notice before navigating — no toast infrastructure yet
      setState({ phase: "idle", error: `"${oldHouseholdName}" had no remaining members and was dissolved.` });
      setTimeout(() => router.push("/home"), 2500);
      return;
    }
    router.push("/home");
  }

  if (state.phase === "confirming") {
    return (
      <div style={{ display: "grid", gap: tokens.spacing.md }}>
        <div
          style={{
            padding: tokens.spacing.md,
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.color.warning}`,
            background: tokens.color.warningSoft ?? "transparent",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.bodySize,
              color: tokens.color.warning,
              fontWeight: 600,
            }}
          >
            You&apos;ll leave {state.householdName}
          </p>
          <p
            style={{
              margin: `${tokens.spacing.xs} 0 0`,
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.bodySmallSize,
              color: tokens.color.inkMuted,
              lineHeight: 1.5,
            }}
          >
            If you&apos;re the last member, {state.householdName} will be permanently deleted.
          </p>
        </div>
        <WebButton
          label="Accept and switch household"
          variant="primary"
          fullWidth
          onPress={() => void handleConfirm()}
        />
        <WebButton
          label="Cancel"
          variant="secondary"
          fullWidth
          onPress={() => setState({ phase: "idle" })}
        />
      </div>
    );
  }

  if (state.phase === "switching") {
    return (
      <div style={{ display: "grid", gap: tokens.spacing.md }}>
        <WebButton
          label="Accept and switch household"
          variant="primary"
          fullWidth
          loading
          loadingLabel="Switching…"
        />
      </div>
    );
  }

  const isDissolvedNotice = state.phase === "idle" && state.error?.includes("dissolved");

  return (
    <div style={{ display: "grid", gap: tokens.spacing.md }}>
      {!isDissolvedNotice && (
        <WebButton
          label="Accept invite"
          variant="primary"
          fullWidth
          loading={state.phase === "loading"}
          loadingLabel="Joining…"
          onPress={() => void handleAccept()}
        />
      )}
      {state.phase === "idle" && state.error && (
        <p
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySmallSize,
            color: isDissolvedNotice ? tokens.color.inkMuted : tokens.color.error,
            lineHeight: 1.5,
          }}
        >
          {state.error}
          {isDissolvedNotice && " Redirecting to your new household…"}
        </p>
      )}
    </div>
  );
}
