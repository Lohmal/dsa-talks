import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SurveyPage from "@/components/survey/SurveyPage";
import { findEdition } from "@/lib/editions";

export const metadata: Metadata = {
  title: "Etkinlik Memnuniyet Anketi | DSATalks",
  description: "DSATalks Etkinlik Memnuniyet Anketi – Event Satisfaction Survey",
  robots: { index: false, follow: false },
};

// The QR codes printed for DSATalks 2026 point here; later years have their own address
// (/etkinlikler/<event>/<year>/anket).
export default async function Page() {
  const edition = await findEdition("dsatalks", 2026);
  if (!edition) notFound();
  return <SurveyPage edition={edition} />;
}
