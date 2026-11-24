import { siteUrl } from "@/config/url";
import { requireAdmin } from "@/lib/admin";
import { adminEdition, surveyPath } from "@/lib/editions";
import { PageHeader } from "@/components/admin/ui";
import QrCard from "@/components/admin/QrCard";

export const metadata = { title: "QR Kod" };

export default async function QrPage() {
  await requireAdmin();
  const edition = await adminEdition();
  return (
    <>
      <PageHeader
        title={`QR Kod · ${edition.event.name} ${edition.year}`}
        description="Okutulduğunda bu yılın Etkinlik Memnuniyet Anketi sayfasını açan QR kod. Salona asmak veya slayta koymak için PNG olarak indirin."
      />
      <QrCard url={`${siteUrl}${surveyPath(edition)}`} />
    </>
  );
}
