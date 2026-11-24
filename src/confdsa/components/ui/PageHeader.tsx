"use client";

import Link from "@/confdsa/components/ui/Link";
import Container from "./Container";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";
import type { NavKey } from "@/confdsa/config/navigation";

// Banner shown at the top of every inner page.
export default function PageHeader({
  titleKey,
  parent,
  title,
}: {
  titleKey: NavKey;
  parent?: { key: NavKey; href: string };
  title?: { en: string; tr: string }; // overrides the menu label, e.g. a speaker's name
}) {
  const { m, locale } = useLanguage();
  const heading = title ? title[locale] : m.nav[titleKey];

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[22px_22px]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-brand" />
      <Container className="relative py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/70">
          <Link href="/" className="hover:text-white">
            {m.nav.home}
          </Link>
          <span className="mx-2">/</span>
          {parent && (
            <>
              <Link href={parent.href} className="hover:text-white">
                {m.nav[parent.key]}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-white">{heading}</span>
        </nav>
        <h1 className="text-3xl font-bold sm:text-4xl">{heading}</h1>
      </Container>
    </section>
  );
}
