import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { AcceptInviteForm } from "./AcceptInviteForm";
import { tokens } from "@hiro/ui-tokens";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch invite details (works for anon via SECURITY DEFINER RPC)
  const { data, error } = await supabase.rpc("get_invite_by_token", {
    p_token: token,
  });

  const invite = data && Array.isArray(data) && data.length > 0 ? data[0] : null;

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (error || !invite) {
    return (
      <Wrapper>
        <h1 style={headingStyle}>Invite not found</h1>
        <p style={bodyStyle}>This invite link is invalid or has been removed.</p>
      </Wrapper>
    );
  }

  if (invite.status === "expired") {
    return (
      <Wrapper>
        <h1 style={headingStyle}>Invite expired</h1>
        <p style={bodyStyle}>
          This invite to <strong>{invite.household_name}</strong> has expired.
          Ask the household owner to send a new one.
        </p>
      </Wrapper>
    );
  }

  if (invite.status === "accepted") {
    return (
      <Wrapper>
        <h1 style={headingStyle}>Already accepted</h1>
        <p style={bodyStyle}>
          This invite to <strong>{invite.household_name}</strong> has already been used.
        </p>
      </Wrapper>
    );
  }

  // Pending invite — the AcceptInviteForm handles all edge cases
  // (already a member, already in another household, etc.) via RPC errors
  return (
    <Wrapper>
      <h1 style={headingStyle}>You&apos;re invited</h1>
      <p style={bodyStyle}>
        {invite.inviter_name ?? "Someone"} invited you to join{" "}
        <strong>{invite.household_name}</strong>.
      </p>
      <AcceptInviteForm token={token} isAuthenticated={!!user} />
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div
          style={{
            background: tokens.color.surface,
            border: `1px solid ${tokens.color.border}`,
            borderRadius: tokens.radius.xl,
            boxShadow: `${tokens.elevation.mid}, 0 0 60px ${tokens.color.accentSoft}`,
            padding: tokens.spacing.xxl,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: tokens.spacing.xxl,
              fontFamily: tokens.typography.fontFamilyMono,
              letterSpacing: "0.3em",
              fontSize: tokens.typography.bodySmallSize,
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: tokens.color.accent, marginRight: "0.4em" }}>●</span>
            <span style={{ color: tokens.color.ink }}>HIRO</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: tokens.typography.fontFamily,
  fontSize: tokens.typography.titleSize,
  fontWeight: 700,
  color: tokens.color.ink,
};

const bodyStyle: React.CSSProperties = {
  margin: `${tokens.spacing.md} 0`,
  fontFamily: tokens.typography.fontFamily,
  fontSize: tokens.typography.bodySize,
  color: tokens.color.inkMuted,
  lineHeight: 1.5,
};
