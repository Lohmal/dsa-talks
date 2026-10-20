import { Loader2 } from "lucide-react";

// Shown instantly while an admin page loads its data (the sidebar stays in place).
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Yükleniyor…</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-md space-y-3">
          <div className="h-8 w-3/5 animate-pulse rounded-lg bg-ink/10" />
          <div className="h-4 w-full animate-pulse rounded-lg bg-ink/[0.07]" />
        </div>
        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-muted shadow-card ring-1 ring-ink/5">
          <Loader2 className="size-4 animate-spin text-brand" />
          Yükleniyor…
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-white shadow-card ring-1 ring-ink/5">
            <div className="m-5 size-9 rounded-lg bg-ink/[0.07]" />
            <div className="mx-5 h-6 w-24 rounded bg-ink/[0.07]" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink/5">
            <div className="border-b border-line px-6 py-4">
              <div className="h-4 w-40 animate-pulse rounded bg-ink/10" />
            </div>
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }, (_, j) => (
                <div key={j} className="h-4 animate-pulse rounded bg-ink/[0.07]" style={{ width: `${90 - j * 12}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
