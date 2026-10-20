import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/url";
import { speakers } from "@/data/speakers";

// The event page (with the speaker photos, so image search can pick them up) and the committees.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: speakers.map((speaker) => `${siteUrl}${speaker.photo}`),
    },
    {
      url: `${siteUrl}/kurullar`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
