"use client";

import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Placeholder for pages whose content has not been provided yet.
export default function ComingSoon() {
  const { m } = useLanguage();

  return (
    <div className="rounded-2xl border border-dashed border-navy/15 bg-white px-6 py-14 text-center">
      <p className="text-lg font-semibold text-navy">{m.common.comingSoon}</p>
      <p className="mt-2 text-muted">{m.common.comingSoonText}</p>
    </div>
  );
}
