"use client";

import { locales, useLanguage } from "@/confdsa/i18n/LanguageProvider";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, m } = useLanguage();

  return (
    <div
      role="group"
      aria-label={m.common.language}
      className={`inline-flex rounded-full border border-line bg-white p-0.5 text-xs font-semibold ${className}`}
    >
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            locale === code ? "bg-navy text-white" : "text-muted hover:text-navy"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
