import type { Metadata } from "next";
import { connection } from "next/server";
import SurveyView from "@/components/survey/SurveyView";
import type { SurveyProps } from "@/components/survey/types";
import { getQuestions, getSurveyState } from "@/lib/survey";
import { formatRange } from "@/lib/time";

export const metadata: Metadata = {
  title: "Etkinlik Memnuniyet Anketi | DSATalks",
  description: "DSATalks Etkinlik Memnuniyet Anketi – Event Satisfaction Survey",
  robots: { index: false, follow: false },
};

const range = (start: Date, end: Date) => ({ tr: formatRange(start, end, "tr"), en: formatRange(start, end, "en") });

// Reached by QR code only; it is not linked from the site. Whether the form is open is
// decided per request (admin switch, mode and speaker time windows).
export default async function SurveyPage() {
  await connection();
  const state = await getSurveyState();
  let props: SurveyProps;

  if (state.status === "closed") {
    props = { status: "closed" };
  } else if (state.status === "waiting") {
    const next = state.next;
    props = {
      status: "waiting",
      next: next
        ? { speaker: next.speaker, talk: { tr: next.titleTr, en: next.titleEn }, dateTime: range(next.startsAt, next.endsAt) }
        : null,
    };
  } else {
    const { settings, session } = state;
    const questions = await getQuestions();
    props = {
      status: "open",
      mode: settings.mode,
      sessionId: session?.id ?? null,
      info: {
        eventName: settings.eventName,
        speaker: session?.speaker ?? settings.speakersText,
        talk: session ? { tr: session.titleTr, en: session.titleEn } : null,
        dateTime: session ? range(session.startsAt, session.endsAt) : { tr: settings.eventDateTr, en: settings.eventDateEn },
        venue: { tr: settings.venueTr, en: settings.venueEn },
      },
      questions: questions.map(({ id, type, textTr, textEn, required }) => ({ id, type, textTr, textEn, required })),
    };
  }

  return <SurveyView {...props} />;
}
