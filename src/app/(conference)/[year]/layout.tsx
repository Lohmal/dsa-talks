import { LanguageProvider } from "@/confdsa/i18n/LanguageProvider";
import Header from "@/confdsa/components/layout/Header";
import Footer from "@/confdsa/components/layout/Footer";
import { loadConferenceYear } from "@/confdsa/server";
import { localize } from "@/lib/bilingual";
import type { Messages } from "@/confdsa/i18n/LanguageProvider";

// Site title and description from the year's texts (İçerik → Metinler → Genel).
export async function generateMetadata({ params }: LayoutProps<"/[year]">) {
  const { content } = await loadConferenceYear((await params).year);
  const { meta } = localize<Messages>(content.messages, "en");
  return {
    title: { absolute: `${meta.shortName} – ${meta.conferenceName}`, template: `%s | ${meta.shortName}` },
    description: meta.tagline,
  };
}

// One conference year: its texts, speakers and committees for every page below.
export default async function ConferenceYearLayout({ children, params }: LayoutProps<"/[year]">) {
  const { year } = await params;
  const { content, base } = await loadConferenceYear(year);

  return (
    <LanguageProvider content={content} base={base}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </LanguageProvider>
  );
}
