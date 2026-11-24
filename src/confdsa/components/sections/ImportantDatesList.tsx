"use client";

import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

export default function ImportantDatesList() {
  const { m } = useLanguage();

  return (
    <ol className="relative space-y-4 border-l-2 border-line pl-8">
      {m.importantDates.items.map((item, index) => (
        <li key={item.label} className="relative rounded-2xl border border-line bg-white p-5 shadow-sm">
          <span className="absolute -left-11.25 top-5 grid size-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">
            {String(index + 1).padStart(2, "0")}
          </span>
          <p className="font-semibold text-navy">{item.label}</p>
          <p className="mt-1 text-muted">{item.date}</p>
        </li>
      ))}
    </ol>
  );
}
