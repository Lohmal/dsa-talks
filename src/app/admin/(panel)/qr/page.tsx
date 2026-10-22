import { siteUrl } from "@/config/url";
import { requireAdmin } from "@/lib/admin";
import { PageHeader } from "@/components/admin/ui";
import QrCard from "@/components/admin/QrCard";

export const metadata = { title: "QR Kod" };

export default async function QrPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="QR Kod"
        description="Okutulduğunda Etkinlik Memnuniyet Anketi sayfasını açan QR kod. Salona asmak veya slayta koymak için PNG olarak indirin."
      />
      <QrCard url={`${siteUrl}/anket`} />
    </>
  );
}
