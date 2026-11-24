import Link from "next/link";
import { CalendarPlus, ExternalLink, Plus, Star, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { editionPath, listEvents } from "@/lib/editions";
import { Badge, Card, Field, PageHeader, inputClass } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import Select from "@/components/admin/Select";
import {
  createEdition,
  createEvent,
  deleteEdition,
  makeCurrentYear,
  updateEvent,
} from "@/app/(event)/admin/actions";

export const metadata = { title: "Etkinlikler ve Yıllar" };

// Every event (CONFDSA and the events under /etkinlikler) with its years: open a new year
// (copying what is chosen), choose the current year, edit the event, add a new event.
export default async function EventsPage() {
  await requireAdmin();
  const [events, counts] = await Promise.all([
    listEvents(),
    db.response.groupBy({ by: ["editionId"], _count: { _all: true } }),
  ]);
  const responsesOf = (id: string) => counts.find((c) => c.editionId === id)?._count._all ?? 0;
  const nextYear = new Date().getFullYear() + 1;

  return (
    <>
      <PageHeader
        title="Etkinlikler ve Yıllar"
        description="Her etkinliğin her yılı ayrı tutulur: metinler, konuşmacılar, kurullar, anket, yanıtlar ve sertifikalar. Yeni yıl açınca önceki yıllar olduğu gibi kalır."
      />

      {events.map((event) => {
        const latest = event.editions[0];
        return (
          <Card
            key={event.id}
            title={event.name}
            description={
              event.template === "CONFERENCE"
                ? "Konferans: sitenin ana sayfası ve sayfaları"
                : `Etkinlik sayfası: /etkinlikler/${event.slug}`
            }
            actions={<Badge tone="navy">Sertifika: {event.certificatePrefix}-YIL-XXXXXX</Badge>}
          >
            <ul className="divide-y divide-line rounded-2xl ring-1 ring-line">
              {event.editions.map((edition) => {
                const current = edition.year === event.currentYear;
                const responses = responsesOf(edition.id);
                return (
                  <li key={edition.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold text-ink">{edition.year}</span>
                      {current && <Badge tone="green">Güncel</Badge>}
                      <span className="text-sm text-muted">{responses} yanıt</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={editionPath({ ...edition, event })}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink ring-1 ring-line hover:ring-ink/30"
                      >
                        <ExternalLink className="size-4" /> Sayfası
                      </Link>
                      {!current && (
                        <ActionForm action={makeCurrentYear}>
                          <input type="hidden" name="id" value={edition.id} />
                          <SubmitButton tone="outline" size="sm">
                            <Star className="size-4" /> Güncel yap
                          </SubmitButton>
                        </ActionForm>
                      )}
                      {!current && responses === 0 && (
                        <ActionForm action={deleteEdition}>
                          <input type="hidden" name="id" value={edition.id} />
                          <SubmitButton tone="danger" size="sm" confirm={`${event.name} ${edition.year} silinsin mi? Metinleri ve soruları da silinir.`}>
                            <Trash2 className="size-4" /> Sil
                          </SubmitButton>
                        </ActionForm>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {latest && (
              <details className="mt-5 rounded-2xl ring-1 ring-line">
                <summary className="flex cursor-pointer select-none items-center gap-2 px-4 py-3 font-bold text-ink">
                  <CalendarPlus className="size-4 text-brand" /> Yeni yıl aç
                </summary>
                <ActionForm action={createEdition} className="space-y-4 border-t border-line p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Yıl">
                      <input name="year" type="number" defaultValue={Math.max(nextYear, latest.year + 1)} className={inputClass} />
                    </Field>
                    <Field label="Şu yıldan kopyala">
                      <Select
                        name="sourceId"
                        label="Şu yıldan kopyala"
                        defaultValue={latest.id}
                        options={event.editions.map((edition) => ({ value: edition.id, label: `${event.name} ${edition.year}` }))}
                      />
                    </Field>
                  </div>
                  <fieldset className="grid gap-2 sm:grid-cols-2">
                    <legend className="mb-2 text-sm font-bold text-ink">Kopyalanacaklar (kopya yeni yıla aittir)</legend>
                    {[
                      { name: "texts", label: "Metinler ve bilgiler", on: true },
                      { name: "committees", label: "Kurullar", on: true },
                      { name: "speakers", label: "Konuşmacılar", on: false },
                      { name: "questions", label: "Anket soruları", on: true },
                      { name: "survey", label: "Anket bilgileri (etkinlik adı, yer, sertifika logosu)", on: true },
                      { name: "makeCurrent", label: "Yeni yılı güncel yıl yap", on: true },
                    ].map((option) => (
                      <label key={option.name} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-ink ring-1 ring-line">
                        <input type="checkbox" name={option.name} defaultChecked={option.on} className="size-4 accent-brand" />
                        {option.label}
                      </label>
                    ))}
                  </fieldset>
                  <p className="text-sm text-muted">
                    Kopyalanmayan metinler sitenin kodundaki varsayılanlarla, konuşmacılar boş, sorular varsayılan sorularla
                    başlar. Anket kapalı başlar.
                  </p>
                  <SubmitButton tone="navy">
                    <CalendarPlus className="size-4" /> Yeni yılı oluştur
                  </SubmitButton>
                </ActionForm>
              </details>
            )}

            <details className="mt-3 rounded-2xl ring-1 ring-line">
              <summary className="cursor-pointer select-none px-4 py-3 font-bold text-ink">Etkinlik bilgileri</summary>
              <ActionForm action={updateEvent} className="space-y-4 border-t border-line p-4">
                <input type="hidden" name="id" value={event.id} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Ad">
                    <input name="name" defaultValue={event.name} className={inputClass} />
                  </Field>
                  <Field label="Sertifika öneki" hint="Yeni sertifikalarda kullanılır; verilmiş numaralar değişmez.">
                    <input name="prefix" defaultValue={event.certificatePrefix} className={inputClass} />
                  </Field>
                  <Field label="Sıra" hint="Etkinlikler sayfasındaki ve paneldeki sıra.">
                    <input name="order" type="number" defaultValue={event.order} className={inputClass} />
                  </Field>
                </div>
                <SubmitButton tone="navy">Kaydet</SubmitButton>
              </ActionForm>
            </details>
          </Card>
        );
      })}

      <Card title="Yeni etkinlik" description="Tek sayfalık etkinlik şablonuyla açılır (DSATalks gibi) ve /etkinlikler sayfasında listelenir.">
        <ActionForm action={createEvent} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Ad">
              <input name="name" placeholder="Veri Günleri" className={inputClass} />
            </Field>
            <Field label="Kısa ad (adres)" hint="/etkinlikler/kisa-ad">
              <input name="slug" placeholder="veri-gunleri" className={inputClass} />
            </Field>
            <Field label="Sertifika öneki">
              <input name="prefix" placeholder="VG" className={inputClass} />
            </Field>
            <Field label="İlk yıl">
              <input name="year" type="number" defaultValue={new Date().getFullYear()} className={inputClass} />
            </Field>
          </div>
          <SubmitButton>
            <Plus className="size-4" /> Etkinliği oluştur
          </SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
