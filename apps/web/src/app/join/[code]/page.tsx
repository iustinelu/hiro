import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { tokens } from "@hiro/ui-tokens";
import { cssColor, cssShadow, cssRadius, cssFontFamily } from "@hiro/ui-primitives/web";

interface Props {
  params: Promise<{ code: string }>;
}

// Placeholder store URLs — the founder replaces these once the listings are live.
// TODO: real store URLs
const APP_STORE_URL = "https://apps.apple.com/app/hiro";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.behiro.app";

interface HouseholdByCode {
  household_name: string;
  member_count: number;
  is_valid: boolean;
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params;
  const supabase = await createSupabaseServerClient();

  // Anon-callable RPC (SECURITY DEFINER); returns 0+ rows.
  const { data, error } = await supabase.rpc("get_household_by_code", {
    p_code: code,
  });

  const household: HouseholdByCode | null =
    data && Array.isArray(data) && data.length > 0 ? (data[0] as HouseholdByCode) : null;

  if (error || !household || !household.is_valid) {
    return (
      <Wrapper>
        <h1 style={headingStyle}>This invite link isn&apos;t active</h1>
        <p style={bodyStyle}>
          It may have been turned off or expired. Ask the household owner to share a fresh link.
        </p>
      </Wrapper>
    );
  }

  const memberLabel = `${household.member_count} ${household.member_count === 1 ? "member" : "members"}`;

  return (
    <Wrapper>
      <h1 style={headingStyle}>
        Join {household.household_name} on Hiro
      </h1>
      <p style={bodyStyle}>{memberLabel}</p>

      <div style={{ display: "grid", gap: tokens.spacing.md, marginTop: tokens.spacing.lg }}>
        <a href={`hiro://join/${code}`} style={primaryButtonStyle}>
          Open in Hiro app
        </a>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={secondaryButtonStyle}
        >
          Download on the App Store
        </a>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={secondaryButtonStyle}
        >
          Get it on Google Play
        </a>
      </div>
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
            background: cssColor("surface"),
            border: `1px solid ${cssColor("border")}`,
            borderRadius: cssRadius.xl,
            boxShadow: `${cssShadow.mid}, 0 0 60px ${cssColor("accentSoft")}`,
            padding: tokens.spacing.xxl,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: tokens.spacing.xxl,
              fontFamily: cssFontFamily.mono,
              letterSpacing: "0.3em",
              fontSize: tokens.typography.bodySmallSize,
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: cssColor("accent"), marginRight: "0.4em" }}>●</span>
            <span style={{ color: cssColor("ink") }}>HIRO</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: cssFontFamily.default,
  fontSize: tokens.typography.titleSize,
  fontWeight: 700,
  color: cssColor("ink"),
};

const bodyStyle: React.CSSProperties = {
  margin: `${tokens.spacing.md}px 0 0`,
  fontFamily: cssFontFamily.default,
  fontSize: tokens.typography.bodySize,
  color: cssColor("inkMuted"),
  lineHeight: 1.5,
};

const buttonBaseStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "center",
  textDecoration: "none",
  borderRadius: cssRadius.lg,
  padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
  fontFamily: cssFontFamily.default,
  fontSize: tokens.typography.bodySmallSize,
  fontWeight: 800,
  letterSpacing: 0.2,
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  background: `linear-gradient(90deg, ${cssColor("accent")} 0%, ${cssColor("accentStrong")} 100%)`,
  color: cssColor("accentInk"),
  border: `1px solid ${cssColor("accent")}`,
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  background: "transparent",
  color: cssColor("ink"),
  border: `1px solid ${cssColor("border")}`,
};
