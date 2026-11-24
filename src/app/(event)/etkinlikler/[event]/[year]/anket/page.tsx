import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SurveyPage from "@/components/survey/SurveyPage";
import { findEdition } from "@/lib/editions";

export const metadata: Metadata = {
  title: "Etkinlik Memnuniyet Anketi – Event Satisfaction Survey",
  robots: { index: false, follow: false },
};

// /etkinlikler/<event>/<year>/anket: the survey of one event year (QR code on the admin panel).
export default async function Page({ params }: PageProps<"/etkinlikler/[event]/[year]/anket">) {
  const { event, year } = await params;
  const edition = /^\d{4}$/.test(year) ? await findEdition(event, Number(year)) : null;
  if (!edition || edition.event.template !== "EVENT") notFound();
  return <SurveyPage edition={edition} />;
}
