"use client";

import Image from "next/image";
import { Mic, UtensilsCrossed } from "lucide-react";
import { Container, FadeIn, SectionHeading } from "./ui";
import { speakerBySlug } from "@/data/speakers";
import { useLanguage } from "@/i18n/LanguageProvider";

// Both days stacked as an agenda: a large day label on the left, the sessions as rows
// on the right (time · speaker · title). Breaks and the opening are slim rows.
export default function Program() {
  const { m, locale } = useLanguage();

  return (
    <section id="program" className="scroll-mt-24 bg-surface py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={m.program.eyebrow} title={m.program.title} />

        <div className="mt-14 space-y-10 lg:space-y-14">
          {m.program.days.map((day) => (
            <FadeIn key={day.n}>
              <div className="grid gap-6 lg:grid-cols-[15rem_1fr] lg:gap-10">
                <header className="flex items-center gap-5 lg:sticky lg:top-28 lg:block lg:self-start lg:pt-4">
                  <span className="text-6xl font-black leading-none tracking-[-0.06em] text-brand lg:text-8xl">
                    {String(day.n).padStart(2, "0")}
                  </span>
                  <div className="lg:mt-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-muted">{m.program.day}</p>
                    <h3 className="mt-1 text-lg font-extrabold leading-snug text-ink lg:text-xl">{day.date}</h3>
                    <span aria-hidden className="mt-4 hidden h-1 w-12 rounded-full bg-brand lg:block" />
                  </div>
                </header>

                <ol className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink/5">
                  {day.sessions.map((session) => {
                    const speaker = session.speaker ? speakerBySlug[session.speaker] : undefined;
                    const Icon = session.kind === "break" ? UtensilsCrossed : Mic;
                    const [start, end] = session.time.split("–");

                    const time = (
                      <p className="tabular-nums">
                        <span className={`font-black tracking-tight text-ink ${speaker ? "text-2xl" : "text-lg"}`}>
                          {start}
                        </span>
                        <span className="ml-1.5 text-sm font-semibold text-muted md:ml-0 md:block">– {end}</span>
                      </p>
                    );

                    if (!speaker) {
                      return (
                        <li
                          key={session.time}
                          className="grid items-center gap-2 border-b border-line bg-surface/60 px-6 py-4 last:border-0 sm:px-8 md:grid-cols-[7rem_1fr] md:gap-8"
                        >
                          {time}
                          <p className="flex items-center gap-3 font-semibold text-muted">
                            <span className="grid size-8 place-items-center rounded-full bg-white text-brand ring-1 ring-line">
                              <Icon className="size-4" />
                            </span>
                            {session.title}
                          </p>
                        </li>
                      );
                    }

                    return (
                      <li
                        key={session.time}
                        className="group relative grid gap-4 border-b border-line px-6 py-6 transition-colors last:border-0 hover:bg-brand/2.5 sm:px-8 md:grid-cols-[7rem_1fr] md:gap-8 lg:grid-cols-[7rem_15rem_1fr] lg:items-center"
                      >
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-1 bg-brand opacity-0 transition-opacity group-hover:opacity-100"
                        />
                        {time}
                        <div className="flex items-center gap-4 md:col-start-2 lg:col-start-auto">
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-[3px] ring-brand/80">
                            <Image src={speaker.photo} alt="" fill sizes="56px" unoptimized className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold leading-tight text-ink">{speaker.name}</p>
                            <p className="mt-0.5 text-sm leading-snug text-muted">{speaker.affiliation[locale][0]}</p>
                          </div>
                        </div>
                        <h4 className="text-lg font-bold leading-snug tracking-[-0.01em] text-ink md:col-start-2 lg:col-start-auto">
                          {session.title}
                        </h4>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
