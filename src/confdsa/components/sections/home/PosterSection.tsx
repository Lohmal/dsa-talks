"use client";

import Image from "next/image";
import Container from "@/confdsa/components/ui/Container";
import Button from "@/confdsa/components/ui/Button";
import FadeIn from "@/confdsa/components/ui/FadeIn";
import SectionTitle from "@/confdsa/components/ui/SectionTitle";
import { DownloadIcon, ExternalLinkIcon } from "@/confdsa/components/ui/Icons";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Poster in the visitor's language, with PDF downloads for both languages.
export default function PosterSection() {
  const { m, locale, site } = useLanguage();
  const other = locale === "en" ? "tr" : "en";
  const image = site.posterImage[locale];
  const pdf = (lang: "en" | "tr") => site.posterPdf[lang];

  return (
    <section className="py-16">
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <FadeIn className="order-2 lg:order-1">
          <a
            href={image}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative mx-auto block max-w-md overflow-hidden rounded-2xl bg-white p-3 shadow-card ring-1 ring-navy/5 transition-transform duration-300 hover:-translate-y-1"
          >
            <Image
              src={image}
              alt={m.home.posterAlt}
              width={1100}
              height={1556}
              unoptimized
              className="h-auto w-full rounded-xl"
            />
            <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-b-xl bg-navy/80 py-2.5 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ExternalLinkIcon className="size-4" />
              {m.home.posterOpen}
            </span>
          </a>
        </FadeIn>

        <FadeIn delay={0.1} className="order-1 lg:order-2">
          <SectionTitle title={m.home.posterTitle} align="left" />
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">{m.home.posterText}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href={pdf(locale)} download className="rounded-lg px-6 py-3">
              <DownloadIcon className="size-4" />
              {m.home.posterDownload}
            </Button>
            <a
              href={pdf(other)}
              download
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-brand"
            >
              <DownloadIcon className="size-4" />
              {m.home.posterOther}
            </a>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
