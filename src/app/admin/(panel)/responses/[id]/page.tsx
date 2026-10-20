import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, Mail, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { responseAverage, scopeLabel } from "@/lib/stats";
import { formatDateTime, formatRange } from "@/lib/time";
import { Badge, Card, PageHeader, buttonClass } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { deleteResponse, resendCertificate } from "@/app/admin/actions";

export const metadata = { title: "Yanıt" };

const RATING_LABEL: Record<number, string> = {
  5: "Kesinlikle katılıyorum",
  4: "Katılıyorum",
  3: "Ne katılıyorum ne katılmıyorum",
  2: "Katılmıyorum",
  1: "Kesinlikle katılmıyorum",
};

export default async function ResponsePage({ params }: PageProps<"/admin/responses/[id]">) {
  const { id } = await params;
  const response = /^[a-f0-9]{24}$/.test(id) ? await db.response.findUnique({ where: { id } }) : null;
  if (!response) notFound();

  const avg = responseAverage(response);
  const certificate = `/api/certificate/${response.certificateToken}`;
  const details = [
    { label: "E-posta", value: response.email },
    { label: "Gönderim", value: formatDateTime(response.createdAt) },
    { label: "Kapsam", value: scopeLabel(response) },
    ...(response.sessionStartsAt && response.sessionEndsAt
      ? [{ label: "Oturum saati", value: formatRange(response.sessionStartsAt, response.sessionEndsAt, "tr") }]
      : []),
    { label: "Sertifika no", value: response.certificateNo },
    { label: "Form dili", value: response.locale === "en" ? "İngilizce" : "Türkçe" },
  ];

  return (
    <>
      <Link href="/admin/responses" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Yanıtlar
      </Link>
      <PageHeader
        title={response.name}
        description={avg === null ? "Puanlı soru yanıtı yok." : `Ortalama puan: ${avg.toFixed(2)} / 5`}
        actions={
          <>
            <a href={`${certificate}?download=1`} className={buttonClass("primary")}>
              <Download className="size-4" /> Sertifikayı indir (PDF)
            </a>
            <a href={`${certificate}?format=png`} target="_blank" className={buttonClass("outline")}>
              <ExternalLink className="size-4" /> PNG olarak aç
            </a>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card title="Cevaplar" padded={false}>
          <ol className="divide-y divide-line">
            {response.answers.map((answer, index) => (
              <li key={`${answer.questionId}-${index}`} className="px-5 py-4 sm:px-6">
                <p className="font-semibold text-ink">
                  <span className="mr-2 font-black text-brand">{index + 1}</span>
                  {answer.textTr}
                </p>
                {answer.type === "RATING" ? (
                  <p className="mt-2 flex items-center gap-3 text-sm">
                    <span className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`h-2 w-6 rounded-full ${answer.rating && n <= answer.rating ? "bg-ink" : "bg-line"}`}
                        />
                      ))}
                    </span>
                    <span className="font-bold text-ink">{answer.rating ?? "–"}</span>
                    <span className="text-muted">{answer.rating ? RATING_LABEL[answer.rating] : "Yanıtlanmadı"}</span>
                  </p>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap rounded-xl bg-surface p-3 text-sm text-ink">
                    {answer.text || <span className="text-muted">Yanıt yazılmadı.</span>}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-6">
          <Card title="Bilgiler" padded={false}>
            <dl className="divide-y divide-line text-sm">
              {details.map(({ label, value }) => (
                <div key={label} className="px-5 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted">{label}</dt>
                  <dd className="mt-0.5 break-words font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Sertifika e-postası">
            <div className="flex items-center gap-2">
              {response.emailStatus === "sent" ? (
                <Badge tone="green">Gönderildi</Badge>
              ) : response.emailStatus === "failed" ? (
                <Badge tone="red">Gönderilemedi</Badge>
              ) : (
                <Badge tone="amber">Bekliyor</Badge>
              )}
              {response.emailSentAt && <span className="text-sm text-muted">{formatDateTime(response.emailSentAt)}</span>}
            </div>
            {response.emailError && <p className="mt-3 break-words text-xs text-brand">{response.emailError}</p>}
            <ActionForm action={resendCertificate} className="mt-4">
              <input type="hidden" name="id" value={response.id} />
              <SubmitButton tone="navy" className="w-full">
                <Mail className="size-4" /> Sertifikayı tekrar gönder
              </SubmitButton>
            </ActionForm>
          </Card>

          <Card title="Yanıtı sil">
            <p className="text-sm text-muted">
              Yanıt ve sertifika kaydı kalıcı olarak silinir. Kişi aynı kapsamda anketi yeniden doldurabilir.
            </p>
            <ActionForm action={deleteResponse} className="mt-4">
              <input type="hidden" name="id" value={response.id} />
              <SubmitButton tone="danger" className="w-full" confirm={`${response.name} adlı kişinin yanıtı silinsin mi?`}>
                <Trash2 className="size-4" /> Yanıtı sil
              </SubmitButton>
            </ActionForm>
          </Card>
        </div>
      </div>
    </>
  );
}
