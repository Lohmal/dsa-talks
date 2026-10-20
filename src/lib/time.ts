// Türkiye has used UTC+3 all year round since 2016, so times are entered and shown in that
// offset and stored in UTC. Everything here is safe to use on both server and client.

export const TIME_ZONE = "Europe/Istanbul";
const OFFSET = "+03:00";

// "2026-11-04" + "10:15" (as typed by an admin in Türkiye) → the matching UTC instant.
export function fromIstanbul(date: string, time: string) {
  const parsed = new Date(`${date}T${time}:00${OFFSET}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// The inverse, for filling <input type="date"> and <input type="time">.
export function toIstanbulParts(value: Date | string) {
  const shifted = new Date(new Date(value).getTime() + 3 * 60 * 60 * 1000);
  const iso = shifted.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

const intlLocale = (locale: string) => (locale === "tr" ? "tr-TR" : "en-GB");

export function formatDate(value: Date | string, locale: string) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatTime(value: Date | string, locale = "tr") {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string, locale = "tr") {
  return `${formatDate(value, locale)} ${formatTime(value, locale)}`;
}

// "4 Kasım 2026, 10:15–12:00"
export function formatRange(start: Date | string, end: Date | string, locale: string) {
  return `${formatDate(start, locale)}, ${formatTime(start, locale)}–${formatTime(end, locale)}`;
}

// Where a speaker window stands right now.
export function windowStatus(start: Date, end: Date, now = Date.now()) {
  if (end.getTime() <= now) return "past" as const;
  return start.getTime() <= now ? ("live" as const) : ("upcoming" as const);
}
