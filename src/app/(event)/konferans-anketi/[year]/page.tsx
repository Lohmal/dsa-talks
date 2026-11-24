import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SurveyPage from "@/components/survey/SurveyPage";
import { findEdition } from "@/lib/editions";

export const metadata: Metadata = {
  title: "Etkinlik Memnuniyet Anketi – Event Satisfaction Survey | CONFDSA",
  robots: { index: false, follow: false },
};

// The survey of a CONFDSA year, shown at /<year>/anket (rewrite in next.config.ts) with the
// survey design of the event template.
export default async function Page({ params }: PageProps<"/konferans-anketi/[year]">) {
  const { year } = await params;
  const edition = /^\d{4}$/.test(year) ? await findEdition("confdsa", Number(year)) : null;
  if (!edition) notFound();
  return <SurveyPage edition={edition} />;
}
