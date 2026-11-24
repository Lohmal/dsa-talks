import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import InfoPage from "@/confdsa/components/sections/InfoPage";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Awards" };

export default async function Page({ params }: PageProps<"/[year]/awards">) {
  await requirePage((await params).year, "awards");

  return (
    <PageShell titleKey="awards">
      <InfoPage page="awards" />
    </PageShell>
  );
}
