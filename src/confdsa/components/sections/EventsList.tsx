"use client";

import Link from "next/link";
import FadeIn from "@/confdsa/components/ui/FadeIn";
import { ArrowRightIcon, CalendarIcon, MapPinIcon } from "@/confdsa/components/ui/Icons";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

type Text = { tr: string; en: string };

export type EventCard = {
  slug: string;
  name: string;
  intro: Text;
  date: Text;
  venue: Text;
  // Earlier years with their own page, newest first.
  past: { year: number; href: string }[];
};

// One card per event (its current year), with links to the earlier years.
export default function EventsList({ events }: { events: EventCard[] }) {
  const { m, locale } = useLanguage();

  if (events.length === 0) return <p className="text-muted">{m.events.empty}</p>;

  return (
    <div>
      <p className="max-w-2xl text-lg text-muted">{m.events.intro}</p>
      <ul className="mt-10 grid gap-6 md:grid-cols-2">
        {events.map((event, index) => (
          <li key={event.slug}>
            <FadeIn delay={index * 0.06} className="h-full">
              <article className="flex h-full flex-col rounded-2xl bg-white p-7 shadow-card ring-1 ring-navy/5">
                <h2 className="text-2xl font-bold tracking-[-0.02em] text-navy">{event.name}</h2>
                <p className="mt-3 leading-relaxed text-muted">{event.intro[locale]}</p>
                <dl className="mt-5 space-y-2 text-sm font-semibold text-navy">
                  {event.date[locale] && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="size-4 text-brand" />
                      <dd>{event.date[locale]}</dd>
                    </div>
                  )}
                  {event.venue[locale] && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="size-4 text-brand" />
                      <dd>{event.venue[locale]}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-7">
                  <Link
                    href={`/etkinlikler/${event.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    {m.events.view}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                  {event.past.length > 0 && (
                    <p className="text-sm text-muted">
                      {m.events.past}:{" "}
                      {event.past.map((past, i) => (
                        <span key={past.year}>
                          {i > 0 && ", "}
                          <Link href={past.href} className="font-semibold text-navy hover:text-brand">
                            {past.year}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </article>
            </FadeIn>
          </li>
        ))}
      </ul>
    </div>
  );
}
