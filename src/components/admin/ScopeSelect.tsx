"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { inputClass } from "./ui";

// Filters a page by "all", "event" or a speaker window; keeps the other query parameters.
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

  return (
    <select
      aria-label="Kapsam"
      value={value}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams);
        if (event.target.value === "all") params.delete("scope");
        else params.set("scope", event.target.value);
        params.delete("page");
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
      }}
      className={`${inputClass} w-auto min-w-56 font-semibold`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
