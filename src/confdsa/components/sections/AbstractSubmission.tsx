"use client";

import Button, { DisabledButton } from "@/confdsa/components/ui/Button";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

export default function AbstractSubmission() {
  const { m, site } = useLanguage();

  const cards = [
    {
      title: m.abstract.templateTitle,
      text: m.abstract.templateText,
      button: site.abstractTemplateUrl ? (
        <Button href={site.abstractTemplateUrl} download>
          {m.abstract.templateButton}
        </Button>
      ) : (
        <DisabledButton>{m.abstract.notAvailableYet}</DisabledButton>
      ),
    },
    {
      title: m.abstract.cmtTitle,
      text: m.abstract.cmtText,
      button: site.cmtUrl ? (
        <Button href={site.cmtUrl} external>
          {m.abstract.cmtButton} ↗
        </Button>
      ) : (
        <DisabledButton>{m.abstract.notAvailableYet}</DisabledButton>
      ),
    },
  ];

  return (
    <div>
      <p className="max-w-2xl text-lg text-muted">{m.abstract.intro}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {cards.map((card, index) => (
          <div key={card.title} className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm">
            <span className="text-sm font-bold text-brand">0{index + 1}</span>
            <h2 className="mt-2 text-xl font-bold text-navy">{card.title}</h2>
            <p className="mt-2 flex-1 text-muted">{card.text}</p>
            <div className="mt-6">{card.button}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
