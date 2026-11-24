import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { conferenceDefaults } from "./content";
import { isPageEnabled, type NavKey } from "./config/navigation";

// The conference year behind a URL: "current" (rewritten from /, /program, ...) or "2026".
// shortcut: until the years are in the database (phase 2), every year shows the defaults.
export const loadConferenceYear = cache(async (year: string) => {
  if (year !== "current" && !/^\d{4}$/.test(year)) notFound();
  return { content: conferenceDefaults(), base: year === "current" ? "" : `/${year}` };
});

// 404 for a page that is not published in this year (admin panel → Metinler → pages).
export async function requirePage(year: string, key: NavKey) {
  const { content } = await loadConferenceYear(year);
  if (!isPageEnabled(content.pages, key)) notFound();
  return content;
}
