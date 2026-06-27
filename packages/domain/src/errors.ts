// Service error codes.
//
// These are the *contract* between the Supabase RPCs / RLS policies (which `raise exception 'CODE'`)
// and the client services (which inspect `error.message` to map a code to a user-facing message).
// They were previously magic strings duplicated across every service with `error.message.includes(...)`,
// so a typo on either side silently broke error handling. This is the single source of truth.
//
// Parity with SQL is enforced by `scripts/check-migrations.mjs`, which asserts every
// `raise exception '...'` literal in `supabase/migrations/**` is a member of this object.

export const ServiceErrorCode = {
  // Rewards / points
  INSUFFICIENT_POINTS: "INSUFFICIENT_POINTS",
  REWARD_NOT_FOUND: "REWARD_NOT_FOUND",
  REWARD_ARCHIVED: "REWARD_ARCHIVED",
  // Households / membership
  NOT_HOUSEHOLD_MEMBER: "NOT_HOUSEHOLD_MEMBER",
  HOUSEHOLD_ALREADY_EXISTS: "HOUSEHOLD_ALREADY_EXISTS",
  ALREADY_IN_HOUSEHOLD: "ALREADY_IN_HOUSEHOLD",
  ALREADY_A_MEMBER: "ALREADY_A_MEMBER",
  // Invites
  NOT_HOUSEHOLD_OWNER: "NOT_HOUSEHOLD_OWNER",
  CANNOT_INVITE_SELF: "CANNOT_INVITE_SELF",
  INVITE_ALREADY_PENDING: "INVITE_ALREADY_PENDING",
  INVITE_NOT_FOUND: "INVITE_NOT_FOUND",
  INVITE_ALREADY_ACCEPTED: "INVITE_ALREADY_ACCEPTED",
  INVITE_EXPIRED: "INVITE_EXPIRED",
  // Tasks
  TASK_NOT_FOUND: "TASK_NOT_FOUND",
  TASK_ARCHIVED: "TASK_ARCHIVED",
  // Expenses
  PAYER_NOT_HOUSEHOLD_MEMBER: "PAYER_NOT_HOUSEHOLD_MEMBER",
  PARTICIPANT_NOT_HOUSEHOLD_MEMBER: "PARTICIPANT_NOT_HOUSEHOLD_MEMBER",
  NO_PARTICIPANTS: "NO_PARTICIPANTS",
} as const;

export type ServiceErrorCode = (typeof ServiceErrorCode)[keyof typeof ServiceErrorCode];

// Match longest code first: several codes are substrings of others
// (`NOT_HOUSEHOLD_MEMBER` ⊂ `PAYER_NOT_HOUSEHOLD_MEMBER` ⊂ ... ), so a naive scan would let the
// generic code shadow the specific one. Sorting by descending length makes the most specific code win.
const CODES_BY_SPECIFICITY = [...Object.values(ServiceErrorCode)].sort((a, b) => b.length - a.length);

/**
 * Find which known {@link ServiceErrorCode} a raw error message carries.
 *
 * Supabase surfaces a `raise exception 'CODE'` as a longer Postgres error string, so we match by
 * substring (as the old `error.message.includes(...)` chains did) but against the canonical enum.
 * Returns `null` when no known code is present, letting callers fall back to the raw message.
 *
 * `NOT_AUTHENTICATED` is intentionally not a member: it is an internal precondition the client never
 * surfaces to users, so it correctly falls through to `null`.
 */
export function matchServiceError(rawMessage: string | null | undefined): ServiceErrorCode | null {
  if (!rawMessage) return null;
  for (const code of CODES_BY_SPECIFICITY) {
    if (rawMessage.includes(code)) return code;
  }
  return null;
}
