"use client";

import Image from "next/image";
import { Container, FadeIn } from "./ui";
import { committees, displayName, initials, type Member } from "@/data/committees";
import { useLanguage } from "@/i18n/LanguageProvider";

// The committees page: a red title band, quick links to each committee, then the members
// as cards (photo or initials, name with title, affiliation).
export default function Committees() {
  const { m } = useLanguage();
  const t = m.committees;

  const groups = [
    { id: "onur-kurulu", title: t.honorary, sections: [{ members: committees.honoraryChairs, featured: true }] },
    { id: "program-kurulu", title: t.program, sections: [{ members: committees.programCommittee, featured: false }] },
    {
      id: "duzenleme-kurulu",
      title: t.organizing,
      sections: [
        { heading: t.coChairs, members: committees.coChairs, featured: true },
        { heading: t.members, members: committees.localCommittee, featured: false },
      ],
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(115deg,#e41f35_0%,#d7182a_45%,#ab1022_100%)] py-14 text-white sm:py-20">
        <svg aria-hidden viewBox="0 0 600 600" className="absolute -right-48 -top-40 size-152 opacity-60">
          {[120, 200, 280].map((r) => (
            <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="white" strokeOpacity="0.14" />
          ))}
        </svg>
        <Container className="relative">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.38em] text-white/85">
            <span aria-hidden className="h-0.5 w-8 bg-white" />
            DSATalks
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-6xl">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-white/85 sm:text-lg">{t.intro}</p>
          <nav aria-label={t.title} className="mt-8 flex flex-wrap gap-2">
            {groups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full bg-white/12 px-4 py-2 text-sm font-bold ring-1 ring-white/25 transition-colors hover:bg-white hover:text-ink"
              >
                {group.title}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      <div className="bg-surface py-14 sm:py-20">
        <Container className="space-y-16 sm:space-y-20">
          {groups.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-28">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="flex items-center gap-3 text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl">
                  <span aria-hidden className="h-8 w-1.5 rounded-full bg-brand" />
                  {group.title}
                </h2>
                <p className="text-sm font-semibold text-muted">
                  {group.sections.reduce((n, s) => n + s.members.length, 0)} {t.count}
                </p>
              </div>
              <div className="mt-8 space-y-10">
                {group.sections.map((section, index) => (
                  <div key={index}>
                    {"heading" in section && section.heading && (
                      <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[0.3em] text-brand">{section.heading}</h3>
                    )}
                    <MemberGrid members={section.members} featured={section.featured} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </Container>
      </div>
    </>
  );
}

function MemberGrid({ members, featured }: { members: Member[]; featured: boolean }) {
  const { locale } = useLanguage();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, index) => {
        const name = displayName(member, locale);
        return (
          <li key={member.given + member.surname}>
            <FadeIn delay={Math.min(index, 8) * 0.03} className="h-full">
              <div
                className={`flex h-full items-center gap-4 rounded-2xl bg-white shadow-card ring-1 ring-ink/5 transition-transform duration-300 hover:-translate-y-0.5 ${
                  featured ? "p-6" : "p-4"
                }`}
              >
                <Avatar member={member} alt={name} size={featured ? 80 : 56} />
                <div className="min-w-0">
                  <p className={`font-bold leading-snug text-ink ${featured ? "text-lg" : ""}`}>{name}</p>
                  {member.affiliation && <p className="mt-0.5 text-sm leading-snug text-muted">{member.affiliation[locale]}</p>}
                </div>
              </div>
            </FadeIn>
          </li>
        );
      })}
    </ul>
  );
}

function Avatar({ member, alt, size }: { member: Member; alt: string; size: number }) {
  const className = "relative shrink-0 overflow-hidden rounded-full ring-[3px] ring-brand/80";
  if (member.photo) {
    return (
      <span className={className} style={{ width: size, height: size }}>
        <Image src={member.photo} alt={alt} width={size * 2} height={size * 2} unoptimized className="size-full object-cover" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`${className} grid place-items-center bg-ink font-black text-white`}
      style={{ width: size, height: size, fontSize: size / 3 }}
    >
      {initials(member)}
    </span>
  );
}
