"use client";

import { setConsent, useConsent } from "@/lib/consent";
import { CalendarDays, Globe, Mail, Map as MapIcon, MapPin, Navigation, type LucideIcon } from "lucide-react";
import { Container, FadeIn, SectionHeading } from "./ui";
import { site } from "@/config/site";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function Venue() {
  const { m, locale } = useLanguage();
  const query = encodeURIComponent(site.mapQuery);
  const mapSrc = `https://maps.google.com/maps?q=${query}&hl=${locale}&z=16&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  const details: { icon: LucideIcon; label: string; value: string; href?: string }[] = [
    { icon: MapPin, label: m.venue.addressLabel, value: m.meta.address },
    { icon: CalendarDays, label: m.venue.dateLabel, value: `${m.meta.dateRange} · ${m.meta.weekdays}` },
    { icon: Mail, label: m.venue.emailLabel, value: site.email, href: `mailto:${site.email}` },
    { icon: Globe, label: m.venue.websiteLabel, value: site.websiteUrl.replace("https://", ""), href: site.websiteUrl },
  ];

  return (
    <section id="venue" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={m.venue.eyebrow} title={m.venue.title} />

        <FadeIn className="mt-14">
          <div className="grid overflow-hidden rounded-3xl shadow-card ring-1 ring-ink/5 lg:grid-cols-[0.9fr_1.4fr]">
            <div className="relative flex flex-col justify-between gap-10 overflow-hidden bg-brand p-8 text-white sm:p-10">
              <svg aria-hidden viewBox="0 0 400 400" className="absolute -bottom-40 -right-40 size-112">
                {[80, 140, 200].map((r) => (
                  <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="white" strokeOpacity="0.14" />
                ))}
              </svg>
              <div className="relative">
                <p className="text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl">{m.meta.university}</p>
                <dl className="mt-8 space-y-5">
                  {details.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex gap-4">
                      <Icon className="mt-0.5 size-5 shrink-0" />
                      <div>
                        <dt className="text-xs font-extrabold uppercase tracking-[0.28em] text-white/70">{label}</dt>
                        <dd className="mt-1 font-medium">
                          {href ? (
                            <a
                              href={href}
                              {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                              className="underline-offset-4 hover:underline"
                            >
                              {value}
                            </a>
                          ) : (
                            value
                          )}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
              <a
                href={directions}
                target="_blank"
                rel="noreferrer"
                className="relative inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-ink transition-transform hover:-translate-y-0.5"
              >
                <Navigation className="size-4" />
                {m.venue.directions}
              </a>
            </div>
            <MapEmbed src={mapSrc} title={m.venue.mapTitle} />
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}

// Google Maps sets its own cookies: the map loads by itself once cookies are accepted
// (remembered in the browser); otherwise a placeholder offers to accept and show it.
function MapEmbed({ src, title }: { src: string; title: string }) {
  const { m } = useLanguage();
  const consent = useConsent();

  if (consent === "accepted") {
    return (
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-80 w-full border-0 lg:h-full lg:min-h-112"
      />
    );
  }

  return (
    <div className="relative grid h-80 place-items-center overflow-hidden bg-surface px-6 text-center lg:h-full lg:min-h-112">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 bg-[linear-gradient(#e4e8ef_1px,transparent_1px),linear-gradient(90deg,#e4e8ef_1px,transparent_1px)] bg-size-[32px_32px]"
      />
      <div className="relative max-w-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-brand shadow-card ring-1 ring-line">
          <MapPin className="size-6" />
        </span>
        <p className="mt-4 text-sm text-muted">{m.venue.mapNotice}</p>
        <button
          type="button"
          onClick={() => setConsent("accepted")}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy"
        >
          <MapIcon className="size-4" />
          {m.venue.showMap}
        </button>
      </div>
    </div>
  );
}
