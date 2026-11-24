"use client";

import Container from "@/confdsa/components/ui/Container";
import Button from "@/confdsa/components/ui/Button";
import { MailIcon } from "@/confdsa/components/ui/Icons";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Closing band: opens the visitor's e-mail app addressed to the conference.
export default function CallToAction() {
  const { m, site } = useLanguage();
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(m.home.emailSubject)}`;

  return (
    <section className="pb-20 pt-16">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-brand px-8 py-12 text-white shadow-card sm:px-12">
          <div
            aria-hidden
            className="absolute inset-0 opacity-15 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[20px_20px]"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold sm:text-3xl">{m.home.ctaTitle}</h2>
              <p className="mt-2 text-white/85">{m.home.ctaText}</p>
              <a
                href={mailto}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline"
              >
                <MailIcon className="size-4" />
                {site.email}
              </a>
            </div>
            <Button href={mailto} variant="light" className="shrink-0 rounded-lg px-7 py-3">
              <MailIcon className="size-4" />
              {m.home.ctaButton}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
