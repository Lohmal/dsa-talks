"use client";

import FadeIn from "@/confdsa/components/ui/FadeIn";
import Avatar from "@/confdsa/components/ui/Avatar";
import {
  committeeSize,
  displayName,
  initials,
  type CommitteeId,
  type Member,
} from "@/confdsa/data/committees";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Members of one committee: photo (or initials), name with title, affiliation.
// The Organizing Committee page starts with its co-chairs, then lists the other members.
export default function CommitteeMembers({ id }: { id: CommitteeId }) {
  const { m, committees } = useLanguage();

  const groups: { heading?: string; members: Member[]; featured: boolean }[] =
    id === "localCommittee"
      ? [
          { heading: m.nav.coChairs, members: committees.coChairs, featured: true },
          { heading: m.committees.membersHeading, members: committees.localCommittee, featured: false },
        ]
      : [{ members: committees[id], featured: id === "honoraryChairs" }];

  return (
    <FadeIn>
      <p className="mb-8 text-sm font-semibold text-muted">
        {committeeSize(committees, id)} {m.committees.members}
      </p>
      <div className="space-y-12">
        {groups.map((group) => (
          <section key={group.heading ?? id}>
            {group.heading && (
              <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-navy">
                <span aria-hidden className="h-6 w-1 rounded-full bg-brand" />
                {group.heading}
              </h2>
            )}
            <MemberList members={group.members} featured={group.featured} />
          </section>
        ))}
      </div>
    </FadeIn>
  );
}

function MemberList({ members, featured }: { members: Member[]; featured: boolean }) {
  const { locale } = useLanguage();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const name = displayName(member, locale);
        return (
          <li
            key={member.given + member.surname}
            className={`flex items-center gap-4 rounded-2xl bg-white shadow-card ring-1 ring-navy/5 ${featured ? "p-6" : "p-4"}`}
          >
            <Avatar
              photo={member.photo}
              initials={initials(member)}
              alt={name}
              sizes={featured ? 80 : 64}
              className={`shadow-md ring-2 ring-white ${featured ? "size-20" : "size-14"}`}
              textClassName={featured ? "text-xl" : "text-base"}
            />
            <div className="min-w-0">
              <p className={`font-semibold text-navy ${featured ? "text-lg" : ""}`}>{name}</p>
              {member.affiliation && <p className="mt-0.5 text-sm text-muted">{member.affiliation[locale]}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
