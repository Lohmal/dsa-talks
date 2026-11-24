import { RotateCcw } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { adminEdition, conferenceContent, editionPath, eventContent } from "@/lib/editions";
import { localize } from "@/lib/bilingual";
import { conferenceDefaults } from "@/confdsa/content";
import { eventDefaults } from "@/content/event";
import type { Messages as ConferenceMessages } from "@/confdsa/i18n/LanguageProvider";
import { Card, PageHeader } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import ContentEditor from "@/components/admin/content/ContentEditor";
import { resetContent, saveContent } from "@/app/(event)/admin/actions";

export const metadata = { title: "İçerik" };

// Everything the chosen year shows on the site: texts in both languages, contact details,
// speakers, committees and (for the conference) which pages are published.
export default async function ContentPage() {
  await requireAdmin();
  const edition = await adminEdition();
  const conference = edition.event.template === "CONFERENCE";
  const content = conference ? conferenceContent(edition) : eventContent(edition);
  const defaults = conference ? conferenceDefaults() : eventDefaults();
  const pageLabels = conference ? localize<ConferenceMessages>(content.messages, "tr").nav : {};

  return (
    <>
      <PageHeader
        title={`İçerik · ${edition.event.name} ${edition.year}`}
        description={`Bu yılın sayfasında (${editionPath(edition)}) görünen her şey. Değişiklikler “Kaydet”e basınca sitede hemen görünür; önceki yıllar etkilenmez.`}
      />
      <ContentEditor
        key={edition.id}
        initial={JSON.parse(JSON.stringify(content))}
        defaults={JSON.parse(JSON.stringify(defaults))}
        pageLabels={pageLabels as Record<string, string>}
        saveAction={saveContent}
      />
      <Card title="Varsayılanlara dön" description="Bu yıl için kaydedilen bütün içerik silinir ve sitenin kodundaki ilk hâline döner.">
        <ActionForm action={resetContent}>
          <SubmitButton tone="danger" confirm="Bu yılın bütün içerik değişiklikleri silinsin mi? Bu geri alınamaz.">
            <RotateCcw className="size-4" /> Varsayılanlara döndür
          </SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
