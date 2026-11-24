import { connection } from "next/server";
import EventFrame from "@/components/EventFrame";
import SurveyView from "@/components/survey/SurveyView";
import type { SurveyProps } from "@/components/survey/types";
import { eventDefaults } from "@/content/event";
import { editionPath, eventContent, type EditionWithEvent } from "@/lib/editions";
import { getQuestions, getSurveyState } from "@/lib/survey";
import { formatRange } from "@/lib/time";
import { sessionTalks, speakerNames, type TalkData } from "@/lib/talks";

const range = (start: Date, end: Date) => ({ tr: formatRange(start, end, "tr"), en: formatRange(start, end, "en") });
const toSurveyTalks = (talks: TalkData[]) =>
  talks.map((talk) => ({ speaker: talk.speaker, title: { tr: talk.titleTr, en: talk.titleEn } }));

// The texts around the survey: an event year brings its own; a conference year borrows the
// event template's survey texts with its own name.
function frameOf(edition: EditionWithEvent) {
  if (edition.event.template === "EVENT") return { content: eventContent(edition), base: editionPath(edition) };
  const content = eventDefaults();
  const name = { tr: edition.eventName, en: edition.eventName };
  const messages = content.messages as { meta: Record<string, unknown> };
  return { content: { ...content, messages: { ...messages, meta: { ...messages.meta, name } } }, base: "/" };
}

// The "Etkinlik Memnuniyet Anketi" of one event year. Reached by QR code only. Whether the
// form is open is decided per request (admin switch, mode and speaker time windows).
export default async function SurveyPage({ edition }: { edition: EditionWithEvent }) {
  await connection();
  const [state, questions] = await Promise.all([getSurveyState(edition), getQuestions(edition.id)]);
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
      editionId: edition.id,
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

  const { content, base } = frameOf(edition);
  return (
    <EventFrame content={content} base={base}>
      <SurveyView {...props} />
    </EventFrame>
  );
}
