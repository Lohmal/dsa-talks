import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/confdsa/components/ui/PageShell";
import SpeakerProfile from "@/confdsa/components/sections/SpeakerProfile";
import { displayName } from "@/confdsa/data/committees";
import { loadConferenceYear, requirePage } from "@/confdsa/server";

export async function generateMetadata({ params }: PageProps<"/[year]/speakers/[slug]">): Promise<Metadata> {
  const { year, slug } = await params;
  const { content } = await loadConferenceYear(year);
  const speaker = content.speakers.find((s) => s.slug === slug);
  return { title: speaker ? displayName(speaker, "en") : "Speaker" };
}

export default async function Page({ params }: PageProps<"/[year]/speakers/[slug]">) {
  const { year, slug } = await params;
  const content = await requirePage(year, "plenarySpeakers");
  const speaker = content.speakers.find((s) => s.slug === slug);
  if (!speaker) notFound();

  return (
    <PageShell
      titleKey="plenarySpeakers"
      parent={{ key: "plenarySpeakers", href: "/speakers" }}
      title={{ en: displayName(speaker, "en"), tr: displayName(speaker, "tr") }}
    >
      <SpeakerProfile slug={slug} />
    </PageShell>
  );
}
