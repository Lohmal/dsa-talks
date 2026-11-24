import { notFound, redirect } from "next/navigation";
import { findEdition, surveyPath } from "@/lib/editions";

// /etkinlikler/<event>/anket: the survey of the event's current year (/anket for DSATalks 2026).
export default async function Page({ params }: PageProps<"/etkinlikler/[event]/anket">) {
  const edition = await findEdition((await params).event);
  if (!edition || edition.event.template !== "EVENT") notFound();
  redirect(surveyPath(edition));
}
