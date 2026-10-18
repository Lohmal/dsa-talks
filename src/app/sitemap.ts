import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/url";
import { speakers } from "@/data/speakers";

// One page; the speaker photos are listed so image search can pick them up.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: speakers.map((speaker) => `${siteUrl}${speaker.photo}`),
    },
  ];
}
