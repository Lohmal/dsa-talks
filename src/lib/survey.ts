import "server-only";
import { cache } from "react";
import type { Edition, SurveySession } from "@prisma/client";
import { db } from "./db";

// A form opened inside a speaker window can still be sent this long after the window ends,
// so nobody loses their answers while finishing the last questions.
export const GRACE_MS = 15 * 60 * 1000;

// The survey settings (switch, mode, event details) are fields of the year (Edition).
export type SurveyState =
  | { status: "closed"; settings: Edition }
  | { status: "waiting"; settings: Edition; next: SurveySession | null }
  | { status: "open"; settings: Edition; session: SurveySession | null };

// Is this year's survey taking answers right now, and for which speaker window? Both window
// lookups run together.
export async function getSurveyState(edition: Edition, now = new Date()): Promise<SurveyState> {
  const where = { editionId: edition.id };
  const [session, next] = await Promise.all([
    db.surveySession.findFirst({ where: { ...where, startsAt: { lte: now }, endsAt: { gt: now } }, orderBy: { startsAt: "asc" } }),
    db.surveySession.findFirst({ where: { ...where, startsAt: { gt: now } }, orderBy: { startsAt: "asc" } }),
  ]);
  if (!edition.isOpen) return { status: "closed", settings: edition };
  if (edition.mode === "EVENT") return { status: "open", settings: edition, session: null };
  if (session) return { status: "open", settings: edition, session };
  return { status: "waiting", settings: edition, next };
}

// cache(): pages and helpers asking for the same questions in one request share one query.
export const getQuestions = cache((editionId: string) =>
  db.question.findMany({ where: { editionId }, orderBy: { order: "asc" } }),
);

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
