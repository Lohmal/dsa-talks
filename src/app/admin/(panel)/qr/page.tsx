import { headers } from "next/headers";
import { PageHeader } from "@/components/admin/ui";
import QrCard from "@/components/admin/QrCard";

export const metadata = { title: "QR Kod" };

// The survey address as this server is reached (or NEXT_PUBLIC_SITE_URL when set).
async function surveyUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return `${configured}/anket`;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/anket`;
}

export default async function QrPage() {
  return (
    <>
      <PageHeader
        title="QR Kod"
        description="Okutulduğunda Etkinlik Memnuniyet Anketi sayfasını açan QR kod. Salona asmak veya slayta koymak için PNG olarak indirin."
      />
      <QrCard url={await surveyUrl()} />
    </>
  );
}
