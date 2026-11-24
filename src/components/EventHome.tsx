import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Speakers from "@/components/Speakers";
import Program from "@/components/Program";
import Venue from "@/components/Venue";
import Footer from "@/components/Footer";
import { siteUrl } from "@/config/url";
import { localize } from "@/lib/bilingual";
import type { EventContent } from "@/content/event";
import type { Messages } from "@/i18n/LanguageProvider";

// The one-page event site (hero, about, speakers, program, venue) of one event year.
export default function EventHome({ content, base }: { content: EventContent; base: string }) {
  const en = localize<Messages>(content.messages, "en");
  const { site } = content;

  // Structured data so search engines can show the event (place, organizer, speakers).
  // shortcut: no start date or sub-events, since the program dates are free text; add a
  // machine-readable date to the event year if rich results are wanted again.
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: en.meta.name,
    description: en.hero.intro,
    url: `${siteUrl}${base}`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: ["en", "tr"],
    location: { "@type": "Place", name: en.meta.venueFull, address: en.meta.address },
    organizer: {
      "@type": "Organization",
      name: en.meta.department,
      url: site.departmentUrl,
      email: site.email,
      parentOrganization: { "@type": "CollegeOrUniversity", name: en.meta.university, url: site.universityUrl },
    },
    performer: content.speakers.map((speaker) => ({
      "@type": "Person",
      name: speaker.name,
      image: speaker.photo.startsWith("/") ? `${siteUrl}${speaker.photo}` : speaker.photo,
      affiliation: { "@type": "Organization", name: speaker.affiliation.en[0] },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so the JSON can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main>
        <Hero />
        <About />
        <Speakers />
        <Program />
        <Venue />
      </main>
      <Footer />
    </>
  );
}
