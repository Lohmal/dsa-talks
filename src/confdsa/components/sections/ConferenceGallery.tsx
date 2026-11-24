"use client";

import GalleryGrid from "@/components/GalleryGrid";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// The photos and videos of the shown year (İçerik → Galeri).
export default function ConferenceGallery() {
  const { m, locale, gallery } = useLanguage();
  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed text-muted">{m.gallery.intro}</p>
      <GalleryGrid items={gallery} locale={locale} labels={m.gallery} />
    </div>
  );
}
