import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import ComingSoon from "@/confdsa/components/ui/ComingSoon";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Accommodation" };

export default async function Page({ params }: PageProps<"/[year]/accommodation">) {
  await requirePage((await params).year, "accommodation");

  return (
    <PageShell titleKey="accommodation">
      <ComingSoon />
    </PageShell>
  );
}
