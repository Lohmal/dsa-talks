import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import ComingSoon from "@/confdsa/components/ui/ComingSoon";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Social Activities" };

export default async function Page({ params }: PageProps<"/[year]/social-activities">) {
  await requirePage((await params).year, "socialActivities");

  return (
    <PageShell titleKey="socialActivities">
      <ComingSoon />
    </PageShell>
  );
}
