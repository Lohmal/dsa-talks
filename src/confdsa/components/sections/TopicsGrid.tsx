"use client";

import FadeIn from "@/confdsa/components/ui/FadeIn";
import {
  BarChartIcon,
  DatabaseIcon,
  DnaIcon,
  FilterIcon,
  FingerprintIcon,
  LightbulbIcon,
  PieChartIcon,
  ServerIcon,
  SigmaIcon,
} from "@/confdsa/components/ui/Icons";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Icon names used in messages → topics.items[].icon
const icons = {
  dna: DnaIcon,
  fingerprint: FingerprintIcon,
  barChart: BarChartIcon,
  database: DatabaseIcon,
  server: ServerIcon,
  filter: FilterIcon,
  sigma: SigmaIcon,
  pieChart: PieChartIcon,
  lightbulb: LightbulbIcon,
} as const;

export default function TopicsGrid() {
  const { m } = useLanguage();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {m.topics.items.map((topic, index) => {
        const Icon = icons[topic.icon as keyof typeof icons] ?? LightbulbIcon;
        return (
          <li key={topic.title} className="h-full">
            <FadeIn delay={(index % 3) * 0.06} className="h-full">
              <div className="group flex h-full items-center gap-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy/5 transition-all duration-300 hover:-translate-y-0.5 hover:ring-brand/30">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-navy text-white transition-colors group-hover:bg-brand">
                  <Icon className="size-6" />
                </span>
                <div>
                  <span className="text-xs font-bold text-brand">{String(index + 1).padStart(2, "0")}</span>
                  <p className="font-semibold leading-snug text-navy">{topic.title}</p>
                </div>
              </div>
            </FadeIn>
          </li>
        );
      })}
    </ul>
  );
}
