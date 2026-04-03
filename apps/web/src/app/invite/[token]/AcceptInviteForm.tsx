"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { WebButton } from "@hiro/ui-primitives/web";
import { acceptInvite } from "../../../lib/inviteService";
import { tokens } from "@hiro/ui-tokens";

interface Props {
  token: string;
  isAuthenticated: boolean;
}

export function AcceptInviteForm({ token, isAuthenticated }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    setLoading(true);
    const { error: acceptError } = await acceptInvite(token);
    setLoading(false);
    if (acceptError) {
      setError(acceptError);
      return;
    }
    router.push("/home");
  }

  return (
    <div style={{ display: "grid", gap: tokens.spacing.md }}>
      <WebButton
        label="Accept invite"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Joining…"
        onPress={() => void handleAccept()}
      />
      {error && (
        <p
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySmallSize,
            color: tokens.color.error,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
