import type { Metadata } from "next";
import EventFrame from "@/components/EventFrame";
import EventCommittees from "@/components/EventCommittees";
import { loadEventYear } from "@/lib/eventPages";

export const metadata: Metadata = { title: "Kurullar – Committees" };

export default async function CommitteesYearPage({ params }: PageProps<"/etkinlikler/[event]/[year]/kurullar">) {
  const { event, year } = await params;
  const { content, base } = await loadEventYear(event, year);
  return (
    <EventFrame content={content} base={base}>
      <EventCommittees />
    </EventFrame>
  );
}
