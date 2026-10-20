import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/url";

export default function robots(): MetadataRoute.Robots {
  return {
    // The survey (reached by QR code), the admin panel and the certificate downloads stay out of search results.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/anket", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
