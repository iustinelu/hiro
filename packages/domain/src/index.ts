export type Uuid = string;

export interface Profile {
  id: Uuid;
  userId: Uuid;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Household {
  id: Uuid;
  name: string;
  ownerProfileId: Uuid;
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

// ─── App Shell ──────────────────────────────────────────────────────────────

export const appShellSections = [
  { id: "home", label: "Home", path: "/home" },
  { id: "tasks", label: "Tasks", path: "/tasks" },
  { id: "progress", label: "Progress", path: "/progress" },
  { id: "budget", label: "Budget", path: "/budget" },
  { id: "more", label: "More", path: "/more" }
] as const;

export type AppShellSection = (typeof appShellSections)[number];
export type AppShellSectionId = AppShellSection["id"];

export const appSections = ["Home", "Tasks", "Progress", "Budget", "More"] as const;
export type AppSection = (typeof appSections)[number];
