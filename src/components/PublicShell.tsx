"use client";

import Link from "next/link";
import { Container, LanguageSwitcher, Wordmark } from "./ui";
import { useLanguage } from "@/i18n/LanguageProvider";

// Frame for the stand-alone pages (survey, certificate check): white bar with the wordmark
// and language switch, a red title band, the content card lifted over it, and a back link.
export default function PublicShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  const { m } = useLanguage();

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <header className="border-t-4 border-brand bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl">
            <Wordmark />
          </Link>
          <LanguageSwitcher />
        </Container>
      </header>

      <section className="relative overflow-hidden bg-[linear-gradient(115deg,#e41f35_0%,#d7182a_45%,#ab1022_100%)] pb-28 pt-12 text-white sm:pt-16">
        <svg aria-hidden viewBox="0 0 600 600" className="absolute -right-48 -top-40 size-152 opacity-60">
          {[120, 200, 280].map((r) => (
            <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="white" strokeOpacity="0.14" />
          ))}
        </svg>
        <Container className="relative max-w-3xl">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.38em] text-white/85">
            <span aria-hidden className="h-0.5 w-8 bg-white" />
            DSATalks
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.02em] sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-white/85 sm:text-lg">{intro}</p>
        </Container>
      </section>

      <main className="relative -mt-16 flex-1 pb-16">
        <Container className="max-w-3xl">{children}</Container>
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-line bg-white px-4 py-6 text-center text-sm text-muted">
        <Link href="/" className="font-semibold text-ink hover:text-brand">
          {m.survey.backHome}
        </Link>
        <Link href="/kvkk" className="font-semibold text-muted hover:text-brand">
          {m.kvkk.link}
        </Link>
      </footer>
    </div>
  );
}
