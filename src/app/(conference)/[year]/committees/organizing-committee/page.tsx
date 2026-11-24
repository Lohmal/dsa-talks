import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import CommitteeMembers from "@/confdsa/components/sections/committees/CommitteeMembers";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Organizing Committee" };

export default async function Page({ params }: PageProps<"/[year]/committees/organizing-committee">) {
  await requirePage((await params).year, "localCommittee");
  return (
    <PageShell titleKey="localCommittee" parent={{ key: "committees", href: "/committees" }}>
      <CommitteeMembers id="localCommittee" />
    </PageShell>
  );
}
