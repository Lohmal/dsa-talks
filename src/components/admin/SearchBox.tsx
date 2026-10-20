"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { buttonClass, inputClass } from "./ui";

// Search on the responses page; keeps the scope filter and shows a spinner while results load.
export default function SearchBox({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        const params = new URLSearchParams(searchParams);
        if (q) params.set("q", q);
        else params.delete("q");
        params.delete("page");
        const query = params.toString();
        startTransition(() => router.push(query ? `${pathname}?${query}` : pathname));
      }}
      className="flex gap-2 border-b border-line p-4 sm:px-6"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Ad, e-posta veya sertifika no ile ara"
          className={`${inputClass} pl-9`}
        />
      </div>
      <button type="submit" disabled={pending} className={buttonClass("outline")}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Ara
      </button>
    </form>
  );
}
