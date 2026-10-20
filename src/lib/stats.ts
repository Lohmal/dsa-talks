import "server-only";
import type { Prisma, Question, Response } from "@prisma/client";
import { db } from "./db";
import { responseTalks, speakerNames, talkTitles } from "./talks";

// Which responses an admin page, chart or Excel export looks at:
// "all", "event" (EVENT mode) or a speaker window id.
export type Scope = string;

export function scopeWhere(scope: Scope | undefined): Prisma.ResponseWhereInput {
  if (!scope || scope === "all") return {};
  if (scope === "event") return { scope: "event" };
  return /^[a-f0-9]{24}$/.test(scope) ? { sessionId: scope } : { id: "000000000000000000000000" };
}

export async function scopeOptions() {
  const [sessions, eventCount] = await Promise.all([
    db.surveySession.findMany({ orderBy: { startsAt: "asc" } }),
    db.response.count({ where: { scope: "event" } }),
  ]);
  return { sessions, eventCount };
}

export type QuestionStat = {
  questionId: string;
  text: string;
  average: number | null;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

// Averages and 5…1 counts per rating question. Questions that were deleted after people
// answered them still appear (with the text they had), after the current ones.
export function ratingStats(responses: Pick<Response, "answers">[], questions: Question[]): QuestionStat[] {
  const stats = new Map<string, QuestionStat & { sum: number }>();
  const ensure = (questionId: string, text: string) => {
    let stat = stats.get(questionId);
    if (!stat) {
      stat = { questionId, text, average: null, count: 0, sum: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      stats.set(questionId, stat);
    }
    return stat;
  };

  for (const question of questions) if (question.type === "RATING") ensure(question.id, question.textTr);
  for (const response of responses) {
    for (const answer of response.answers) {
      if (answer.type !== "RATING" || !answer.rating) continue;
      const stat = ensure(answer.questionId, answer.textTr);
      stat.count += 1;
      stat.sum += answer.rating;
      stat.distribution[answer.rating as 1 | 2 | 3 | 4 | 5] += 1;
    }
  }

  return [...stats.values()]
    .filter((stat) => stat.count > 0 || questions.some((q) => q.id === stat.questionId))
    .map(({ sum, ...stat }) => ({ ...stat, average: stat.count ? sum / stat.count : null }));
}

// Mean of all ratings in one response, for lists.
export function responseAverage(response: Pick<Response, "answers">) {
  const ratings = response.answers.map((answer) => answer.rating).filter((rating): rating is number => !!rating);
  return ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
}

export function overallAverage(stats: QuestionStat[]) {
  let sum = 0;
  let count = 0;
  for (const stat of stats) {
    if (stat.average === null) continue;
    sum += stat.average * stat.count;
    count += stat.count;
  }
  return count ? sum / count : null;
}

export function scopeLabel(response: Pick<Response, "scope" | "talks" | "speaker" | "talkTitleTr" | "talkTitleEn">) {
  if (response.scope === "event") return "Tüm etkinlik";
  const talks = responseTalks(response);
  return talks.length ? `${speakerNames(talks)} – ${talkTitles(talks, "tr")}` : "Konuşmacı oturumu";
}

export type ChoiceStat = {
  questionId: string;
  text: string;
  respondents: number; // people who answered the question at all
  options: { label: string; count: number }[]; // most picked first
  others: string[]; // free-text "other" answers
};

// How often each option of a multiple-choice question was ticked.
export function choiceStats(responses: Pick<Response, "answers">[], questions: Question[]): ChoiceStat[] {
  const stats = new Map<string, ChoiceStat & { counts: Map<string, number> }>();
  const ensure = (questionId: string, text: string) => {
    let stat = stats.get(questionId);
    if (!stat) {
      stat = { questionId, text, respondents: 0, options: [], others: [], counts: new Map() };
      stats.set(questionId, stat);
    }
    return stat;
  };
  for (const q of questions) {
    if (q.type !== "CHOICE") continue;
    const stat = ensure(q.id, q.textTr);
    for (const option of q.options) stat.counts.set(option.tr, 0);
  }
  for (const response of responses) {
    for (const answer of response.answers) {
      if (answer.type !== "CHOICE") continue;
      const stat = ensure(answer.questionId, answer.textTr);
      if (answer.choices.length || answer.text) stat.respondents += 1;
      for (const choice of answer.choices) stat.counts.set(choice.tr, (stat.counts.get(choice.tr) ?? 0) + 1);
      if (answer.text) stat.others.push(answer.text);
    }
  }
  return [...stats.values()].map(({ counts, ...stat }) => ({
    ...stat,
    options: [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
  }));
}

// How many responses arrived in the last `hours` hours.
export function countSince(responses: Pick<Response, "createdAt">[], hours: number) {
  const since = Date.now() - hours * 60 * 60 * 1000;
  return responses.filter((response) => response.createdAt.getTime() > since).length;
}
