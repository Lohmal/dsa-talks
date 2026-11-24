import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { conferenceContent, findEdition } from "@/lib/editions";
import { isPageEnabled, type NavKey } from "./config/navigation";

// The conference year behind a URL: "current" (rewritten from /, /program, ...) or "2026".
export const loadConferenceYear = cache(async (year: string) => {
  await connection();
  if (year !== "current" && !/^\d{4}$/.test(year)) notFound();
  const edition = await findEdition("confdsa", year === "current" ? undefined : Number(year));
  if (!edition) notFound();
  return { edition, content: conferenceContent(edition), base: year === "current" ? "" : `/${year}` };
});

// 404 for a page that is not published in this year (admin panel → Metinler → pages).
export async function requirePage(year: string, key: NavKey) {
  const { content } = await loadConferenceYear(year);
  if (!isPageEnabled(content.pages, key)) notFound();
  return content;
}
