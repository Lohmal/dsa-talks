import "server-only";
import { scopeOptions } from "./stats";
import { formatRange } from "./time";
import { sessionTalks, speakerNames } from "./talks";

// Options for the "Kapsam" filter: everything, the whole-event survey, each speaker window.
export async function scopeSelectOptions() {
  const { sessions, eventCount } = await scopeOptions();
  return [
    { value: "all", label: "Tüm yanıtlar" },
    ...(eventCount ? [{ value: "event", label: "Toplantı bazında (tüm etkinlik)" }] : []),
    ...sessions.map((session) => ({
      value: session.id,
      label: `${speakerNames(sessionTalks(session))} · ${formatRange(session.startsAt, session.endsAt, "tr")}`,
    })),
  ];
}

export function readScope(value: string | string[] | undefined) {
  return typeof value === "string" && value ? value : "all";
}
