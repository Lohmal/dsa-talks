import type { Metadata } from "next";
import KvkkView from "@/components/KvkkView";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | DSATalks",
  description: "DSATalks anketi ve sertifikaları için kişisel verilerin korunması aydınlatma metni.",
  alternates: { canonical: "/kvkk" },
};

export default function KvkkPage() {
  return <KvkkView />;
}
