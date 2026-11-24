import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { eventDefaults } from "@/content/event";
import { localize } from "@/lib/bilingual";
import type { Messages } from "@/i18n/LanguageProvider";
import type { EventCard } from "@/confdsa/components/sections/EventsList";

// An event year behind a URL: /etkinlikler/<slug> (current year) or /etkinlikler/<slug>/<year>.
// shortcut: until the events are in the database (phase 2), only DSATalks 2026 exists.
export const loadEventYear = cache(async (slug: string, year?: string) => {
  if (slug !== "dsatalks" || (year !== undefined && year !== "2026")) notFound();
  const base = year ? `/etkinlikler/${slug}/${year}` : `/etkinlikler/${slug}`;
  return { content: eventDefaults(), base };
});

// The cards of the events page: name, intro, date and venue of each event's current year.
export async function loadEventCards(): Promise<EventCard[]> {
  const { content } = await loadEventYear("dsatalks");
  const tr = localize<Messages>(content.messages, "tr");
  const en = localize<Messages>(content.messages, "en");
  return [
    {
      slug: "dsatalks",
      name: en.meta.name,
      intro: { tr: tr.hero.intro, en: en.hero.intro },
      date: { tr: tr.meta.dateRange, en: en.meta.dateRange },
      venue: { tr: tr.meta.venueFull, en: en.meta.venueFull },
      past: [],
    },
  ];
}
