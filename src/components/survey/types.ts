// Plain data passed from the /anket page (server) to the survey UI (client).

type Bilingual = { tr: string; en: string };

export type SurveyQuestion = {
  id: string;
  type: "RATING" | "TEXT" | "CHOICE";
  textTr: string;
  textEn: string;
  required: boolean;
  options: Bilingual[]; // CHOICE
  allowOther: boolean; // CHOICE
};

export type SurveyTalk = { speaker: string; title: Bilingual };

export type SurveyInfo = {
  eventName: string;
  speaker: string; // all speakers of the window, or the event's speakers in EVENT mode
  talks: SurveyTalk[]; // empty in EVENT mode
  dateTime: Bilingual;
  venue: Bilingual;
};

export type SurveyProps =
  | { status: "closed" }
  | { status: "waiting"; next: { talks: SurveyTalk[]; dateTime: Bilingual } | null }
  | {
      status: "open";
      mode: "EVENT" | "SESSION";
      sessionId: string | null;
      info: SurveyInfo;
      questions: SurveyQuestion[];
    };

export type SubmitResult =
  | {
      status: "success";
      name: string;
      email: string;
      certificateNo: string;
      token: string;
      emailSent: boolean;
    }
  | {
      status: "error";
      code: "invalid" | "closed" | "duplicate" | "duplicateSession" | "server";
      fields?: string[]; // "name", "email" or question ids
    };
