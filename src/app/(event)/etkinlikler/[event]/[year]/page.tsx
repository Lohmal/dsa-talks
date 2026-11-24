import EventFrame from "@/components/EventFrame";
import EventHome from "@/components/EventHome";
import { eventMetadata, loadEventYear } from "@/lib/eventPages";

export async function generateMetadata({ params }: PageProps<"/etkinlikler/[event]/[year]">) {
  const { event, year } = await params;
  return eventMetadata(event, year);
}

// /etkinlikler/<event>/<year>: one year of the event (also earlier ones).
export default async function EventYearPage({ params }: PageProps<"/etkinlikler/[event]/[year]">) {
  const { event, year } = await params;
  const { content, base } = await loadEventYear(event, year);
  return (
    <EventFrame content={content} base={base}>
      <EventHome content={content} base={base} />
    </EventFrame>
  );
}
