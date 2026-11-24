import en from "./i18n/messages/en.json";
import tr from "./i18n/messages/tr.json";
import speakers from "./data/speakers.json";
import committees from "./data/committees.json";
import { site } from "./config/site";
import { defaultPages } from "./config/navigation";
import { toBilingual } from "@/lib/bilingual";
import type { Speaker } from "./data/speakers";
import type { CommitteeId, Member } from "./data/committees";

// Everything a CONFDSA year shows: texts (as { tr, en } pairs), contact details, speakers,
// committees and which menu pages are published. These are the defaults from the code; a
// year's saved content (admin panel → Metinler) is laid over them.
export const conferenceDefaults = () => ({
  messages: toBilingual(en, tr),
  site: { ...site },
  speakers: speakers as Speaker[],
  committees: committees as Record<CommitteeId, Member[]>,
  pages: defaultPages(),
});

export type ConferenceContent = ReturnType<typeof conferenceDefaults>;
