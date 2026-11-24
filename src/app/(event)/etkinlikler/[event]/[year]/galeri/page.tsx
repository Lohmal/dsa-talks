import EventFrame from "@/components/EventFrame";
import EventGallery from "@/components/EventGallery";
import { eventMetadata, loadEventYear } from "@/lib/eventPages";

const route = { title: "Galeri – Gallery", path: "galeri" };

export async function generateMetadata({ params }: PageProps<"/etkinlikler/[event]/[year]/galeri">) {
  const p = await params;
  return eventMetadata(p.event, p.year, route);
}

// The photos and videos of one year of an event.
export default async function GalleryPage({ params }: PageProps<"/etkinlikler/[event]/[year]/galeri">) {
  const { event, year } = await params;
  const { content, base } = await loadEventYear(event, year);
  return (
    <EventFrame content={content} base={base}>
      <EventGallery />
    </EventFrame>
  );
}
