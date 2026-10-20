// Talks of a speaker time window. Windows (and responses) saved before a window could hold
// several talks kept a single speaker and title in separate fields; these helpers read both.

export type TalkData = { speaker: string; titleTr: string; titleEn: string };

type WithTalks = {
  talks: TalkData[];
  speaker?: string | null;
  titleTr?: string | null;
  titleEn?: string | null;
};

export function sessionTalks(session: WithTalks): TalkData[] {
  if (session.talks.length) return session.talks;
  if (!session.speaker) return [];
  return [{ speaker: session.speaker, titleTr: session.titleTr ?? "", titleEn: session.titleEn ?? session.titleTr ?? "" }];
}

export function responseTalks(response: {
  talks: TalkData[];
  speaker?: string | null;
  talkTitleTr?: string | null;
  talkTitleEn?: string | null;
}): TalkData[] {
  return sessionTalks({
    talks: response.talks,
    speaker: response.speaker,
    titleTr: response.talkTitleTr,
    titleEn: response.talkTitleEn,
  });
}

// "İlker Ünal, Recep Erol"
export const speakerNames = (talks: TalkData[]) => talks.map((talk) => talk.speaker).join(", ");

// "Talk A · Talk B" in the given language.
export const talkTitles = (talks: TalkData[], locale: string) =>
  talks.map((talk) => (locale === "en" ? talk.titleEn || talk.titleTr : talk.titleTr || talk.titleEn)).join(" · ");
