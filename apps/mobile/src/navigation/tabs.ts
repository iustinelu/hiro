import { appSections } from "@hiro/domain";

export const mobileTabs = appSections;
export type MobileTab = (typeof mobileTabs)[number];
