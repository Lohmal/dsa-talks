import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { siteUrl } from "@/config/url";
import { visibleNavigation, type NavItem } from "@/confdsa/config/navigation";
import { speakerHref } from "@/confdsa/data/speakers";
import { loadConferenceYear } from "@/confdsa/server";
import { loadEventCards } from "@/lib/eventPages";

// The published CONFDSA pages of the current year (from its menu) with the speaker profiles,
// then every event page with its committees.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const { content } = await loadConferenceYear("current");
  const pages = (items: NavItem[]): string[] => items.flatMap((item) => [item.href, ...pages(item.children ?? [])]);
  const events = await loadEventCards();

  const paths = [
    ...new Set([
      ...pages(visibleNavigation(content.pages)),
      ...content.speakers.map((speaker) => speakerHref(speaker.slug)),
      ...events.flatMap((event) => [`/etkinlikler/${event.slug}`, `/etkinlikler/${event.slug}/kurullar`]),
      "/kvkk",
    ]),
  ];

  return paths.map((path) => ({
    url: path === "/" ? siteUrl : `${siteUrl}${path}`,
    changeFrequency: path === "/" || path === "/program" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/kvkk" ? 0.2 : path.split("/").length > 2 ? 0.6 : 0.8,
  }));
}
