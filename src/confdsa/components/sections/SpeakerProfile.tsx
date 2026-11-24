"use client";

import Image from "next/image";
import Link from "@/confdsa/components/ui/Link";
import FadeIn from "@/confdsa/components/ui/FadeIn";
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  MicIcon,
} from "@/confdsa/components/ui/Icons";
import { displayName, initials } from "@/confdsa/data/committees";
import { linkNames, linkOrder, talksOf } from "@/confdsa/data/speakers";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Speaker page: photo, biography, academic profile links and the speaker's talks in the program.
export default function SpeakerProfile({ slug }: { slug: string }) {
  const { m, locale, speakers } = useLanguage();
  const speaker = speakers.find((s) => s.slug === slug);
  if (!speaker) return null;

  const name = displayName(speaker, locale);
  const bio = speaker.bio[locale];
  const talks = talksOf(slug, m.program);
  const links = linkOrder.filter((key) => speaker.links[key]);

  return (
    <div className="space-y-10">
      <FadeIn>
        <article className="grid gap-8 rounded-2xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8 md:grid-cols-[260px_1fr] md:gap-10">
          <div className="relative mx-auto aspect-square w-full max-w-65 overflow-hidden rounded-2xl bg-navy">
            {speaker.photo ? (
              <Image src={speaker.photo} alt={name} fill unoptimized className="object-cover object-top" />
            ) : (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-15 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[18px_18px]"
                />
                <span className="absolute inset-0 grid place-items-center text-6xl font-bold text-white">
                  {initials(speaker)}
                </span>
              </>
            )}
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-brand" />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-navy sm:text-3xl">{name}</h2>
            <p className="mt-2 flex items-start gap-2 text-muted">
              <BuildingIcon className="mt-0.5 size-4 shrink-0 text-brand" />
              {speaker.affiliation[locale]}
            </p>
            {speaker.membership && (
              <span className="mt-3 inline-block rounded-md bg-mist/25 px-3 py-1 text-sm font-semibold text-navy">
                {speaker.membership[locale]}
              </span>
            )}

            {speaker.researchAreas[locale].length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{m.speakers.researchAreas}</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {speaker.researchAreas[locale].map((area) => (
                    <li key={area} className="rounded-md bg-surface px-2.5 py-1 text-sm font-medium text-navy ring-1 ring-navy/10">
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h3 className="mt-7 text-lg font-bold text-navy">{m.speakers.biography}</h3>
            {bio.length > 0 ? (
              <div className="mt-3 space-y-3 leading-relaxed text-muted">
                {bio.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="mt-3 italic text-muted">{m.speakers.bioSoon}</p>
            )}

            {links.length > 0 && (
              <div className="mt-7 border-t border-line pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{m.speakers.profiles}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {links.map((key) => (
                    <li key={key}>
                      <a
                        href={speaker.links[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
                      >
                        {key === "profile" ? m.speakers.institutionProfile : linkNames[key]}
                        <ExternalLinkIcon className="size-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>
      </FadeIn>

      {talks.length > 0 && (
        <FadeIn delay={0.08}>
          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
              <MicIcon className="size-5 text-brand" />
              {m.speakers.talksInProgram}
            </h2>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {talks.map((talk) => (
                <li key={talk.title} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-navy/5">
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-brand">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="size-4" />
                      {talk.day}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ClockIcon className="size-4" />
                      {talk.time}
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-semibold leading-snug text-navy">{talk.title}</p>
                  <Link href="/program" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
                    {m.speakers.viewProgram} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </FadeIn>
      )}

      <Link href="/speakers" className="inline-flex items-center gap-2 font-semibold text-navy hover:text-brand">
        <ArrowLeftIcon className="size-4" />
        {m.speakers.allSpeakers}
      </Link>
    </div>
  );
}
