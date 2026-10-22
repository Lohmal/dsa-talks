"use client";

import { ExternalLink, FileText, Mail } from "lucide-react";
import PublicShell from "./PublicShell";
import { kvkk, KVKK_LINKS } from "@/content/kvkk";
import { site } from "@/config/site";
import { useLanguage } from "@/i18n/LanguageProvider";

// The KVKK information notice for the survey and certificates, in the visitor's language.
export default function KvkkView() {
  const { m, locale } = useLanguage();
  const notice = kvkk[locale];
  const links = [
    { href: KVKK_LINKS.university, label: m.kvkk.universityPage, icon: ExternalLink },
    { href: KVKK_LINKS.notice, label: m.kvkk.fullNotice, icon: FileText },
    { href: `mailto:${site.email}`, label: `${m.kvkk.eventEmail}: ${site.email}`, icon: Mail },
  ];

  return (
    <PublicShell title={m.kvkk.title} intro={m.kvkk.intro}>
      <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{notice.updated}</p>
        <p className="mt-4 text-lg leading-relaxed text-ink">{notice.intro}</p>

        <div className="mt-8 space-y-8">
          {notice.sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-xl font-extrabold tracking-[-0.01em] text-ink">{section.title}</h2>
              {section.paragraphs?.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-muted">
                  {p}
                </p>
              ))}
              {section.items && <List items={section.items} />}
              {section.after?.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.28em] text-brand">{m.kvkk.linksTitle}</h2>
          <ul className="mt-4 space-y-3">
            {links.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="inline-flex items-start gap-2.5 font-semibold text-ink underline-offset-4 hover:text-brand hover:underline"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-brand" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </PublicShell>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 leading-relaxed text-muted">
          <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
          {item}
        </li>
      ))}
    </ul>
  );
}
