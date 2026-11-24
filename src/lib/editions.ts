import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { Edition, Event } from "@prisma/client";
import { db } from "./db";
import { ensureDefaults } from "./bootstrap";
import { withDefaults } from "./bilingual";
import { conferenceDefaults, type ConferenceContent } from "@/confdsa/content";
import { eventDefaults, type EventContent } from "@/content/event";

// Events (CONFDSA, DSATalks, …) and their years. Everything a year shows or collects (texts,
// survey, questions, responses, certificates) belongs to one Edition.

export type EditionWithEvent = Edition & { event: Event };

const isObjectId = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{24}$/.test(value);

export const getEdition = cache(async (id: string): Promise<EditionWithEvent | null> => {
  if (!isObjectId(id)) return null;
  const edition = await db.edition.findUnique({ where: { id } });
  const event = edition && (await db.event.findUnique({ where: { id: edition.eventId } }));
  return edition && event ? { ...edition, event } : null;
});

// A year of the event with this address; without a year, the year shown at its address.
export const findEdition = cache(async (slug: string, year?: number): Promise<EditionWithEvent | null> => {
  await ensureDefaults();
  const event = await db.event.findUnique({ where: { slug } });
  if (!event) return null;
  const edition = await db.edition.findUnique({ where: { eventId_year: { eventId: event.id, year: year ?? event.currentYear } } });
  return edition ? { ...edition, event } : null;
});

// Every event with its years (newest first), events in their own order.
export const listEvents = cache(async () => {
  await ensureDefaults();
  const [events, editions] = await Promise.all([
    db.event.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    db.edition.findMany({ orderBy: { year: "desc" } }),
  ]);
  return events.map((event) => ({ ...event, editions: editions.filter((edition) => edition.eventId === event.id) }));
});

// The year the admin panel works on: chosen with the selector at the top of the panel (a
// cookie), otherwise the current DSATalks year, otherwise any year.
export const ADMIN_EDITION_COOKIE = "admin-edition";

export const adminEdition = cache(async (): Promise<EditionWithEvent> => {
  const chosen = (await cookies()).get(ADMIN_EDITION_COOKIE)?.value;
  const edition = (chosen && (await getEdition(chosen))) || (await findEdition("dsatalks"));
  if (edition) return edition;
  const any = await db.edition.findFirstOrThrow({ orderBy: { createdAt: "asc" } });
  return (await getEdition(any.id))!;
});

// The content of a year: what was saved in the panel over the defaults of its template.
export function conferenceContent(edition: Edition): ConferenceContent {
  return withDefaults(conferenceDefaults(), edition.content);
}

export function eventContent(edition: Edition): EventContent {
  return withDefaults(eventDefaults(), edition.content);
}

// Where a year's survey is filled in. The QR codes printed for DSATalks 2026 point to /anket.
export function surveyPath(edition: EditionWithEvent) {
  if (edition.event.slug === "dsatalks" && edition.year === 2026) return "/anket";
  return edition.event.template === "CONFERENCE"
    ? `/${edition.year}/anket`
    : `/etkinlikler/${edition.event.slug}/${edition.year}/anket`;
}

// The public page of a year.
export function editionPath(edition: EditionWithEvent) {
  const current = edition.year === edition.event.currentYear;
  if (edition.event.template === "CONFERENCE") return current ? "/" : `/${edition.year}`;
  return current ? `/etkinlikler/${edition.event.slug}` : `/etkinlikler/${edition.event.slug}/${edition.year}`;
}

export const editionLabel = (edition: EditionWithEvent) => `${edition.event.name} ${edition.year}`;
