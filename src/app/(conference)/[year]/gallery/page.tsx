import type { Metadata } from "next";
import PageShell from "@/confdsa/components/ui/PageShell";
import ConferenceGallery from "@/confdsa/components/sections/ConferenceGallery";
import { requirePage } from "@/confdsa/server";

export const metadata: Metadata = { title: "Gallery" };

export default async function Page({ params }: PageProps<"/[year]/gallery">) {
  await requirePage((await params).year, "gallery");
  return (
    <PageShell titleKey="gallery">
      <ConferenceGallery />
    </PageShell>
  );
}
