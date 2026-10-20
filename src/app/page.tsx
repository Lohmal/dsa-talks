import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Speakers from "@/components/Speakers";
import Program from "@/components/Program";
import Venue from "@/components/Venue";
import Footer from "@/components/Footer";
import { site } from "@/config/site";
import { siteUrl } from "@/config/url";
import { speakerBySlug, speakers } from "@/data/speakers";
import en from "@/i18n/messages/en.json";

// Day n of the event as an ISO date-time in Türkiye time (UTC+3), e.g. day 1 + "10:15".
const at = (day: number, time: string) => `2026-11-0${3 + day}T${time}:00+03:00`;

const place = {
  "@type": "Place",
  name: en.meta.venueFull,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Balcalı Mah. Güney Kampüs 10 Sokak No:1U",
    addressLocality: "Sarıçam",
    addressRegion: "Adana",
    addressCountry: "TR",
  },
};

// Structured data so search engines can show the event (date, place, speakers, talks).
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "DSATalks",
  description: en.hero.intro,
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
  startDate: at(1, "09:30"),
  endDate: at(2, "15:00"),
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  inLanguage: ["en", "tr"],
  location: place,
  organizer: {
    "@type": "Organization",
    name: en.meta.department,
    url: site.departmentUrl,
    email: site.email,
    parentOrganization: { "@type": "CollegeOrUniversity", name: en.meta.university, url: site.universityUrl },
  },
  performer: speakers.map((speaker) => ({
    "@type": "Person",
    name: speaker.name,
    image: `${siteUrl}${speaker.photo}`,
    affiliation: { "@type": "Organization", name: speaker.affiliation.en[0] },
  })),
  subEvent: en.program.days.flatMap((day) =>
    day.sessions
      .filter((session) => session.speaker)
      .map((session) => {
        const [start, end] = session.time.split("–");
        return {
          "@type": "Event",
          name: session.title,
          startDate: at(day.n, start),
          endDate: at(day.n, end),
          location: place,
          performer: { "@type": "Person", name: speakerBySlug[session.speaker!].name },
        };
      }),
  ),
};

export default function Home() {
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
