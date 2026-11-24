import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import CommitteeMembers from "@/confdsa/components/sections/committees/CommitteeMembers";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Honorary Committee" };

export default async function Page({ params }: PageProps<"/[year]/committees/honorary-committee">) {
  await requirePage((await params).year, "honoraryChairs");
  return (
    <PageShell titleKey="honoraryChairs" parent={{ key: "committees", href: "/committees" }}>
      <CommitteeMembers id="honoraryChairs" />
    </PageShell>
  );
}
