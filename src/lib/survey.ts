import "server-only";
import { cache } from "react";
import type { Settings, SurveySession } from "@prisma/client";
import { db } from "./db";
import { ensureDefaults } from "./bootstrap";

// A form opened inside a speaker window can still be sent this long after the window ends,
// so nobody loses their answers while finishing the last questions.
export const GRACE_MS = 15 * 60 * 1000;

export type SurveyState =
  | { status: "closed"; settings: Settings }
  | { status: "waiting"; settings: Settings; next: SurveySession | null }
  | { status: "open"; settings: Settings; session: SurveySession | null };

// cache(): pages, layouts and helpers asking for the same data in one request share one query.
export const getSettings = cache(async () => {
  await ensureDefaults();
  return db.settings.findUniqueOrThrow({ where: { key: "main" } });
});

// Is the survey taking answers right now, and for which speaker window? The three lookups
// run together (one database round trip instead of three in a row).
export async function getSurveyState(now = new Date()): Promise<SurveyState> {
  const [settings, session, next] = await Promise.all([
    getSettings(),
    db.surveySession.findFirst({ where: { startsAt: { lte: now }, endsAt: { gt: now } }, orderBy: { startsAt: "asc" } }),
    db.surveySession.findFirst({ where: { startsAt: { gt: now } }, orderBy: { startsAt: "asc" } }),
  ]);
  if (!settings.isOpen) return { status: "closed", settings };
  if (settings.mode === "EVENT") return { status: "open", settings, session: null };
  if (session) return { status: "open", settings, session };
  return { status: "waiting", settings, next };
}

export const getQuestions = cache(() => db.question.findMany({ orderBy: { order: "asc" } }));

// "volkan KIVANÇ" → "Volkan Kıvanç": words typed all in lower or upper case get a capital
// first letter; words with their own mixed casing (e.g. "McDonald") are kept as typed.
// Turkish casing rules (I ↔ ı, İ ↔ i) apply when the form was filled in Turkish.
export function tidyName(raw: string, locale = "tr") {
  const rules = locale === "en" ? "en" : "tr";
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      const lower = word.toLocaleLowerCase(rules);
      if (word !== lower && word !== word.toLocaleUpperCase(rules)) return word;
      return lower.charAt(0).toLocaleUpperCase(rules) + lower.slice(1);
    })
    .join(" ");
}
