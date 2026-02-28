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

export const appSections = ["Home", "Tasks", "Progress", "Budget", "More"] as const;
export type AppSection = (typeof appSections)[number];
