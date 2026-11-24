import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import ComingSoon from "@/confdsa/components/ui/ComingSoon";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Paper Publications" };

export default async function Page({ params }: PageProps<"/[year]/paper-publications">) {
  await requirePage((await params).year, "paperPublications");

  return (
    <PageShell titleKey="paperPublications">
      <ComingSoon />
    </PageShell>
  );
}
