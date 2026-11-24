"use client";

import Link from "@/confdsa/components/ui/Link";
import FadeIn from "@/confdsa/components/ui/FadeIn";
import { ArrowRightIcon } from "@/confdsa/components/ui/Icons";
import { committeeOrder, committeeSize } from "@/confdsa/data/committees";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Entry page for the Committees menu: one card per committee, linking to its page.
export default function CommitteesOverview() {
  const { m, committees } = useLanguage();

  return (
    <div>
      <p className="max-w-2xl text-lg text-muted">{m.committees.intro}</p>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {committeeOrder.map(({ id, href }, index) => (
          <li key={id} className="h-full">
            <FadeIn delay={index * 0.06} className="h-full">
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl bg-white p-7 shadow-card ring-1 ring-navy/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/15"
              >
                <span className="text-sm font-bold text-brand">{String(index + 1).padStart(2, "0")}</span>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-navy">{m.nav[id]}</h2>
                <p className="mt-1 text-sm text-muted">
                  {committeeSize(committees, id)} {m.committees.members}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  {m.committees.view}
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </FadeIn>
          </li>
        ))}
      </ul>
    </div>
  );
}
