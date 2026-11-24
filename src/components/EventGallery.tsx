"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalleryGrid from "@/components/GalleryGrid";
import { Container } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

// The gallery page of an event year, with the red band of the committees page.
export default function EventGallery() {
  const { m, locale, gallery } = useLanguage();
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(115deg,#e41f35_0%,#d7182a_45%,#ab1022_100%)] py-14 text-white sm:py-20">
          <svg aria-hidden viewBox="0 0 600 600" className="absolute -right-48 -top-40 size-152 opacity-60">
            {[120, 200, 280].map((r) => (
              <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="white" strokeOpacity="0.14" />
            ))}
          </svg>
          <Container className="relative">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.38em] text-white/85">
              <span aria-hidden className="h-0.5 w-8 bg-white" />
              {m.meta.name}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-6xl">{m.gallery.title}</h1>
            <p className="mt-3 max-w-2xl text-white/85 sm:text-lg">{m.gallery.intro}</p>
          </Container>
        </section>
        <Container className="py-12 sm:py-16">
          <GalleryGrid items={gallery} locale={locale} labels={m.gallery} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
