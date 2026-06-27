// HIR-71: account-linking UX. Pure, platform-agnostic helpers that turn the set of sign-in
// methods an account uses (from the `account_methods_for_email` RPC) into friendly guidance,
// so web and mobile show identical copy and the logic is unit-testable.

export type AuthMethod = "email" | "google";

export interface SignInFailureGuidance {
  message: string;
  // When true, the UI should emphasise the existing "Continue with Google" button.
  highlightGoogle: boolean;
}

// A sign-in attempt failed. Decide what to tell the user from the account's real methods.
export function resolveSignInFailure(methods: AuthMethod[]): SignInFailureGuidance {
  const hasGoogle = methods.includes("google");
  const hasPassword = methods.includes("email");

  if (hasGoogle && !hasPassword) {
    return {
      message:
        "This email is registered with Google. Use the Continue with Google button above to sign in.",
      highlightGoogle: true,
    };
  }
  if (hasPassword) {
    // A password exists, so this really was a wrong password (or typo).
    return {
      message: "Incorrect email or password. Try again, or reset your password.",
      highlightGoogle: false,
    };
  }
  // No account at all for this email.
  return {
    message: "No account found for this email. Create one below.",
    highlightGoogle: false,
  };
}

export interface SignUpCollision {
  message: string;
}

// A sign-up collided with an existing account. Returns null when there is no collision
// (the email is free) so the caller can proceed with the normal sign-up flow.
export function resolveSignUpCollision(methods: AuthMethod[]): SignUpCollision | null {
  const hasGoogle = methods.includes("google");
  const hasPassword = methods.includes("email");

  if (!hasGoogle && !hasPassword) {
    return null;
  }
  if (hasGoogle && !hasPassword) {
    return {
      message:
        "This email already uses Google. Use the Continue with Google button to sign in.",
    };
  }
  return {
    message: "You already have an account with this email. Switch to Sign in.",
  };
}
