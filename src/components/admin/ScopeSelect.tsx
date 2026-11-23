"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Select from "./Select";

// Filters a page through a query parameter ("scope" by default: "all", "event" or a speaker
// window); keeps the other parameters and shows a spinner while the filtered page loads.
export default function ScopeSelect({
  value,
  options,
  param = "scope",
  label = "Kapsam",
  className = "min-w-0 md:w-80",
}: {
  value: string;
  options: { value: string; label: string }[];
  param?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      label={label}
      value={value}
      options={options}
      loading={pending}
      disabled={pending}
      className={className}
      onChange={(next) => {
        const params = new URLSearchParams(searchParams);
        if (next === "all") params.delete(param);
        else params.set(param, next);
        params.delete("page");
        const query = params.toString();
        startTransition(() => router.push(query ? `${pathname}?${query}` : pathname));
      }}
    />
  );
}
