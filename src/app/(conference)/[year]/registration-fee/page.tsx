import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import InfoPage from "@/confdsa/components/sections/InfoPage";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Registration Fee" };

export default async function Page({ params }: PageProps<"/[year]/registration-fee">) {
  await requirePage((await params).year, "registrationFee");

  return (
    <PageShell titleKey="registrationFee">
      <InfoPage page="registrationFee" />
    </PageShell>
  );
}
