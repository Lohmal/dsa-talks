import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { responseAverage, scopeLabel, scopeWhere } from "@/lib/stats";
import { readScope, scopeSelectOptions } from "@/lib/scopes";
import { formatDateTime } from "@/lib/time";
import { Badge, Card, EmptyState, PageHeader, buttonClass } from "@/components/admin/ui";
import ScopeSelect from "@/components/admin/ScopeSelect";
import SearchBox from "@/components/admin/SearchBox";
import DownloadButton from "@/components/admin/DownloadButton";

export const metadata = { title: "Yanıtlar" };

const PAGE_SIZE = 50;

const mailBadge = {
  sent: <Badge tone="green">Gönderildi</Badge>,
  failed: <Badge tone="red">Başarısız</Badge>,
  pending: <Badge tone="amber">Bekliyor</Badge>,
} as Record<string, React.ReactNode>;

export default async function ResponsesPage({ searchParams }: PageProps<"/admin/responses">) {
  const params = await searchParams;
  const scope = readScope(params.scope);
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.ResponseWhereInput = {
    ...scopeWhere(scope),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { certificateNo: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [total, responses, options] = await Promise.all([
    db.response.count({ where }),
    db.response.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    scopeSelectOptions(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const query = (extra: Record<string, string | number>) => {
    const search = new URLSearchParams();
    if (scope !== "all") search.set("scope", scope);
    if (q) search.set("q", q);
    for (const [key, value] of Object.entries(extra)) search.set(key, String(value));
    const text = search.toString();
    return text ? `?${text}` : "";
  };

  return (
    <>
      <PageHeader
        title="Yanıtlar"
        description={`${total} yanıt. Bir satıra tıklayarak cevapları ve sertifikayı görün.`}
        actions={
          <>
            <ScopeSelect value={scope} options={options} />
            <DownloadButton href={`/admin/export${query({})}`} fileName="DSATalks-anket.xlsx" tone="navy" icon="excel">
              Excel olarak indir
            </DownloadButton>
          </>
        }
      />

      <Card padded={false}>
        <SearchBox defaultValue={q} />

        {responses.length === 0 ? (
          <div className="p-6">
            <EmptyState>{q ? "Aramaya uyan yanıt bulunamadı." : "Bu kapsamda henüz yanıt yok."}</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    <tr key={response.id} className="group relative transition-colors hover:bg-surface/70">
                      <td className="whitespace-nowrap px-6 py-3.5 text-muted">{formatDateTime(response.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/responses/${response.id}`}
                          className="font-bold text-ink after:absolute after:inset-0 group-hover:text-brand"
                        >
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
