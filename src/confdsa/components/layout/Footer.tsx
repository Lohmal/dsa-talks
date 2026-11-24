"use client";

import Link from "@/confdsa/components/ui/Link";
import Container from "@/confdsa/components/ui/Container";
import {
  BuildingIcon,
  CalendarIcon,
  GlobeIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
} from "@/confdsa/components/ui/Icons";
import Logo from "./Logo";
import { navIcons } from "./navIcons";
import { visibleNavigation } from "@/confdsa/config/navigation";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

const linkClass = "group inline-flex items-start gap-2.5 transition-colors hover:text-white";
const iconClass = "mt-0.5 size-4 shrink-0 text-white/45 transition-colors group-hover:text-brand";

export default function Footer() {
  const { m, site, pages } = useLanguage();
  // Committees stays a single link here; other groups (e.g. Registration) list their pages.
  const links = visibleNavigation(pages).flatMap((item) =>
    item.children && item.key !== "committees" ? item.children : [item],
  );

  const contacts = [
    { icon: MailIcon, label: site.email, href: `mailto:${site.email}`, external: false },
    { icon: GlobeIcon, label: site.url.replace("https://", ""), href: site.url, external: false },
    { icon: InstagramIcon, label: `@${site.instagram}`, href: `https://instagram.com/${site.instagram}`, external: true },
  ];

  return (
    <footer className="bg-navy text-white/80">
      <div aria-hidden className="h-1 bg-brand" />
      <Container className="grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo light size={64} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">{m.meta.conferenceName}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2.5 font-semibold text-white">
              <CalendarIcon className="size-4 shrink-0 text-brand" />
              {m.meta.dateRange}
            </li>
            <li className="flex items-start gap-2.5">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                {m.meta.venue}, {m.meta.city}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">{m.footer.quickLinks}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {links.map((item) => {
              const Icon = navIcons[item.key];
              return (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    <Icon className={iconClass} />
                    {m.nav[item.key]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">{m.footer.contact}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {contacts.map(({ icon: Icon, label, href, external }) => (
              <li key={href}>
                <a
                  href={href}
                  className={linkClass}
                  {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <Icon className={iconClass} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs uppercase tracking-wider text-white/60">{m.footer.organizedBy}</p>
          <a
            href={site.departmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-start gap-2.5 text-sm font-semibold text-white hover:underline"
          >
            <BuildingIcon className="mt-0.5 size-4 shrink-0 text-brand" />
            {m.meta.department}
          </a>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-1 py-5 text-xs text-white/60 md:flex-row md:justify-between">
          <span>
            © {m.meta.year} {m.meta.university}. {m.footer.rights}
          </span>
        </Container>
      </div>
    </footer>
  );
}
