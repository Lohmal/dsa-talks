// Absolute address of the site, used by metadata, the sitemap and robots.txt (server only).
// Set NEXT_PUBLIC_SITE_URL once the site has its own domain; on Vercel the production
// domain is picked up automatically until then.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");
