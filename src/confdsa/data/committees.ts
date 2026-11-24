import type { NavKey } from "@/confdsa/config/navigation";
import type { Locale } from "@/confdsa/i18n/LanguageProvider";

// Committee members (names, titles and affiliations in both languages) come with each year's
// content (default: committees.json).

export type Localized = { en: string; tr: string };

export type Member = {
  given: string; // printed as written
  surname: string; // printed in capitals, Turkish-aware
  title?: Localized;
  affiliation?: Localized;
  foreign?: boolean; // non-Turkish name: capitalise with English rules (i → I, not İ)
  photo?: string; // e.g. "/images/people/ilker-unal.webp"; initials are shown when missing
};

// The name fields shared by committee members and speakers.
type Named = Pick<Member, "given" | "surname" | "title" | "foreign">;

export type CommitteeId = "honoraryChairs" | "coChairs" | "programCommittee" | "localCommittee";

export const committeeOrder: { id: CommitteeId & NavKey; href: string }[] = [
  { id: "honoraryChairs", href: "/committees/honorary-committee" },
  { id: "programCommittee", href: "/committees/program-committee" },
  { id: "localCommittee", href: "/committees/organizing-committee" },
];

export type Committees = Record<CommitteeId, Member[]>;

// The co-chairs are shown at the top of the Organizing Committee page, so they count towards it.
export function committeeSize(committees: Committees, id: CommitteeId) {
  return id === "localCommittee" ? committees.coChairs.length + committees.localCommittee.length : committees[id].length;
}

export function displayName(member: Named, locale: Locale) {
  const title = member.title?.[locale];
  const surname = member.surname.toLocaleUpperCase(member.foreign ? "en" : "tr");
  return [title, member.given, surname].filter(Boolean).join(" ");
}

export function initials(member: Named) {
  return (member.given[0] + member.surname[0]).toLocaleUpperCase(member.foreign ? "en" : "tr");
}
