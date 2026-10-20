import "server-only";
import { headers } from "next/headers";
import { siteUrl } from "@/config/url";

// The address visitors use for this site: NEXT_PUBLIC_SITE_URL when set, otherwise the host
// of the current request (so links and QR codes work on Vercel, Docker or a custom domain).
export async function publicOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return siteUrl;
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return siteUrl;
    const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.|\[::1\])/.test(host) ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return siteUrl; // outside a request (scripts)
  }
}

export const verifyUrl = (origin: string, certificateNo: string) =>
  `${origin}/dogrula?no=${encodeURIComponent(certificateNo)}`;
