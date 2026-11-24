"use client";

import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

export default function TopicsIntro() {
  const { m } = useLanguage();
  return <p className="max-w-3xl text-lg text-muted">{m.topics.intro}</p>;
}
