import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import InfoPage from "@/confdsa/components/sections/InfoPage";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Accommodation" };

export default async function Page({ params }: PageProps<"/[year]/accommodation">) {
  await requirePage((await params).year, "accommodation");

  return (
    <PageShell titleKey="accommodation">
      <InfoPage page="accommodation" />
    </PageShell>
  );
}
