import type { Metadata } from "next";
import EventFrame from "@/components/EventFrame";
import { loadEventYear } from "@/lib/eventPages";
import KvkkView from "@/components/KvkkView";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | CONFDSA",
  description: "CONFDSA ve etkinliklerinin anket ve sertifikaları için kişisel verilerin korunması aydınlatma metni.",
  alternates: { canonical: "/kvkk" },
};

export default async function KvkkPage() {
  const { content, base } = await loadEventYear("dsatalks");
  return (
    <EventFrame content={content} base={base}>
      <KvkkView />
    </EventFrame>
  );
}
