import "server-only";
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { localize } from "@/lib/bilingual";
import { editionPath, eventContent, findEdition, listEvents } from "@/lib/editions";
import type { Messages } from "@/i18n/LanguageProvider";
import type { EventCard } from "@/confdsa/components/sections/EventsList";

// An event year behind a URL: /etkinlikler/<slug> (current year) or /etkinlikler/<slug>/<year>.
export const loadEventYear = cache(async (slug: string, year?: string) => {
  await connection();
  if (year !== undefined && !/^\d{4}$/.test(year)) notFound();
  const edition = await findEdition(slug, year === undefined ? undefined : Number(year));
  if (!edition || edition.event.template !== "EVENT") notFound();
  const base = year ? `/etkinlikler/${slug}/${year}` : `/etkinlikler/${slug}`;
  return { edition, content: eventContent(edition), base };
});

// The cards of the events page: name, intro, date and venue of each event's current year,
// with links to its earlier years.
export async function loadEventCards(): Promise<EventCard[]> {
  const events = (await listEvents()).filter((event) => event.template === "EVENT");
  return events.flatMap((event) => {
    const current = event.editions.find((edition) => edition.year === event.currentYear);
    if (!current) return [];
    const content = eventContent(current);
    const tr = localize<Messages>(content.messages, "tr");
    const en = localize<Messages>(content.messages, "en");
    return [
      {
        slug: event.slug,
        name: event.name,
        intro: { tr: tr.hero.intro, en: en.hero.intro },
        date: { tr: tr.meta.dateRange, en: en.meta.dateRange },
        venue: { tr: tr.meta.venueFull, en: en.meta.venueFull },
        past: event.editions
          .filter((edition) => edition.year !== event.currentYear)
          .map((edition) => ({ year: edition.year, href: editionPath({ ...edition, event }) })),
      },
    ];
  });
}

// Title, description and link preview text of an event page, from the year's own texts.
// page: a sub-page's title and address under the event ("kurullar", "galeri").
export async function eventMetadata(slug: string, year?: string, page?: { title: string; path: string }): Promise<Metadata> {
  const { content, base } = await loadEventYear(slug, year);
  const en = localize<Messages>(content.messages, "en");
  const title = page ? `${page.title} | ${en.meta.name}` : `${en.meta.name} – ${en.meta.dateRange}`;
  const description = en.hero.intro;
  return {
    title,
    description,
    alternates: { canonical: page ? `${base}/${page.path}` : base },
    openGraph: { type: "website", siteName: en.meta.name, title, description, url: base },
    twitter: { card: "summary_large_image", title, description },
  };
}
