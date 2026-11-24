import EventFrame from "@/components/EventFrame";
import EventHome from "@/components/EventHome";
import { eventMetadata, loadEventYear } from "@/lib/eventPages";

export async function generateMetadata({ params }: PageProps<"/etkinlikler/[event]">) {
  return eventMetadata((await params).event);
}

// /etkinlikler/<event>: the event's current year.
export default async function EventPage({ params }: PageProps<"/etkinlikler/[event]">) {
  const { event } = await params;
  const { content, base } = await loadEventYear(event);
  return (
    <EventFrame content={content} base={base}>
      <EventHome content={content} base={base} />
    </EventFrame>
  );
}
