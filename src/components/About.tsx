"use client";

import { Container, FadeIn, SectionHeading } from "./ui";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function About() {
  const { m } = useLanguage();

  return (
    <section id="about" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
        <FadeIn>
          <SectionHeading eyebrow={m.about.eyebrow} title={m.about.title} />
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
            {m.about.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {m.about.themes.map((theme) => (
              <li
                key={theme}
                className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line"
              >
                <span aria-hidden className="size-1.5 rounded-full bg-brand" />
                {theme}
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={0.12}>
          <aside className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white shadow-card sm:p-10">
            <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full border-[28px] border-brand/80" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[18px_18px]"
            />
            <h3 className="relative text-xs font-extrabold uppercase tracking-[0.32em] text-brand-soft">
              {m.about.organizersTitle}
            </h3>
            <ul className="relative mt-6 divide-y divide-white/10">
              {m.about.organizers.map((name) => (
                <li key={name} className="py-4 text-lg font-semibold leading-snug first:pt-0">
                  {name}
                </li>
              ))}
            </ul>
            <p className="relative mt-6 border-t border-white/10 pt-6 text-2xl font-light italic tracking-tight text-white/90">
              {m.footer.tagline}
            </p>
          </aside>
        </FadeIn>
      </Container>
    </section>
  );
}
