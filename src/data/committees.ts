import data from "./committees.json";
import type { Locale } from "@/i18n/LanguageProvider";

// Committee members (shared with the CONFDSA site): names, titles and affiliations in both
// languages; photos in public/images/people.

export type Localized = { en: string; tr: string };

export type Member = {
  given: string; // printed as written
  surname: string; // printed in capitals, Turkish-aware
  title?: Localized;
  affiliation?: Localized;
  foreign?: boolean; // non-Turkish name: capitalise with English rules (i → I, not İ)
  photo?: string; // initials are shown when missing
};

export type CommitteeId = "honoraryChairs" | "coChairs" | "programCommittee" | "localCommittee";

export const committees = data as Record<CommitteeId, Member[]>;

export function displayName(member: Member, locale: Locale) {
  const title = member.title?.[locale];
  const surname = member.surname.toLocaleUpperCase(member.foreign ? "en" : "tr");
  return [title, member.given, surname].filter(Boolean).join(" ");
}

export function initials(member: Member) {
  return (member.given[0] + member.surname[0]).toLocaleUpperCase(member.foreign ? "en" : "tr");
}
