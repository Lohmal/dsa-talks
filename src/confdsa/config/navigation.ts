import type { Messages } from "@/confdsa/i18n/LanguageProvider";

export type NavKey = Exclude<keyof Messages["nav"], "menu" | "closeMenu" | "overview">;

export type NavItem = {
  key: NavKey;
  href: string;
  // Default for a new year: published or not. Each year's choice is saved with its content
  // (admin panel → Metinler → pages); unpublished pages are hidden from the menu and return 404.
  enabled: boolean;
  children?: NavItem[];
};

export type Pages = Partial<Record<NavKey, boolean>>;

export const navigation: NavItem[] = [
  { key: "home", href: "/", enabled: true },
  {
    key: "committees",
    href: "/committees",
    enabled: true,
    children: [
      { key: "honoraryChairs", href: "/committees/honorary-committee", enabled: true },
      { key: "programCommittee", href: "/committees/program-committee", enabled: true },
      { key: "localCommittee", href: "/committees/organizing-committee", enabled: true },
    ],
  },
  { key: "conferenceTopics", href: "/topics-and-scopes", enabled: true },
  { key: "plenarySpeakers", href: "/speakers", enabled: true },
  { key: "conferenceProgram", href: "/program", enabled: true },
  // Shown on its own while Registration is hidden.
  { key: "abstractSubmission", href: "/abstract-submission", enabled: true },
  {
    key: "registration",
    href: "/registration",
    enabled: false,
    children: [
      { key: "registration", href: "/registration", enabled: false },
      { key: "registrationFee", href: "/registration-fee", enabled: false },
      { key: "accommodation", href: "/accommodation", enabled: false },
    ],
  },
  { key: "importantDates", href: "/important-dates", enabled: false },
  { key: "socialActivities", href: "/social-activities", enabled: false },
  { key: "awards", href: "/awards", enabled: false },
  { key: "paperPublications", href: "/paper-publications", enabled: false },
  { key: "gallery", href: "/gallery", enabled: false },
  { key: "events", href: "/etkinlikler", enabled: true },
  { key: "contact", href: "/contact", enabled: true },
];

function flatten(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children ?? [])]);
}

export function defaultPages(): Pages {
  return Object.fromEntries(flatten(navigation).map((item) => [item.key, item.enabled]));
}

export function visibleNavigation(pages: Pages, items: NavItem[] = navigation): NavItem[] {
  return items
    .filter((item) => pages[item.key] ?? item.enabled)
    .map((item) => ({ ...item, children: item.children && visibleNavigation(pages, item.children) }));
}

export function isPageEnabled(pages: Pages, key: NavKey): boolean {
  return pages[key] ?? flatten(navigation).some((item) => item.key === key && item.enabled);
}
