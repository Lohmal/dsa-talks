"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { inputClass } from "./ui";

// Filters a page by "all", "event" or a speaker window; keeps the other query parameters
// and shows a spinner while the filtered page loads.
export default function ScopeSelect({
  value,
  options,
}: {
  value: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative min-w-0 md:w-72">
      <select
        aria-label="Kapsam"
        aria-busy={pending}
        value={value}
        disabled={pending}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams);
          if (event.target.value === "all") params.delete("scope");
          else params.set("scope", event.target.value);
          params.delete("page");
          const query = params.toString();
          startTransition(() => router.push(query ? `${pathname}?${query}` : pathname));
        }}
        className={`${inputClass} w-full truncate pr-9 font-semibold disabled:opacity-70`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {pending && (
        <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-brand" />
      )}
    </div>
  );
}
