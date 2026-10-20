"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BookOpenText, X } from "lucide-react";
import { Container, FadeIn, SectionHeading } from "./ui";
import { linkNames, slotLabel, speakers, talksOf, type Speaker } from "@/data/speakers";
import { useLanguage } from "@/i18n/LanguageProvider";

// Navy band with the three speakers, laid out like the poster: round photo, red time
// badge, name, affiliation, a short red rule and the talk titles.
export default function Speakers() {
  const { m } = useLanguage();
  const [selected, setSelected] = useState<Speaker | null>(null);

  return (
    <section id="speakers" className="relative scroll-mt-24 overflow-hidden bg-ink py-20 text-white sm:py-28">
      <span aria-hidden className="absolute inset-y-0 left-0 w-2 bg-brand sm:w-3" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[22px_22px]"
      />
      <div aria-hidden className="absolute -right-48 -top-48 size-144 rounded-full bg-brand/20 blur-3xl" />

      <Container className="relative">
        <SectionHeading light eyebrow={m.speakers.eyebrow} title={m.speakers.title} text={m.speakers.text} />

        <ul className="mt-16 grid gap-6 md:grid-cols-3">
          {speakers.map((speaker, index) => (
            <li key={speaker.slug}>
              <FadeIn delay={index * 0.1} className="h-full">
                <SpeakerCard speaker={speaker} onOpen={() => setSelected(speaker)} />
              </FadeIn>
            </li>
          ))}
        </ul>
      </Container>

      <BioDialog speaker={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function SpeakerCard({ speaker, onOpen }: { speaker: Speaker; onOpen: () => void }) {
  const { m, locale } = useLanguage();
  const talks = talksOf(speaker.slug, m.program);
  const hasBio = speaker.bio[locale].length > 0;
  const hasLinks = Object.keys(speaker.links).length > 0;

  return (
    <article className="group flex h-full flex-col items-center rounded-4xl bg-white/4 px-6 pb-8 pt-10 text-center ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.07] hover:ring-white/20">
      <div className="relative">
        <div className="relative size-44 overflow-hidden rounded-full border-[5px] border-white bg-white shadow-xl shadow-black/40 ring-4 ring-brand">
          <Image src={speaker.photo} alt={speaker.name} fill sizes="176px" unoptimized className="object-cover" />
        </div>
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-5 py-1.5 text-sm font-extrabold uppercase tracking-[0.12em] shadow-lg shadow-black/25">
          {slotLabel(speaker.slug, m)}
        </span>
      </div>

      <h3 className="mt-10 text-2xl font-extrabold tracking-[-0.02em]">{speaker.name}</h3>
      <p className="mt-2 text-white/70">
        {speaker.affiliation[locale].map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>

      <span aria-hidden className="mt-6 h-1 w-12 rounded-full bg-brand" />

      <ul className="mt-6 flex flex-1 flex-col gap-4">
        {talks.map((talk) => (
          <li key={talk.title} className="text-lg font-medium italic leading-snug text-white/90">
            “{talk.title}”
          </li>
        ))}
      </ul>

      {(hasBio || hasLinks) && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold ring-1 ring-white/15 transition-colors hover:bg-white hover:text-ink"
        >
          <BookOpenText className="size-4" />
          {hasBio ? m.speakers.readBio : m.speakers.profiles}
        </button>
      )}
    </article>
  );
}

// Native <dialog>: focus trapping, Escape and the backdrop come from the browser.
function BioDialog({ speaker, onClose }: { speaker: Speaker | null; onClose: () => void }) {
  const { m, locale } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (speaker && !dialog.open) dialog.showModal();
    if (!speaker && dialog.open) dialog.close();
  }, [speaker]);

  const links = speaker ? (Object.entries(speaker.links) as [keyof Speaker["links"], string][]) : [];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="bio-title"
      className="m-auto max-h-[88svh] w-[min(46rem,calc(100vw-2rem))] overflow-hidden rounded-3xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink-deep/70 backdrop:backdrop-blur-sm"
    >
      {speaker && (
        <div className="flex max-h-[88svh] flex-col">
          <div className="relative flex items-center gap-5 bg-ink px-6 py-6 text-white sm:px-8">
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-brand" />
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-white ring-[3px] ring-brand">
              <Image src={speaker.photo} alt="" fill sizes="80px" unoptimized className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 id="bio-title" className="text-xl font-extrabold sm:text-2xl">
                {speaker.name}
              </h3>
              <p className="mt-1 text-sm text-white/70">{speaker.affiliation[locale].join(", ")}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={m.speakers.close}
              className="grid size-10 shrink-0 place-items-center self-start rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-7 sm:px-8">
            <div className="space-y-4 leading-relaxed text-muted">
              {speaker.bio[locale].map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {links.length > 0 && (
              <>
                <h4 className={`${speaker.bio[locale].length ? "mt-8" : ""} text-xs font-extrabold uppercase tracking-[0.28em] text-brand`}>
                  {m.speakers.profiles}
                </h4>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {links.map(([key, href]) => (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-sm font-semibold ring-1 ring-line transition-colors hover:bg-ink hover:text-white"
                      >
                        {linkNames[key]}
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
