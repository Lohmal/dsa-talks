import type { Metadata } from "next";
import EventFrame from "@/components/EventFrame";
import EventCommittees from "@/components/EventCommittees";
import { loadEventYear } from "@/lib/eventPages";

export const metadata: Metadata = { title: "Kurullar – Committees" };

export default async function CommitteesPage({ params }: PageProps<"/etkinlikler/[event]/kurullar">) {
  const { event } = await params;
  const { content, base } = await loadEventYear(event);
  return (
    <EventFrame content={content} base={base}>
      <EventCommittees />
    </EventFrame>
  );
}
