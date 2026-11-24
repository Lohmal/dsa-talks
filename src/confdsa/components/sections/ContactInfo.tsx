"use client";

import Button from "@/confdsa/components/ui/Button";
import FadeIn from "@/confdsa/components/ui/FadeIn";
import {
  BuildingIcon,
  GlobeIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  NavigationIcon,
} from "@/confdsa/components/ui/Icons";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

export default function ContactInfo() {
  const { m, site } = useLanguage();
  const mapQuery = encodeURIComponent(site.mapQuery);
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(m.home.emailSubject)}`;

  const details = [
    {
      icon: GlobeIcon,
      label: m.contact.website,
      value: site.url.replace("https://", ""),
      href: site.url,
    },
    {
      icon: InstagramIcon,
      label: m.contact.instagram,
      value: `@${site.instagram}`,
      href: `https://instagram.com/${site.instagram}`,
    },
    { icon: BuildingIcon, label: m.contact.venue, value: `${m.meta.venue}, ${m.meta.university}` },
    { icon: MapPinIcon, label: m.contact.address, value: m.contact.addressValue },
  ];

  return (
    <div>
      <p className="max-w-2xl text-lg text-muted">{m.contact.intro}</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <FadeIn className="flex flex-col gap-5">
          {/* E-mail: the main way to reach the committee */}
          <div className="relative overflow-hidden rounded-2xl bg-navy p-7 text-white shadow-card">
            <div
              aria-hidden
              className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[20px_20px]"
            />
            <div className="relative">
              <span className="grid size-11 place-items-center rounded-xl bg-brand">
                <MailIcon className="size-5" />
              </span>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">{m.contact.emailTitle}</h2>
              <p className="mt-1 text-white/70">{m.contact.emailText}</p>
              <a href={mailto} className="mt-4 block break-all text-lg font-semibold hover:underline">
                {site.email}
              </a>
              <Button href={mailto} variant="light" className="mt-6 rounded-lg">
                <MailIcon className="size-4" />
                {m.contact.sendEmail}
              </Button>
            </div>
          </div>

          <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/5">
            {details.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex items-start gap-4 p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 block font-semibold text-navy hover:text-brand"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-0.5 font-semibold text-navy">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={0.1} className="flex min-h-105 flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/5">
          <iframe
            title={`${m.contact.mapTitle}: ${m.meta.university}`}
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="min-h-85 w-full flex-1 border-0"
          />
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">{m.contact.mapTitle}</p>
              <p className="mt-0.5 font-semibold text-navy">
                {m.meta.venue}, {m.meta.city}
              </p>
            </div>
            <Button
              href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
              external
              className="rounded-lg"
            >
              <NavigationIcon className="size-4" />
              {m.contact.directions}
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
