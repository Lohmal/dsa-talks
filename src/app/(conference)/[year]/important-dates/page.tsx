import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import ImportantDatesList from "@/confdsa/components/sections/ImportantDatesList";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Important Dates" };

export default async function Page({ params }: PageProps<"/[year]/important-dates">) {
  await requirePage((await params).year, "importantDates");

  return (
    <PageShell titleKey="importantDates">
      <ImportantDatesList />
    </PageShell>
  );
}
