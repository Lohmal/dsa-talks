import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import InfoPage from "@/confdsa/components/sections/InfoPage";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Paper Publications" };

export default async function Page({ params }: PageProps<"/[year]/paper-publications">) {
  await requirePage((await params).year, "paperPublications");

  return (
    <PageShell titleKey="paperPublications">
      <InfoPage page="paperPublications" />
    </PageShell>
  );
}
