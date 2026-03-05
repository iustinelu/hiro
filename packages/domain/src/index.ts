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

export const appShellSections = [
  { id: "home", label: "Home", path: "/home", headerActionLabel: "Add task" },
  { id: "tasks", label: "Tasks", path: "/tasks", headerActionLabel: "New task" },
  { id: "progress", label: "Progress", path: "/progress", headerActionLabel: "View report" },
  { id: "budget", label: "Budget", path: "/budget", headerActionLabel: "Add expense" },
  { id: "more", label: "More", path: "/more", headerActionLabel: "Manage" }
] as const;

export type AppShellSection = (typeof appShellSections)[number];
export type AppShellSectionId = AppShellSection["id"];

export const appSections = ["Home", "Tasks", "Progress", "Budget", "More"] as const;
export type AppSection = (typeof appSections)[number];
