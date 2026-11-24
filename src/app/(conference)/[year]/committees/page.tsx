import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import CommitteesOverview from "@/confdsa/components/sections/committees/CommitteesOverview";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Committees" };

export default async function Page({ params }: PageProps<"/[year]/committees">) {
  await requirePage((await params).year, "committees");
  return (
    <PageShell titleKey="committees">
      <CommitteesOverview />
    </PageShell>
  );
}
