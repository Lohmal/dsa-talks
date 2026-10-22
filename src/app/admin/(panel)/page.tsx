import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { ArrowRight, CircleDot, Mail, MessageSquareText, Star } from "lucide-react";
import { db } from "@/lib/db";
import { getQuestions, getSurveyState } from "@/lib/survey";
import { choiceStats, countSince, overallAverage, ratingStats, responseAverage, scopeLabel, scopeWhere } from "@/lib/stats";
import { sessionTalks, speakerNames, talkTitles } from "@/lib/talks";
import { readScope, scopeSelectOptions } from "@/lib/scopes";
import { formatDateTime, formatRange } from "@/lib/time";
import { Badge, Card, EmptyState, PageHeader, buttonClass } from "@/components/admin/ui";
import { AverageChart, ChoiceChart, DistributionChart } from "@/components/admin/Charts";
import ScopeSelect from "@/components/admin/ScopeSelect";
import DownloadButton from "@/components/admin/DownloadButton";

export const metadata = { title: "Genel Bakış" };

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const scope = readScope((await searchParams).scope);
  const [state, questions, responses, sessions, options] = await Promise.all([
    getSurveyState(),
    getQuestions(),
    db.response.findMany({ where: scopeWhere(scope), orderBy: { createdAt: "desc" } }),
    db.surveySession.findMany({ orderBy: { startsAt: "asc" } }),
    scopeSelectOptions(),
  ]);

  const stats = ratingStats(responses, questions);
  const choices = choiceStats(responses, questions);
  const average = overallAverage(stats);
  const sent = responses.filter((r) => r.emailStatus === "sent").length;
  const failed = responses.filter((r) => r.emailStatus === "failed").length;
  const lastDay = countSince(responses, 24);
  const exportHref = `/admin/export${scope === "all" ? "" : `?scope=${scope}`}`;

  const bySession = sessions.map((session) => {
    const own = responses.filter((r) => r.sessionId === session.id);
    return { session, count: own.length, average: overallAverage(ratingStats(own, questions)) };
  });

  return (
    <>
      <PageHeader
        title="Genel Bakış"
        description="Anket yanıtları, memnuniyet ortalamaları ve sertifika gönderimleri."
        actions={
          <>
            <ScopeSelect value={scope} options={options} />
            <DownloadButton href={exportHref} fileName="DSATalks-anket.xlsx" tone="navy" icon="excel">
              Excel
            </DownloadButton>
          </>
        }
      />

      <StatusBanner state={state} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={MessageSquareText} label="Toplam yanıt" value={String(responses.length)} note={`Son 24 saatte ${lastDay}`} />
        <Kpi
          icon={Star}
          label="Ortalama memnuniyet"
          value={average === null ? "–" : average.toFixed(2)}
          note="5 üzerinden, tüm puanlı sorular"
          accent
        />
        <Kpi
          icon={Mail}
          label="Gönderilen sertifika"
          value={`${sent}`}
          note={failed ? `${failed} gönderim başarısız` : "Başarısız gönderim yok"}
        />
        <Kpi
          icon={CircleDot}
          label="Farklı katılımcı"
          value={String(new Set(responses.map((r) => r.email)).size)}
          note="E-posta adresine göre"
        />
      </div>

      {responses.length === 0 ? (
        <Card>
          <EmptyState>Bu kapsamda henüz yanıt yok. Grafikler ilk yanıtlarla birlikte burada görünür.</EmptyState>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Soru bazında ortalama" description="Her sorunun 5 üzerinden ortalama puanı">
            <AverageChart stats={stats} />
          </Card>
          <Card title="Yanıt dağılımı" description="Her soruda verilen puanların oranı">
            <DistributionChart stats={stats} />
          </Card>
        </div>
      )}

      {responses.length > 0 &&
        choices.map((choice) => (
          <Card
            key={choice.questionId}
            title={choice.text}
            description={`${choice.respondents} kişi yanıtladı · birden fazla seçim yapılabildiği için oranlar toplamı %100’ü geçebilir`}
          >
            <ChoiceChart stat={choice} />
            {choice.others.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">“Diğer” olarak yazılanlar</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {choice.others.map((other, i) => (
                    <li key={i} className="rounded-full bg-surface px-3 py-1.5 text-sm text-ink ring-1 ring-line">
                      {other}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Konuşmacı oturumları" description="Konuşmacı bazında moddaki zaman aralıkları" padded={false}>
          {bySession.length === 0 ? (
            <div className="p-5">
              <EmptyState>Henüz oturum eklenmedi. Anket Ayarları’ndan ekleyebilirsiniz.</EmptyState>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {bySession.map(({ session, count, average }) => (
                <li key={session.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{talkTitles(sessionTalks(session), "tr")}</p>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {speakerNames(sessionTalks(session))} · {formatRange(session.startsAt, session.endsAt, "tr")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-extrabold text-ink">{count} yanıt</p>
                    <p className="text-sm text-muted">{average === null ? "–" : `${average.toFixed(2)} / 5`}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Son yanıtlar"
          padded={false}
          actions={
            <Link href="/admin/responses" className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
              Tümü <ArrowRight className="size-4" />
            </Link>
          }
        >
          {responses.length === 0 ? (
            <div className="p-5">
              <EmptyState>Henüz yanıt yok.</EmptyState>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {responses.slice(0, 6).map((response) => {
                const avg = responseAverage(response);
                return (
                  <li key={response.id}>
                    <Link
                      href={`/admin/responses/${response.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surface sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">{response.name}</p>
                        <p className="truncate text-sm text-muted">
                          {formatDateTime(response.createdAt)} · {scopeLabel(response)}
                        </p>
                      </div>
                      <Badge tone={avg !== null && avg >= 4 ? "green" : avg !== null && avg < 3 ? "red" : "gray"}>
                        {avg === null ? "–" : avg.toFixed(1)}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  note,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 shadow-card ring-1 ${
        accent ? "bg-ink text-white ring-ink" : "bg-white text-ink ring-ink/5"
      }`}
    >
      {accent && <span aria-hidden className="absolute -right-8 -top-8 size-28 rounded-full border-16 border-brand/70" />}
      <span
        className={`relative grid size-9 place-items-center rounded-lg ${accent ? "bg-white/10" : "bg-brand/10 text-brand"}`}
      >
        <Icon className="size-4.5" />
      </span>
      <p className={`relative mt-4 text-xs font-bold uppercase tracking-wider ${accent ? "text-white/60" : "text-muted"}`}>
        {label}
      </p>
      <p className="relative mt-1 text-3xl font-black tracking-[-0.03em]">{value}</p>
      <p className={`relative mt-1 text-sm ${accent ? "text-white/60" : "text-muted"}`}>{note}</p>
    </div>
  );
}

function StatusBanner({ state }: { state: Awaited<ReturnType<typeof getSurveyState>> }) {
  const mode = state.settings.mode === "EVENT" ? "Toplantı bazında" : "Konuşmacı bazında";
  let tone: "green" | "amber" | "red" = "red";
  let title = "Anket kapalı";
  let detail = "Katılımcılar “Kayıt süresi sona erdi” mesajını görüyor.";

  if (state.status === "open") {
    tone = "green";
    title = "Anket açık – yanıt alınıyor";
    detail = state.session
      ? `${speakerNames(sessionTalks(state.session))} · ${talkTitles(sessionTalks(state.session), "tr")} (${formatRange(state.session.startsAt, state.session.endsAt, "tr")})`
      : "Her e-posta adresi anketi bir kez doldurabilir.";
  } else if (state.status === "waiting") {
    tone = "amber";
    title = "Anket açık, ancak şu anda aktif oturum yok";
    detail = state.next
      ? `Sıradaki: ${speakerNames(sessionTalks(state.next))} · ${formatRange(state.next.startsAt, state.next.endsAt, "tr")}`
      : "Gelecek bir oturum tanımlı değil. Anket Ayarları’ndan oturum ekleyin.";
  }

  const dot = { green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-brand" }[tone];

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink/5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-start gap-4">
        <span className="relative mt-1.5 flex size-3 shrink-0">
          {tone === "green" && <span className={`absolute inset-0 animate-ping rounded-full ${dot} opacity-60`} />}
          <span className={`relative size-3 rounded-full ${dot}`} />
        </span>
        <div>
          <p className="font-extrabold text-ink">
            {title} <span className="ml-1 text-sm font-semibold text-muted">· {mode}</span>
          </p>
          <p className="mt-0.5 text-sm text-muted">{detail}</p>
        </div>
      </div>
      <Link href="/admin/settings" className={buttonClass("outline", "sm")}>
        Ayarları aç
      </Link>
    </div>
  );
}
