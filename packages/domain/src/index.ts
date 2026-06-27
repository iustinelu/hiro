export { ServiceErrorCode, matchServiceError } from "./errors";
export { splitEvenly, computeStreak, pointsShortfall, canAfford, isWithinUndoWindow } from "./calc";

export type Uuid = string;
export type CurrencyCode = "EUR" | "GBP" | "RON" | "USD";

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EUR: "\u20ac",
  GBP: "\u00a3",
  RON: "lei ",
  USD: "$",
};

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return `${CURRENCY_SYMBOLS[currency]}${amount.toFixed(2)}`;
}

export interface Profile {
  id: Uuid;
  userId: Uuid;
  displayName: string | null;
  // Persisted theme id (cross-device sync); null = no DB preference, use client default.
  // Typed `string` (not the UI ThemeId union) because the domain layer must stay free of UI
  // package imports (enforced by scripts/check-boundaries.mjs); the UI layer validates the
  // value against its theme id list before applying.
  theme: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Household {
  id: Uuid;
  name: string;
  ownerProfileId: Uuid;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
}

export type HouseholdRole = "owner" | "member";

export interface HouseholdMember {
  id: Uuid;
  householdId: Uuid;
  profileId: Uuid;
  role: HouseholdRole;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMemberWithProfile {
  id: Uuid;
  householdId: Uuid;
  profileId: Uuid;
  role: HouseholdRole;
  createdAt: string;
  profile: { id: Uuid; displayName: string | null };
}

export type InviteStatus = "pending" | "accepted" | "expired";

export interface HouseholdInvite {
  id: Uuid;
  householdId: Uuid;
  invitedEmail: string;
  invitedByProfileId: Uuid;
  token: string;
  status: InviteStatus;
  expiresAt: string;
  acceptedByProfileId: Uuid | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InviteDetails {
  householdName: string;
  inviterName: string | null;
  status: InviteStatus;
  expiresAt: string;
}

export interface ActivityEvent {
  id: Uuid;
  profileId: Uuid;
  householdId: Uuid | null;
  eventName: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Task Domain ────────────────────────────────────────────────────────────

export type TaskCadence = "daily" | "weekly" | "custom";

export interface CadenceMeta {
  day?: string;
  days?: string[];
}

export interface RecurringTask {
  id: Uuid;
  householdId: Uuid;
  name: string;
  description: string | null;
  points: number;
  cadence: TaskCadence;
  cadenceMeta: CadenceMeta;
  createdByProfileId: Uuid;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCompletion {
  id: Uuid;
  taskId: Uuid;
  completedByProfileId: Uuid;
  householdId: Uuid;
  pointsEarned: number;
  completedAt: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  profileId: Uuid;
  displayName: string | null;
  pointsThisWeek: number;
}

// ─── One-off / Ad-hoc Task Domain ─────────────────────────────────────────────

// 'backlog' = a claimable chore posted for anyone (HIR-67);
// 'log'     = "I just did this", self-logged as already done (HIR-70).
export type OneOffTaskKind = "backlog" | "log";

// Lifecycle: open -> claimed -> completed -> (contested) -> settled | reverted.
// Points are pending while 'completed'/'contested'; they finalize into the
// points ledger only on 'settled', and are voided on 'reverted'.
export type OneOffTaskStatus =
  | "open"
  | "claimed"
  | "completed"
  | "contested"
  | "settled"
  | "reverted";

export interface OneOffTask {
  id: Uuid;
  householdId: Uuid;
  name: string;
  description: string | null;
  points: number;
  createdByProfileId: Uuid;
  kind: OneOffTaskKind;
  status: OneOffTaskStatus;
  claimedByProfileId: Uuid | null;
  claimedAt: string | null;
  completedByProfileId: Uuid | null;
  completedAt: string | null;
  // Deadline of the contest/settle window (null until completed).
  settleAt: string | null;
  contestedByProfileId: Uuid | null;
  contestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Household Activity Feed Domain ───────────────────────────────────────────

export type HouseholdActivityKind =
  | "task_completed"
  | "one_off_posted"
  | "one_off_logged"
  | "one_off_claimed"
  | "one_off_completed"
  | "one_off_contested"
  | "one_off_contest_withdrawn"
  | "one_off_settled"
  | "one_off_reverted"
  | "reward_redeemed"
  | "member_joined"
  | "member_left";

export interface HouseholdActivity {
  id: Uuid;
  householdId: Uuid;
  actorProfileId: Uuid;
  actorDisplayName: string | null;
  kind: HouseholdActivityKind;
  pointsDelta: number | null;
  refId: Uuid | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ─── Progress Domain ────────────────────────────────────────────────────────

export interface DailyPoints {
  date: string;
  points: number;
  completions: number;
}

export interface PersonalStats {
  pointsThisWeek: number;
  pointsLastWeek: number;
  completionsThisWeek: number;
  completionsLastWeek: number;
  streak: number;
  totalPointsAllTime: number;
}

export interface TaskStats {
  taskId: Uuid;
  taskName: string;
  points: number;
  completionsThisWeek: number;
}

// ─── Expense / Budget Domain ────────────────────────────────────────────────

export interface Expense {
  id: Uuid;
  householdId: Uuid;
  title: string;
  amount: number;
  date: string;
  payerProfileId: Uuid;
  payerDisplayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseParticipant {
  profileId: Uuid;
  displayName: string | null;
  share: number;
}

export interface MonthlyBreakdown {
  month: string;
  totalAmount: number;
  expenseCount: number;
  byPayer: Array<{
    profileId: Uuid;
    displayName: string | null;
    totalPaid: number;
  }>;
}

// ─── Rewards Domain ─────────────────────────────────────────────────────────

export interface Reward {
  id: Uuid;
  householdId: Uuid;
  title: string;
  pointCost: number;
  isArchived: boolean;
  createdByProfileId: Uuid;
  createdAt: string;
  updatedAt: string;
}

export interface RewardRedemption {
  id: Uuid;
  rewardId: Uuid;
  redeemedByProfileId: Uuid;
  householdId: Uuid;
  pointsSpent: number;
  redeemedAt: string;
  createdAt: string;
}

export interface RewardRedemptionWithDetails {
  id: Uuid;
  rewardId: Uuid;
  redeemedByProfileId: Uuid;
  redeemedByDisplayName: string | null;
  householdId: Uuid;
  rewardTitle: string;
  pointsSpent: number;
  redeemedAt: string;
  createdAt: string;
}

// ─── App Shell ──────────────────────────────────────────────────────────────

export const appShellSections = [
  { id: "home", label: "Home", path: "/home" },
  { id: "tasks", label: "Tasks", path: "/tasks" },
  { id: "progress", label: "Progress", path: "/progress" },
  { id: "budget", label: "Budget", path: "/budget" },
  { id: "rewards", label: "Rewards", path: "/rewards" },
  { id: "more", label: "More", path: "/more" }
] as const;

export type AppShellSection = (typeof appShellSections)[number];
export type AppShellSectionId = AppShellSection["id"];

export const appSections = ["Home", "Tasks", "Progress", "Budget", "Rewards", "More"] as const;
export type AppSection = (typeof appSections)[number];

// ─── Auth method guidance (HIR-71) ──────────────────────────────────────────

export * from "./auth";
