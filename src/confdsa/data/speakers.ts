import type { Localized } from "./committees";
import type { Messages } from "@/confdsa/i18n/LanguageProvider";

// Keynote & invited speakers (each year's content; default: speakers.json). Talks are not stored here: they come from the program
// (messages → program.days[].sessions[].speakerId), so each talk is written only once.

export type SpeakerLinkKey = "profile" | "scholar" | "researchgate" | "scopus" | "orcid" | "wos";

export type Speaker = {
  slug: string;
  given: string;
  surname: string;
  foreign?: boolean;
  title?: Localized;
  affiliation: Localized;
  researchAreas: { en: string[]; tr: string[] }; // shown at the bottom of the card and on the profile
  photo?: string;
  membership?: Localized; // e.g. "IEEE Member"
  links: Partial<Record<SpeakerLinkKey, string>>;
  bio: { en: string[]; tr: string[] };
};

export const speakerHref = (slug: string) => `/speakers/${slug}`;

export const linkOrder: SpeakerLinkKey[] = ["profile", "scholar", "researchgate", "scopus", "orcid", "wos"];

export const linkNames: Record<Exclude<SpeakerLinkKey, "profile">, string> = {
  scholar: "Google Scholar",
  researchgate: "ResearchGate",
  scopus: "Scopus",
  orcid: "ORCID",
  wos: "Web of Science",
};

export function talksOf(slug: string, program: Messages["program"]) {
  return program.days.flatMap((day) =>
    day.sessions
      .filter((session) => "speakerId" in session && session.speakerId === slug)
      .map((session) => ({ day: day.label, time: session.time, title: session.title })),
  );
}
