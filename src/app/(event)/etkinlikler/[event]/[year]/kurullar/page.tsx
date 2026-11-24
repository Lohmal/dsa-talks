import EventFrame from "@/components/EventFrame";
import EventCommittees from "@/components/EventCommittees";
import { eventMetadata, loadEventYear } from "@/lib/eventPages";

export async function generateMetadata({ params }: PageProps<"/etkinlikler/[event]/[year]/kurullar">) {
  const p = await params;
  return eventMetadata(p.event, p.year, { title: "Kurullar – Committees", path: "kurullar" });
}

export default async function CommitteesYearPage({ params }: PageProps<"/etkinlikler/[event]/[year]/kurullar">) {
  const { event, year } = await params;
  const { content, base } = await loadEventYear(event, year);
  return (
    <EventFrame content={content} base={base}>
      <EventCommittees />
    </EventFrame>
  );
}
