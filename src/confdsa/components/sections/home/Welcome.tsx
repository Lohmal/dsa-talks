"use client";

import Container from "@/confdsa/components/ui/Container";
import FadeIn from "@/confdsa/components/ui/FadeIn";
import SectionTitle from "@/confdsa/components/ui/SectionTitle";
import { BuildingIcon, CalendarIcon, MailIcon, MapPinIcon } from "@/confdsa/components/ui/Icons";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

export default function Welcome() {
  const { m, site } = useLanguage();

  const glance = [
    { icon: CalendarIcon, label: m.home.factDate, value: m.meta.dateRange },
    { icon: MapPinIcon, label: m.home.factVenue, value: `${m.meta.venue}, ${m.meta.city}` },
    { icon: BuildingIcon, label: m.home.factOrganizer, value: m.meta.university },
    { icon: MailIcon, label: m.contact.email, value: site.email },
  ];

  return (
    <section id="about" className="relative z-10 scroll-mt-32 pb-16">
      {/* A white sheet that rises over the bottom of the hero planet, instead of fading into it. */}
      <Container>
        <div className="-mt-12 grid gap-12 rounded-2xl bg-white p-6 shadow-[0_-18px_50px_-12px_rgba(9,15,38,0.45)] ring-1 ring-navy/5 sm:p-10 lg:grid-cols-[1.5fr_1fr] lg:p-12">
        <FadeIn>
          <SectionTitle title={m.home.welcomeTitle} align="left" />
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
            {m.home.aboutText.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <aside className="overflow-hidden rounded-xl ring-1 ring-navy/10">
            <h3 className="bg-navy px-6 py-4 font-bold text-white">{m.home.glanceTitle}</h3>
            <ul className="divide-y divide-line bg-white">
              {glance.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex gap-4 px-6 py-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-brand" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
                    <p className="mt-0.5 font-semibold text-navy">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </FadeIn>
        </div>
      </Container>
    </section>
  );
}
