import EventFrame from "@/components/EventFrame";
import EventCommittees from "@/components/EventCommittees";
import { eventMetadata, loadEventYear } from "@/lib/eventPages";

export async function generateMetadata({ params }: PageProps<"/etkinlikler/[event]/kurullar">) {
  const p = await params;
  return eventMetadata(p.event, undefined, { title: "Kurullar – Committees", path: "kurullar" });
}

export default async function CommitteesPage({ params }: PageProps<"/etkinlikler/[event]/kurullar">) {
  const { event } = await params;
  const { content, base } = await loadEventYear(event);
  return (
    <EventFrame content={content} base={base}>
      <EventCommittees />
    </EventFrame>
  );
}
