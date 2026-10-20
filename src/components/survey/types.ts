// Plain data passed from the /anket page (server) to the survey UI (client).

type Bilingual = { tr: string; en: string };

export type SurveyQuestion = {
  id: string;
  type: "RATING" | "TEXT";
  textTr: string;
  textEn: string;
  required: boolean;
};

export type SurveyInfo = {
  eventName: string;
  speaker: string;
  talk: Bilingual | null;
  dateTime: Bilingual;
  venue: Bilingual;
};

export type SurveyProps =
  | { status: "closed" }
  | { status: "waiting"; next: { speaker: string; talk: Bilingual; dateTime: Bilingual } | null }
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
