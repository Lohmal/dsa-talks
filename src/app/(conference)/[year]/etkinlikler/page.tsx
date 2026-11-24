import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import EventsList from "@/confdsa/components/sections/EventsList";
import { requirePage } from "@/confdsa/server";
import { loadEventCards } from "@/lib/eventPages";

export const metadata: Metadata = { title: "Etkinlikler – Events" };

// /etkinlikler (rewritten to the current conference year, which gives the menu and footer).
export default async function Page({ params }: PageProps<"/[year]/etkinlikler">) {
  await requirePage((await params).year, "events");
  return (
    <PageShell titleKey="events">
      <EventsList events={await loadEventCards()} />
    </PageShell>
  );
}
