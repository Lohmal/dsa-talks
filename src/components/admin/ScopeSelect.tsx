"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Select from "./Select";

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
    <Select
      label="Kapsam"
      value={value}
      options={options}
      loading={pending}
      disabled={pending}
      className="min-w-0 md:w-80"
      onChange={(next) => {
        const params = new URLSearchParams(searchParams);
        if (next === "all") params.delete("scope");
        else params.set("scope", next);
        params.delete("page");
        const query = params.toString();
        startTransition(() => router.push(query ? `${pathname}?${query}` : pathname));
      }}
    />
  );
}
