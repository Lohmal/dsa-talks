import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import CommitteeMembers from "@/confdsa/components/sections/committees/CommitteeMembers";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Program Committee" };

export default async function Page({ params }: PageProps<"/[year]/committees/program-committee">) {
  await requirePage((await params).year, "programCommittee");
  return (
    <PageShell titleKey="programCommittee" parent={{ key: "committees", href: "/committees" }}>
      <CommitteeMembers id="programCommittee" />
    </PageShell>
  );
}
