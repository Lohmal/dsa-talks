import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import SpeakerGrid from "@/confdsa/components/sections/SpeakerGrid";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Keynote & Invited Speakers" };

export default async function Page({ params }: PageProps<"/[year]/speakers">) {
  await requirePage((await params).year, "plenarySpeakers");
  return (
    <PageShell titleKey="plenarySpeakers">
      <SpeakerGrid />
    </PageShell>
  );
}
