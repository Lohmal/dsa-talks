import EventFrame from "@/components/EventFrame";
import EventGallery from "@/components/EventGallery";
import { eventMetadata, loadEventYear } from "@/lib/eventPages";

const route = { title: "Galeri – Gallery", path: "galeri" };

export async function generateMetadata({ params }: PageProps<"/etkinlikler/[event]/galeri">) {
  const p = await params;
  return eventMetadata(p.event, undefined, route);
}

// The photos and videos of an event's current year.
export default async function GalleryPage({ params }: PageProps<"/etkinlikler/[event]/galeri">) {
  const { event } = await params;
  const { content, base } = await loadEventYear(event);
  return (
    <EventFrame content={content} base={base}>
      <EventGallery />
    </EventFrame>
  );
}
