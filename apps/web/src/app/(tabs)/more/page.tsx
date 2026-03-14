"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WebButton, WebCard } from "@hiro/ui-primitives/web";
import { signOut } from "../../../lib/authService";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";
import { tokens } from "@hiro/ui-tokens";

export default function MorePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user?.email) setEmail(data.user.email);
      });
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/auth/sign-in");
  }

  return (
    <div style={{ padding: tokens.spacing.lg, display: "grid", gap: tokens.spacing.md }}>
      <WebCard title="Account" description={email ?? "Loading…"}>
        <WebButton
          label="Sign out"
          variant="danger"
          onPress={() => void handleSignOut()}
        />
      </WebCard>
    </div>
  );
}
