import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import InfoPage from "@/confdsa/components/sections/InfoPage";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Social Activities" };

export default async function Page({ params }: PageProps<"/[year]/social-activities">) {
  await requirePage((await params).year, "socialActivities");

  return (
    <PageShell titleKey="socialActivities">
      <InfoPage page="socialActivities" />
    </PageShell>
  );
}
