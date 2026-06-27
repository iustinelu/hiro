import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileInput, MobileButton, useTheme } from "@hiro/ui-primitives/mobile";
import { tokens, brand } from "@hiro/ui-tokens";
import { resolveSignInFailure, resolveSignUpCollision } from "@hiro/domain";
import {
  signIn,
  signUp,
  signInWithGoogle,
  getAccountMethods,
} from "../../lib/authService";
import { ForgotPasswordView } from "./ForgotPasswordView";

type AuthView = "sign-in" | "sign-up" | "forgot-password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GoogleG = () => (
  <Text style={{ fontSize: 15, fontWeight: "700", color: brand.googleBlue, lineHeight: 18 }}>G</Text>
);

// HIR-71: friendly, non-error guidance banner (e.g. "this email uses Google"); points at the
// Continue with Google button rendered just below it.
const NoticeBanner = ({ message }: { message: string }) => {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.color.bg,
        borderWidth: 1,
        borderColor: t.color.accent,
        borderRadius: t.radius.md,
        padding: tokens.spacing.md,
      }}
    >
      <Text style={{ fontFamily: t.typography.fontFamily, fontSize: tokens.typography.bodySmallSize, color: t.color.ink }}>
        {message}
      </Text>
    </View>
  );
};

const OrDivider = () => {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm }}>
      <View style={{ flex: 1, height: 1, backgroundColor: t.color.border }} />
      <Text style={{ fontFamily: t.typography.fontFamily, fontSize: tokens.typography.bodySmallSize, color: t.color.inkMuted }}>or</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: t.color.border }} />
    </View>
  );
};

function SignInView({ onSwitch }: { onSwitch: (view: AuthView) => void }) {
  const t = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setNotice(null);
    setLoading(true);
    const { error: authError } = await signIn(email, password);
    if (authError) {
      if (/rate.?limit|too many|exceeded/i.test(authError)) {
        setError("Too many sign-in attempts. Please wait a few minutes and try again.");
        setLoading(false);
        return;
      }
      // The email may belong to a Google-only account. Ask the backend which method it uses
      // and guide the user there instead of a generic failure. If the lookup itself fails
      // (null), fall back to a safe generic message rather than "no account found".
      const methods = await getAccountMethods(email);
      if (methods === null) {
        setError("Incorrect email or password. Try again, or reset your password.");
      } else {
        const guidance = resolveSignInFailure(methods);
        if (guidance.highlightGoogle) {
          setNotice(guidance.message);
        } else {
          setError(guidance.message);
        }
      }
    }
    setLoading(false);
    // On success, onAuthStateChange in RootNavigator will update state
  }

  async function handleGoogleSignIn() {
    setError(null);
    setNotice(null);
    setGoogleLoading(true);
    const { error: authError } = await signInWithGoogle();
    setGoogleLoading(false);
    if (authError) setError(authError);
  }

  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Text
        style={{
          fontFamily: t.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: "700",
          color: t.color.ink,
          marginBottom: tokens.spacing.sm,
        }}
      >
        Sign in
      </Text>

      {notice && <NoticeBanner message={notice} />}

      <MobileButton
        label="Continue with Google"
        variant="secondary"
        fullWidth
        loading={googleLoading}
        loadingLabel="Redirecting…"
        iconLeft={<GoogleG />}
        onPress={() => void handleGoogleSignIn()}
      />

      <OrDivider />

      <MobileInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        state={error ? "error" : "default"}
      />
      <MobileInput
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <MobileButton
        label="Sign in"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Signing in…"
        onPress={() => void handleSignIn()}
      />

      <View style={{ gap: tokens.spacing.xs }}>
        <MobileButton
          label="Create an account"
          variant="ghost"
          size="sm"
          onPress={() => onSwitch("sign-up")}
        />
        <MobileButton
          label="Forgot password?"
          variant="ghost"
          size="sm"
          onPress={() => onSwitch("forgot-password")}
        />
      </View>
    </View>
  );
}

function SignUpView({ onSwitch }: { onSwitch: (view: AuthView) => void }) {
  const t = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setNotice(null);
    setGoogleLoading(true);
    const { error: authError } = await signInWithGoogle();
    setGoogleLoading(false);
    if (authError) setError(authError);
  }

  async function handleSignUp() {
    setError(null);
    setNotice(null);
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    // Pre-check for an existing account. Supabase returns an obfuscated fake-success for an
    // already-registered email; the backend lookup lets us route the user to their method.
    // If the lookup fails (null), proceed - Supabase's own guard still applies.
    const methods = await getAccountMethods(email);
    const collision = methods ? resolveSignUpCollision(methods) : null;
    if (collision) {
      setNotice(collision.message);
      setLoading(false);
      return;
    }
    const { error: authError } = await signUp(email, password);
    setLoading(false);
    if (authError) setError(authError);
    // On success, onAuthStateChange in RootNavigator will update state
  }

  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Text
        style={{
          fontFamily: t.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: "700",
          color: t.color.ink,
          marginBottom: tokens.spacing.sm,
        }}
      >
        Create account
      </Text>

      {notice && <NoticeBanner message={notice} />}

      <MobileButton
        label="Continue with Google"
        variant="secondary"
        fullWidth
        loading={googleLoading}
        loadingLabel="Redirecting…"
        iconLeft={<GoogleG />}
        onPress={() => void handleGoogleSignIn()}
      />

      <OrDivider />

      <MobileInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        state={error ? "error" : "default"}
      />
      <MobileInput
        label="Password"
        placeholder="Min. 6 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        state={error ? "error" : "default"}
      />
      <MobileInput
        label="Confirm password"
        placeholder="Re-enter password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <MobileButton
        label="Create account"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Creating account…"
        onPress={() => void handleSignUp()}
      />

      <MobileButton
        label="Already have an account? Sign in"
        variant="ghost"
        size="sm"
        onPress={() => onSwitch("sign-in")}
      />
    </View>
  );
}

export function AuthScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<AuthView>("sign-in");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.color.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: tokens.spacing.xl,
          paddingTop: insets.top + tokens.spacing.xl,
          paddingBottom: insets.bottom + tokens.spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", marginBottom: tokens.spacing.xxl }}>
          <Text
            style={{
              fontFamily: t.typography.fontFamilyMono,
              fontSize: tokens.typography.bodySmallSize,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            <Text style={{ color: t.color.accent }}>● </Text>
            <Text style={{ color: t.color.ink }}>HIRO</Text>
          </Text>
        </View>
        <View
          style={{
            backgroundColor: t.color.surface,
            borderRadius: t.radius.xl,
            borderWidth: 1,
            borderColor: t.color.border,
            padding: tokens.spacing.xxl,
          }}
        >
          {view === "sign-in" && <SignInView onSwitch={setView} />}
          {view === "sign-up" && <SignUpView onSwitch={setView} />}
          {view === "forgot-password" && <ForgotPasswordView onBack={() => setView("sign-in")} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
