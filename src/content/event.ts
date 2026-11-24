import en from "@/i18n/messages/en.json";
import tr from "@/i18n/messages/tr.json";
import committees from "@/data/committees.json";
import { defaultSpeakers } from "@/data/speakers";
import { site } from "@/config/site";
import { toBilingual } from "@/lib/bilingual";
import type { Committees } from "@/data/committees";

// Everything an event year (the DSATalks template) shows: texts (as { tr, en } pairs),
// contact details, speakers and committees. These are the defaults from the code; a year's
// saved content (admin panel → Metinler) is laid over them.
export const eventDefaults = () => ({
  messages: toBilingual(en, tr),
  site: { ...site },
  speakers: defaultSpeakers,
  committees: committees as Committees,
});

export type EventContent = ReturnType<typeof eventDefaults>;
