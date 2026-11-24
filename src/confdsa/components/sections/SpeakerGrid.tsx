"use client";

import Image from "next/image";
import Link from "@/confdsa/components/ui/Link";
import FadeIn from "@/confdsa/components/ui/FadeIn";
import { ArrowRightIcon, MicIcon } from "@/confdsa/components/ui/Icons";
import { displayName, initials } from "@/confdsa/data/committees";
import { speakerHref, talksOf } from "@/confdsa/data/speakers";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Horizontal speaker cards (photo left, details right); they stack on phones.
// Each card opens the speaker's profile page.
export default function SpeakerGrid() {
  const { m, locale, speakers } = useLanguage();

  return (
    <div className="space-y-6">
      {speakers.map((speaker, index) => {
        const name = displayName(speaker, locale);
        const talks = talksOf(speaker.slug, m.program);
        const areas = speaker.researchAreas[locale];
        return (
          <FadeIn key={speaker.slug} delay={index * 0.08}>
            <Link
              href={speakerHref(speaker.slug)}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/15 sm:flex-row"
            >
              {/* Photo: near-square on phones, a fixed-width column next to the details from sm up. */}
              <div className="relative grid aspect-5/4 shrink-0 place-items-center overflow-hidden bg-navy sm:aspect-auto sm:min-h-56 sm:w-56 lg:w-64">
                {speaker.photo ? (
                  <Image
                    src={speaker.photo}
                    alt={name}
                    fill
                    unoptimized
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-15 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[18px_18px]"
                    />
                    <span className="relative grid size-28 place-items-center rounded-full border-4 border-white/20 bg-navy-light text-4xl font-bold text-white">
                      {initials(speaker)}
                    </span>
                  </>
                )}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-brand sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:h-auto sm:w-1" />
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="text-xl font-bold text-navy">{name}</h3>
                <p className="mt-1 text-sm text-muted">{speaker.affiliation[locale]}</p>

                {talks.length > 0 && (
                  <div className="mt-5">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
                      <MicIcon className="size-3.5" />
                      {talks.length > 1 ? m.speakers.talksLabel : m.speakers.talkLabel}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {talks.map((talk) => (
                        <li key={talk.title} className="text-[17px] font-semibold leading-snug text-navy">
                          {talk.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer row: research areas on the left (once known), profile link on the right. */}
                <div className="mt-auto flex flex-col gap-4 border-t border-line pt-4 sm:mt-6 lg:flex-row lg:items-end lg:justify-between">
                  {areas.length > 0 ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{m.speakers.researchAreas}</p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {areas.map((area) => (
                          <li key={area} className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-navy ring-1 ring-navy/10">
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand">
                    {m.speakers.viewProfile}
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </FadeIn>
        );
      })}
    </div>
  );
}
