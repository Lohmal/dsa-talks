"use client";

import { CalendarIcon, ClockIcon } from "@/confdsa/components/ui/Icons";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Day-by-day program laid out like the poster: red day bar with a calendar icon,
// navy column header, then one row per session. Rows stack on small screens.
export default function ProgramTable({ dayHeading: DayHeading = "h2" }: { dayHeading?: "h2" | "h3" }) {
  const { m } = useLanguage();

  return (
    <div className="space-y-8">
      {m.program.days.map((day) => (
        <section key={day.label} className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/5">
          <DayHeading className="flex items-center gap-3 bg-brand px-5 py-3.5 text-lg font-bold text-white sm:px-6">
            <CalendarIcon className="size-5 shrink-0" />
            {day.label}
          </DayHeading>

          <div className="hidden grid-cols-[9rem_1fr_1.25fr] gap-6 bg-navy px-6 py-3 text-sm font-semibold text-white md:grid">
            <span>{m.program.time}</span>
            <span>{m.program.speaker}</span>
            <span>{m.program.title}</span>
          </div>

          <ul className="divide-y divide-line">
            {day.sessions.map((session) => {
              const isBreak = "isBreak" in session;
              return (
                <li
                  key={session.time + session.speaker}
                  className={`grid gap-1.5 px-5 py-4 sm:px-6 md:grid-cols-[9rem_1fr_1.25fr] md:gap-6 ${isBreak ? "bg-surface" : ""}`}
                >
                  <span className="flex items-center gap-1.5 text-sm font-bold text-navy md:items-start">
                    <ClockIcon className="size-4 shrink-0 text-brand md:mt-0.5" />
                    {session.time}
                  </span>
                  <div>
                    <p className={isBreak ? "text-sm italic text-muted" : "font-semibold text-navy"}>{session.speaker}</p>
                    {session.affiliation && <p className="mt-0.5 text-sm text-muted">{session.affiliation}</p>}
                  </div>
                  {!isBreak && <p className="font-medium text-navy md:text-[15px]">{session.title}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
