import { LanguageProvider } from "@/confdsa/i18n/LanguageProvider";
import Header from "@/confdsa/components/layout/Header";
import Footer from "@/confdsa/components/layout/Footer";
import { loadConferenceYear } from "@/confdsa/server";

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
