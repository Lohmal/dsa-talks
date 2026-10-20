import type { Metadata } from "next";
import { connection } from "next/server";
import SurveyView from "@/components/survey/SurveyView";
import type { SurveyProps } from "@/components/survey/types";
import { getQuestions, getSurveyState } from "@/lib/survey";
import { formatRange } from "@/lib/time";
import { sessionTalks, speakerNames, type TalkData } from "@/lib/talks";

export const metadata: Metadata = {
  title: "Etkinlik Memnuniyet Anketi | DSATalks",
  description: "DSATalks Etkinlik Memnuniyet Anketi – Event Satisfaction Survey",
  robots: { index: false, follow: false },
};

const range = (start: Date, end: Date) => ({ tr: formatRange(start, end, "tr"), en: formatRange(start, end, "en") });
const toSurveyTalks = (talks: TalkData[]) =>
  talks.map((talk) => ({ speaker: talk.speaker, title: { tr: talk.titleTr, en: talk.titleEn } }));

// Reached by QR code only; it is not linked from the site. Whether the form is open is
// decided per request (admin switch, mode and speaker time windows).
export default async function SurveyPage() {
  await connection();
  // Both lookups at once: one database round trip.
  const [state, questions] = await Promise.all([getSurveyState(), getQuestions()]);
  let props: SurveyProps;

  if (state.status === "closed") {
    props = { status: "closed" };
  } else if (state.status === "waiting") {
    const next = state.next;
    props = {
      status: "waiting",
      next: next ? { talks: toSurveyTalks(sessionTalks(next)), dateTime: range(next.startsAt, next.endsAt) } : null,
    };
  } else {
    const { settings, session } = state;
    const talks = session ? sessionTalks(session) : [];
    props = {
      status: "open",
      mode: settings.mode,
      sessionId: session?.id ?? null,
      info: {
        eventName: settings.eventName,
        speaker: session ? speakerNames(talks) : settings.speakersText,
        talks: toSurveyTalks(talks),
        dateTime: session ? range(session.startsAt, session.endsAt) : { tr: settings.eventDateTr, en: settings.eventDateEn },
        venue: { tr: settings.venueTr, en: settings.venueEn },
      },
      questions: questions.map(({ id, type, textTr, textEn, required, options, allowOther }) => ({
        id,
        type,
        textTr,
        textEn,
        required,
        options: options.map(({ tr, en }) => ({ tr, en })),
        allowOther,
      })),
    };
  }

  return <SurveyView {...props} />;
}
