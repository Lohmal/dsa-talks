import { CalendarPlus, Pencil, Power, Trash2 } from "lucide-react";
import type { SurveySession } from "@prisma/client";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/survey";
import { formatRange, toIstanbulParts, windowStatus } from "@/lib/time";
import { speakers } from "@/data/speakers";
import en from "@/i18n/messages/en.json";
import tr from "@/i18n/messages/tr.json";
import { Badge, Card, Field, PageHeader, inputClass } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import {
  createSession,
  deleteSession,
  saveEventInfo,
  setMode,
  setSurveyOpen,
  updateSession,
} from "@/app/admin/actions";

export const metadata = { title: "Anket Ayarları" };

export default async function SettingsPage() {
  const [settings, sessions, counts] = await Promise.all([
    getSettings(),
    db.surveySession.findMany({ orderBy: { startsAt: "asc" } }),
    db.response.groupBy({ by: ["sessionId"], _count: { _all: true } }),
  ]);
  const responsesOf = (id: string) => counts.find((c) => c.sessionId === id)?._count._all ?? 0;

  return (
    <>
      <PageHeader
        title="Anket Ayarları"
        description="Anketin açık olup olmadığını, nasıl yanıt toplanacağını ve konuşmacı oturumlarını buradan yönetin."
      />

      {/* Talk titles of the site's program, offered as suggestions when adding a time window. */}
      <datalist id="speaker-names">
        {speakers.map((s) => (
          <option key={s.slug} value={s.name} />
        ))}
      </datalist>
      <datalist id="titles-tr">
        {tr.program.days.flatMap((d) => d.sessions).map((s) => (
          <option key={s.time + s.title} value={s.title} />
        ))}
      </datalist>
      <datalist id="titles-en">
        {en.program.days.flatMap((d) => d.sessions).map((s) => (
          <option key={s.time + s.title} value={s.title} />
        ))}
      </datalist>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Kayıt durumu" description="Kapalıyken anket sayfasında “Kayıt süresi sona erdi” yazar.">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`grid size-12 place-items-center rounded-2xl ${settings.isOpen ? "bg-emerald-50 text-emerald-600" : "bg-brand/10 text-brand"}`}>
                <Power className="size-6" />
              </span>
              <div>
                <p className="text-lg font-extrabold text-ink">{settings.isOpen ? "Yanıt alınıyor" : "Kayıt kapalı"}</p>
                <p className="text-sm text-muted">
                  {settings.isOpen
                    ? settings.mode === "SESSION"
                      ? "Yalnızca oturum saatleri içinde açık."
                      : "Siz kapatana kadar açık."
                    : "Yeni yanıt kabul edilmiyor."}
                </p>
              </div>
            </div>
            <ActionForm action={setSurveyOpen}>
              <input type="hidden" name="open" value={settings.isOpen ? "0" : "1"} />
              <SubmitButton tone={settings.isOpen ? "danger" : "primary"}>
                {settings.isOpen ? "Kaydı kapat" : "Kaydı aç"}
              </SubmitButton>
            </ActionForm>
          </div>
        </Card>

        <Card title="Toplama modu" description="Her e-posta adresi kapsam başına bir kez sertifika alır.">
          <ActionForm action={setMode}>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: "EVENT",
                  title: "Toplantı bazında",
                  text: "Kayıt açık olduğu sürece; her e-posta bir kez.",
                },
                {
                  value: "SESSION",
                  title: "Konuşmacı bazında",
                  text: "Yalnızca aşağıdaki oturum saatlerinde; her oturumda bir kez.",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="relative cursor-pointer rounded-xl p-4 ring-1 ring-line transition has-checked:bg-ink has-checked:text-white has-checked:ring-ink"
                >
                  <input
                    type="radio"
                    name="mode"
                    value={option.value}
                    defaultChecked={settings.mode === option.value}
                    className="peer sr-only"
                  />
                  <span className="block font-extrabold">{option.title}</span>
                  <span className="mt-1 block text-sm opacity-75">{option.text}</span>
                </label>
              ))}
            </div>
            <SubmitButton tone="navy" className="mt-4">
              Modu kaydet
            </SubmitButton>
          </ActionForm>
        </Card>
      </div>

      <Card
        title="Konuşmacı oturumları"
        description="Konuşmacı bazında modda anket yalnızca bu saatlerde açılır. Saatler Türkiye saatidir (UTC+3)."
        actions={settings.mode === "SESSION" ? <Badge tone="green">Kullanımda</Badge> : <Badge>Toplantı bazında modda kullanılmaz</Badge>}
        padded={false}
      >
        {sessions.length > 0 && (
          <ul className="divide-y divide-line">
            {sessions.map((session) => {
              const status = windowStatus(session.startsAt, session.endsAt);
              return (
                <li key={session.id} className="px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink">{session.titleTr}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {session.speaker} · {formatRange(session.startsAt, session.endsAt, "tr")} · {responsesOf(session.id)} yanıt
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === "live" && <Badge tone="green">Şu an açık</Badge>}
                      {status === "upcoming" && <Badge tone="navy">Yaklaşan</Badge>}
                      {status === "past" && <Badge>Bitti</Badge>}
                      <ActionForm action={deleteSession}>
                        <input type="hidden" name="id" value={session.id} />
                        <SubmitButton
                          tone="ghost"
                          size="sm"
                          confirm="Oturum silinsin mi? Bu oturumda verilen yanıtlar silinmez."
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Sil</span>
                        </SubmitButton>
                      </ActionForm>
                    </div>
                  </div>
                  <details className="group mt-2">
                    <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-brand hover:underline">
                      <Pencil className="size-3.5" /> Düzenle
                    </summary>
                    <SessionForm action={updateSession} session={session} submit="Değişiklikleri kaydet" />
                  </details>
                </li>
              );
            })}
          </ul>
        )}
        <div className="border-t border-line bg-surface/60 px-5 py-5 sm:px-6">
          <p className="flex items-center gap-2 font-extrabold text-ink">
            <CalendarPlus className="size-4 text-brand" /> Yeni oturum ekle
          </p>
          <SessionForm action={createSession} submit="Oturumu ekle" />
        </div>
      </Card>

      <Card
        title="Etkinlik bilgileri"
        description="Anket sayfasındaki bilgi tablosunda ve toplantı bazındaki sertifikalarda kullanılır."
      >
        <ActionForm action={saveEventInfo}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Etkinlik adı">
              <input name="eventName" defaultValue={settings.eventName} className={inputClass} />
            </Field>
            <Field label="Konuşmacılar" hint="Toplantı bazında modda “Konuşmacı” satırında görünür.">
              <input name="speakersText" defaultValue={settings.speakersText} className={inputClass} />
            </Field>
            <Field label="Tarih ve saat (TR)">
              <input name="eventDateTr" defaultValue={settings.eventDateTr} className={inputClass} />
            </Field>
            <Field label="Tarih ve saat (EN)">
              <input name="eventDateEn" defaultValue={settings.eventDateEn} className={inputClass} />
            </Field>
            <Field label="Etkinlik yeri (TR)">
              <input name="venueTr" defaultValue={settings.venueTr} className={inputClass} />
            </Field>
            <Field label="Etkinlik yeri (EN)">
              <input name="venueEn" defaultValue={settings.venueEn} className={inputClass} />
            </Field>
            <Field
              label="Sertifikadaki tarih"
              hint="Toplantı bazındaki sertifikalarda yazar (İngilizce). Konuşmacı bazında oturum tarihi kullanılır."
            >
              <input name="certificateDate" defaultValue={settings.certificateDate} className={inputClass} />
            </Field>
          </div>
          <SubmitButton tone="navy" className="mt-5">
            Bilgileri kaydet
          </SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}

function SessionForm({
  action,
  session,
  submit,
}: {
  action: typeof createSession;
  session?: SurveySession;
  submit: string;
}) {
  const start = session ? toIstanbulParts(session.startsAt) : null;
  const end = session ? toIstanbulParts(session.endsAt) : null;

  return (
    <ActionForm action={action} className="mt-4">
      {session && <input type="hidden" name="id" value={session.id} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Field label="Konuşmacı" className="lg:col-span-2">
          <input name="speaker" list="speaker-names" required defaultValue={session?.speaker} className={inputClass} />
        </Field>
        <Field label="Tarih" className="lg:col-span-2">
          <input name="date" type="date" required defaultValue={start?.date ?? "2026-11-04"} className={inputClass} />
        </Field>
        <Field label="Başlangıç">
          <input name="start" type="time" required defaultValue={start?.time ?? "10:15"} className={inputClass} />
        </Field>
        <Field label="Bitiş">
          <input name="end" type="time" required defaultValue={end?.time ?? "12:00"} className={inputClass} />
        </Field>
        <Field label="Konuşma başlığı (TR)" className="sm:col-span-2 lg:col-span-3">
          <input name="titleTr" list="titles-tr" defaultValue={session?.titleTr} className={inputClass} />
        </Field>
        <Field label="Konuşma başlığı (EN)" hint="Sertifikada bu başlık yazar." className="sm:col-span-2 lg:col-span-3">
          <input name="titleEn" list="titles-en" defaultValue={session?.titleEn} className={inputClass} />
        </Field>
      </div>
      <SubmitButton tone="navy" className="mt-4">
        {submit}
      </SubmitButton>
    </ActionForm>
  );
}
