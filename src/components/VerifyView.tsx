"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, SearchX, ShieldCheck } from "lucide-react";
import PublicShell from "./PublicShell";
import { useLanguage } from "@/i18n/LanguageProvider";

export type VerifiedCertificate = {
  name: string;
  certificateNo: string;
  date: string;
  issued: { tr: string; en: string };
  talks: { speaker: string; title: { tr: string; en: string } }[];
};

// The certificate check: a number field, then a green "valid" card or a "not found" notice.
export default function VerifyView({ query, certificate }: { query: string; certificate: VerifiedCertificate | null }) {
  const { m, locale } = useLanguage();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const t = m.verify;

  return (
    <PublicShell title={t.title} intro={t.intro}>
      <div className="space-y-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const no = String(new FormData(event.currentTarget).get("no") ?? "").trim();
            startTransition(() => router.push(no ? `/dogrula?no=${encodeURIComponent(no)}` : "/dogrula"));
          }}
          className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-8"
        >
          <label htmlFor="certificate-no" className="text-sm font-bold text-ink">
            {t.label}
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="certificate-no"
              name="no"
              defaultValue={query}
              required
              autoComplete="off"
              spellCheck={false}
              placeholder={t.placeholder}
              className="w-full rounded-xl bg-white px-4 py-3 font-mono text-lg uppercase tracking-wider text-ink ring-1 ring-line transition placeholder:normal-case placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-ink"
            />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-70"
            >
              {pending ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
              {pending ? t.checking : t.submit}
            </button>
          </div>
        </form>

        {query && !pending && certificate && (
          <section className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-emerald-200">
            <div className="flex items-center gap-4 bg-emerald-50 px-6 py-5 sm:px-8">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
                <BadgeCheck className="size-6" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-emerald-800">{t.validTitle}</h2>
                <p className="text-sm text-emerald-700">{t.validText}</p>
              </div>
            </div>
            <dl className="divide-y divide-line">
              {[
                { label: t.name, value: <span className="text-lg font-extrabold">{certificate.name}</span> },
                { label: t.number, value: <span className="font-mono">{certificate.certificateNo}</span> },
                { label: t.event, value: "DSATalks" },
                ...(certificate.talks.length
                  ? [
                      {
                        label: t.talks,
                        value: (
                          <ul className="space-y-1.5">
                            {certificate.talks.map((talk) => (
                              <li key={talk.speaker + talk.title.tr}>
                                {talk.title[locale]} <span className="font-normal text-muted">· {talk.speaker}</span>
                              </li>
                            ))}
                          </ul>
                        ),
                      },
                    ]
                  : []),
                { label: t.date, value: certificate.date },
                { label: t.issued, value: certificate.issued[locale] },
              ].map(({ label, value }) => (
                <div key={label} className="grid gap-1 px-6 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6 sm:px-8">
                  <dt className="text-sm font-bold text-muted">{label}</dt>
                  <dd className="font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {query && !pending && !certificate && (
          <section className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand/20 sm:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
              <SearchX className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-ink">{t.invalidTitle}</h2>
              <p className="mt-1 text-muted">{t.invalidText}</p>
            </div>
          </section>
        )}
      </div>
    </PublicShell>
  );
}
