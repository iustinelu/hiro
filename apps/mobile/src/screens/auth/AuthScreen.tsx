import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileInput, MobileButton } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { signIn, signUp, sendPasswordResetEmail, signInWithGoogle } from "../../lib/authService";

type AuthView = "sign-in" | "sign-up" | "forgot-password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GoogleG = () => (
  <Text style={{ fontSize: 15, fontWeight: "700", color: "rgb(66,133,244)", lineHeight: 18 }}>G</Text>
);

const OrDivider = () => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm }}>
    <View style={{ flex: 1, height: 1, backgroundColor: tokens.color.border }} />
    <Text style={{ fontFamily: tokens.typography.fontFamily, fontSize: tokens.typography.bodySmallSize, color: tokens.color.inkMuted }}>or</Text>
    <View style={{ flex: 1, height: 1, backgroundColor: tokens.color.border }} />
  </View>
);

function SignInView({ onSwitch }: { onSwitch: (view: AuthView) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    const { error: authError } = await signIn(email, password);
    setLoading(false);
    if (authError) setError(authError);
    // On success, onAuthStateChange in RootNavigator will update state
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    const { error: authError } = await signInWithGoogle();
    setGoogleLoading(false);
    if (authError) setError(authError);
  }

  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Text
        style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: "700",
          color: tokens.color.ink,
          marginBottom: tokens.spacing.sm,
        }}
      >
        Sign in
      </Text>

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    const { error: authError } = await signInWithGoogle();
    setGoogleLoading(false);
    if (authError) setError(authError);
  }

  async function handleSignUp() {
    setError(null);
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
    const { error: authError } = await signUp(email, password);
    setLoading(false);
    if (authError) setError(authError);
    // On success, onAuthStateChange in RootNavigator will update state
  }

  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Text
        style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: "700",
          color: tokens.color.ink,
          marginBottom: tokens.spacing.sm,
        }}
      >
        Create account
      </Text>

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

function ForgotPasswordView({ onSwitch }: { onSwitch: (view: AuthView) => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError(null);
    setLoading(true);
    const { error: authError } = await sendPasswordResetEmail(email);
    setLoading(false);
    if (authError) {
      setError(authError);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <View style={{ gap: tokens.spacing.md }}>
        <Text
          style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.titleSize,
            fontWeight: "700",
            color: tokens.color.ink,
          }}
        >
          Check your email
        </Text>
        <Text
          style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySize,
            color: tokens.color.inkMuted,
          }}
        >
          We sent a password reset link to {email}.
        </Text>
        <MobileButton
          label="Back to sign in"
          variant="ghost"
          size="sm"
          onPress={() => onSwitch("sign-in")}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Text
        style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: "700",
          color: tokens.color.ink,
          marginBottom: tokens.spacing.sm,
        }}
      >
        Forgot password
      </Text>
      <Text
        style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
          color: tokens.color.inkMuted,
        }}
      >
        Enter your email and we&apos;ll send you a reset link.
      </Text>

      <MobileInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <MobileButton
        label="Send reset link"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Sending…"
        onPress={() => void handleReset()}
      />

      <MobileButton
        label="Back to sign in"
        variant="ghost"
        size="sm"
        onPress={() => onSwitch("sign-in")}
      />
    </View>
  );
}

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<AuthView>("sign-in");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: tokens.color.bg }}
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
              fontFamily: tokens.typography.fontFamilyMono,
              fontSize: tokens.typography.bodySmallSize,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            <Text style={{ color: tokens.color.accent }}>● </Text>
            <Text style={{ color: tokens.color.ink }}>HIRO</Text>
          </Text>
        </View>
        <View
          style={{
            backgroundColor: tokens.color.surface,
            borderRadius: tokens.radius.xl,
            borderWidth: 1,
            borderColor: tokens.color.border,
            padding: tokens.spacing.xxl,
          }}
        >
          {view === "sign-in" && <SignInView onSwitch={setView} />}
          {view === "sign-up" && <SignUpView onSwitch={setView} />}
          {view === "forgot-password" && <ForgotPasswordView onSwitch={setView} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
