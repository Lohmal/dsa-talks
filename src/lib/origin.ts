import "server-only";
import { siteUrl } from "@/config/url";

// Links in e-mails, certificates and QR codes always use the configured address
// (NEXT_PUBLIC_SITE_URL), never the request's Host header, which the sender controls.
export const verifyUrl = (certificateNo: string) => `${siteUrl}/dogrula?no=${encodeURIComponent(certificateNo)}`;
