"use client";

import Button from "@/confdsa/components/ui/Button";
import { useLanguage, type Messages } from "@/confdsa/i18n/LanguageProvider";

export type InfoPageKey = keyof Messages["infoPages"];

type Section = { title: string; text: string; items: string[]; linkLabel: string; linkUrl: string };
type Fee = { label: string; value: string };

// The text pages of the conference (registration, fees, accommodation, …), all edited in the
// admin panel under İçerik → Metinler → Bilgi sayfaları. Empty parts are left out.
export default function InfoPage({ page }: { page: InfoPageKey }) {
  const { m } = useLanguage();
  const { intro, sections } = m.infoPages[page] as { intro: string; sections: Section[] };
  const fees = (m.infoPages[page] as { fees?: Fee[] }).fees ?? [];

  return (
    <div className="space-y-6">
      {intro && <p className="text-lg leading-relaxed text-muted">{intro}</p>}

      {fees.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <table className="w-full text-left">
            <tbody className="divide-y divide-line">
              {fees.map((fee, index) => (
                <tr key={index}>
                  <th scope="row" className="px-5 py-4 font-semibold text-navy">{fee.label}</th>
                  <td className="px-5 py-4 text-right text-muted">{fee.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sections.map((section, index) => (
        <section key={index} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          {section.title && <h2 className="text-xl font-bold text-navy">{section.title}</h2>}
          {section.text && <p className="mt-2 whitespace-pre-line leading-relaxed text-muted">{section.text}</p>}
          {section.items.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted marker:text-brand">
              {section.items.filter(Boolean).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          {section.linkLabel && section.linkUrl && (
            <Button href={section.linkUrl} variant="outline" external={/^https?:/.test(section.linkUrl)} className="mt-4">
              {section.linkLabel}
            </Button>
          )}
        </section>
      ))}
    </div>
  );
}
