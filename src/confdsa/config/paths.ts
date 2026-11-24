// First path segments of the conference pages. They all live in the year tree
// (app/(conference)/[year]/...): "/program" shows the current year through a rewrite in
// next.config.ts, "/2026/program" shows an earlier year. Keep in sync with that folder.
export const conferencePaths = [
  "abstract-submission",
  "accommodation",
  "awards",
  "committees",
  "contact",
  "important-dates",
  "paper-publications",
  "program",
  "registration",
  "registration-fee",
  "social-activities",
  "speakers",
  "topics-and-scopes",
];
