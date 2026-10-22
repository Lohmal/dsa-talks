"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Mail } from "lucide-react";
import { sectionHref } from "./MobileMenu";
import { Container, LanguageSwitcher, Wordmark } from "./ui";
import { site } from "@/config/site";
import { useLanguage } from "@/i18n/LanguageProvider";

function InstagramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" strokeLinecap="round" />
    </svg>
  );
}

const sections = ["about", "speakers", "program", "committees", "venue"] as const;

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-extrabold uppercase tracking-[0.3em] text-brand-soft">{children}</h2>;
}

// Navy closing band: the wordmark with the slogan, page links, contact details and the
// organizer, then a bottom row with the copyright, the poster's closing line and the language switch.
export default function Footer() {
  const { m } = useLanguage();
  const onHome = usePathname() === "/";
  const contacts = [
    { href: `mailto:${site.email}`, icon: Mail, label: site.email },
    { href: site.websiteUrl, icon: Globe, label: site.websiteUrl.replace("https://", "") },
    { href: `https://www.instagram.com/${site.instagram}`, icon: InstagramIcon, label: `@${site.instagram}` },
  ];
  const external = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {});

  return (
    <footer className="relative overflow-hidden bg-ink-deep text-white">
      <span aria-hidden className="absolute inset-y-0 left-0 w-2 bg-brand sm:w-3" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[22px_22px]"
      />

      <Container className="relative">
        <div className="grid gap-12 py-16 sm:grid-cols-2 sm:py-20 lg:grid-cols-[1.4fr_0.8fr_1fr_1.1fr] lg:gap-10">
          <div>
            <Wordmark light className="text-4xl" />
            <p className="mt-4 max-w-xs text-lg font-semibold leading-snug text-white/85">{m.meta.slogan}</p>
            <p className="mt-5 text-sm leading-relaxed text-white/55">
              {m.meta.dateRange}
              <br />
              {m.meta.venueFull}
            </p>
          </div>

          <nav aria-label={m.footer.explore}>
            <ColumnTitle>{m.footer.explore}</ColumnTitle>
            <ul className="mt-5 space-y-3">
              {sections.map((id) => (
                <li key={id}>
                  <Link href={sectionHref(id, onHome)} className="font-medium text-white/75 transition-colors hover:text-white">
                    {m.nav[id]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <ColumnTitle>{m.footer.contact}</ColumnTitle>
            <ul className="mt-5 space-y-3">
              {contacts.map(({ href, icon: Icon, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    {...external(href)}
                    className="inline-flex items-center gap-3 font-medium text-white/75 transition-colors hover:text-white"
                  >
                    <Icon className="size-4 shrink-0 text-brand-soft" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnTitle>{m.footer.organizer}</ColumnTitle>
            <a href={site.departmentUrl} {...external(site.departmentUrl)} className="group mt-5 block">
              <span className="text-lg font-bold leading-snug group-hover:underline group-hover:underline-offset-4">
                {m.meta.department}
              </span>
            </a>
            <a
              href={site.universityUrl}
              {...external(site.universityUrl)}
              className="mt-2 block text-sm leading-relaxed text-white/55 hover:text-white"
            >
              {m.meta.university}
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 border-t border-white/10 py-7 text-sm md:flex-row md:justify-between">
          <p className="text-center text-white/45 md:text-left">
            © 2026 {m.meta.name} · {m.meta.universityShort}. {m.footer.rights}{" "}
            <Link href="/kvkk" className="whitespace-nowrap text-white/70 underline-offset-4 hover:text-white hover:underline">
              {m.kvkk.link}
            </Link>
          </p>
          <p className="font-light italic text-white/70">{m.footer.tagline}</p>
          <LanguageSwitcher light />
        </div>
      </Container>
    </footer>
  );
}
