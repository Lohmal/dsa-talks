import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import type { Prisma } from "@prisma/client";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { db } from "@/lib/db";
import { responseAverage, scopeLabel, scopeWhere } from "@/lib/stats";
import { readScope, scopeSelectOptions } from "@/lib/scopes";
import { formatDateTime } from "@/lib/time";
import { Badge, Card, EmptyState, PageHeader, buttonClass } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import ScopeSelect from "@/components/admin/ScopeSelect";
import SearchBox from "@/components/admin/SearchBox";
import DownloadButton from "@/components/admin/DownloadButton";
import LinkRow from "@/components/admin/LinkRow";
import { resendFailedCertificates } from "@/app/admin/actions";

export const metadata = { title: "Yanıtlar" };

const PAGE_SIZE = 50;

const mailBadge = {
  sent: <Badge tone="green">Gönderildi</Badge>,
  failed: <Badge tone="red">Başarısız</Badge>,
  sending: <Badge tone="amber">Gönderiliyor</Badge>,
  pending: <Badge tone="amber">Sırada</Badge>,
} as Record<string, React.ReactNode>;

// "pending" also covers the one being sent right now.
const mailFilters: Record<string, string[]> = { pending: ["pending", "sending"], failed: ["failed"], sent: ["sent"] };
const mailOptions = [
  { value: "all", label: "Tüm e-postalar" },
  { value: "pending", label: "Sırada" },
  { value: "failed", label: "Başarısız" },
  { value: "sent", label: "Gönderildi" },
];

export default async function ResponsesPage({ searchParams }: PageProps<"/admin/responses">) {
  await requireAdmin();
  const params = await searchParams;
  const scope = readScope(params.scope);
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const mail = typeof params.mail === "string" && mailFilters[params.mail] ? params.mail : "all";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.ResponseWhereInput = {
    ...scopeWhere(scope),
    ...(mail !== "all" && { emailStatus: { in: mailFilters[mail] } }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { certificateNo: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [total, responses, options, failedCount] = await Promise.all([
    db.response.count({ where }),
    db.response.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    scopeSelectOptions(),
    db.response.count({ where: { emailStatus: "failed" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const query = (extra: Record<string, string | number>) => {
    const search = new URLSearchParams();
    if (scope !== "all") search.set("scope", scope);
    if (mail !== "all") search.set("mail", mail);
    if (q) search.set("q", q);
    for (const [key, value] of Object.entries(extra)) search.set(key, String(value));
    const text = search.toString();
    return text ? `?${text}` : "";
  };

  return (
    <>
      <PageHeader
        title="Yanıtlar"
        description={`${total} yanıt. Bir yanıta tıklayarak cevapları ve sertifikayı görün.`}
        actions={
          <>
            <ScopeSelect value={scope} options={options} />
            <ScopeSelect value={mail} options={mailOptions} param="mail" label="E-posta durumu" className="min-w-0 md:w-52" />
            <DownloadButton href={`/admin/export${query({})}`} fileName="DSATalks-anket.xlsx" tone="navy" icon="excel">
              Excel olarak indir
            </DownloadButton>
          </>
        }
      />

      {failedCount > 0 && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink">
              <strong>{failedCount}</strong> sertifika e-postası gönderilemedi. Hepsi yeniden sıraya alınabilir; sırayla
              gönderilirler.
            </p>
            <ActionForm action={resendFailedCertificates}>
              <SubmitButton tone="navy" size="sm">
                <RotateCw className="size-4" /> Başarısızların hepsine yeniden gönder
              </SubmitButton>
            </ActionForm>
          </div>
        </Card>
      )}

      <Card padded={false}>
        <SearchBox defaultValue={q} />

        {responses.length === 0 ? (
          <div className="p-6">
            <EmptyState>{q ? "Aramaya uyan yanıt bulunamadı." : "Bu kapsamda henüz yanıt yok."}</EmptyState>
          </div>
        ) : (
          <>
            {/* Phones: one card (one link) per response. */}
            <ul className="divide-y divide-line md:hidden">
              {responses.map((response) => {
                const avg = responseAverage(response);
                return (
                  <li key={response.id}>
                    <Link href={`/admin/responses/${response.id}`} className="block px-5 py-4 active:bg-surface">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">{response.name}</p>
                          <p className="truncate text-sm text-muted">{response.email}</p>
                        </div>
                        {mailBadge[response.emailStatus] ?? mailBadge.pending}
                      </div>
                      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                        <span>{formatDateTime(response.createdAt)}</span>
                        <span className="font-mono text-ink">{response.certificateNo}</span>
                        {avg !== null && <span>Ort. {avg.toFixed(2)}</span>}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted">{scopeLabel(response)}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-4xl text-left text-sm">
                <thead className="bg-surface text-xs font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-6 py-3">Tarih</th>
                    <th className="px-4 py-3">Katılımcı</th>
                    <th className="px-4 py-3">Kapsam</th>
                    <th className="px-4 py-3 text-center">Ortalama</th>
                    <th className="px-4 py-3">Sertifika</th>
                    <th className="px-6 py-3">E-posta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {responses.map((response) => {
                    const avg = responseAverage(response);
                    return (
                      <LinkRow
                        key={response.id}
                        href={`/admin/responses/${response.id}`}
                        className="group transition-colors hover:bg-surface/70"
                      >
                        <td className="whitespace-nowrap px-6 py-3.5 text-muted">{formatDateTime(response.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <Link href={`/admin/responses/${response.id}`} className="font-bold text-ink group-hover:text-brand">
                            {response.name}
                          </Link>
                          <p className="text-muted">{response.email}</p>
                        </td>
                        <td className="max-w-64 truncate px-4 py-3.5 text-muted">{scopeLabel(response)}</td>
                        <td className="px-4 py-3.5 text-center font-extrabold text-ink">
                          {avg === null ? "–" : avg.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-ink">{response.certificateNo}</td>
                        <td className="px-6 py-3.5">{mailBadge[response.emailStatus] ?? mailBadge.pending}</td>
                      </LinkRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-6 py-3 text-sm">
            <span className="text-muted">
              Sayfa {page} / {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/responses${query({ page: page - 1 })}`} className={buttonClass("outline", "sm")}>
                  <ChevronLeft className="size-4" /> Önceki
                </Link>
              )}
              {page < pages && (
                <Link href={`/admin/responses${query({ page: page + 1 })}`} className={buttonClass("outline", "sm")}>
                  Sonraki <ChevronRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
