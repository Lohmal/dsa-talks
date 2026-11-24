# CONFDSA and its events

The site of the International Conference on Data Science and Analytics (CONFDSA) and the events of the
Department of Data Science and Analytics, Adana Alparslan Türkeş Science and Technology University
(confdsa.atu.edu.tr). One Next.js project with one MongoDB database and one admin panel:

- **`/`** – CONFDSA (home page, program, speakers, committees, topics, contact, …), the current year;
  earlier years at `/2026`, `/2026/program`, …
- **`/etkinlikler`** – the events (DSATalks and later ones); each at `/etkinlikler/<event>` (current year) and
  `/etkinlikler/<event>/<year>`, with its committees at `…/kurullar`
- Event Satisfaction Survey and participation certificates per event and year, `/dogrula` for certificates,
  `/kvkk` for the information notice
- **`/admin`** – the admin panel: every text, speaker, committee and file of every year, surveys, responses,
  new events and new years

```bash
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL and the SMTP keys
npm install            # also runs `prisma generate`
npm run db:push        # creates the MongoDB indexes (once, and after schema changes)
npm run dev            # http://localhost:3000
npm run build && npm start   # production, port 8080
```

Windows Server without Docker (Node.js, MongoDB service, NSSM, IIS reverse proxy): see `KURULUM.md` (Turkish).
Docker: `docker compose up -d --build` (site on port 3000, MongoDB next to it).
`NEXT_PUBLIC_SITE_URL` is built into the pages (sitemap, link previews, certificate QR codes): change it → rebuild.

## Events and years

Everything belongs to one **year of an event** (`Edition` in `prisma/schema.prisma`): texts, speakers, committees,
survey settings, questions, time windows, responses and certificates. CONFDSA is the event `confdsa` (conference
template), DSATalks is `dsatalks` (one-page event template); new events use the event template.

- *Etkinlikler ve Yıllar* in the panel opens a new year, copying the chosen parts from an earlier one (copies
  only; the earlier year never changes), makes a year current, or adds a new event.
- The panel works on the year chosen at the top of its menu (a cookie).
- On start-up `src/lib/bootstrap.ts` brings the database up to date: the first admin, CONFDSA 2026 and DSATalks
  2026, and the data of the first version (one survey without years) moved to DSATalks 2026.

## Content (texts, details, speakers, committees)

The pages read one content tree per year (`src/confdsa/content.ts`, `src/content/event.ts`): the texts of
`src/confdsa/i18n/messages/*.json` or `src/i18n/messages/*.json` joined into `{ tr, en }` pairs
(`src/lib/bilingual.ts`), the details (`config/site.ts`), speakers and committees (`data/`), and for CONFDSA the
published menu pages. *İçerik* in the panel edits the tree of the chosen year with one generic editor
(`src/components/admin/content`) and saves it whole into the year; texts added to the code later still show up
(defaults under the saved tree). Field names in the editor: `src/components/admin/content/labels.ts`.

Files uploaded in the panel are stored in the database (`Asset`) and served at `/media/<id>`; photos are shrunk
and saved as WebP, certificate logos as PNG.

## Survey, certificates and admin panel

- **Survey**: `/anket` (DSATalks 2026, the printed QR codes), `/etkinlikler/<event>/<year>/anket`, and
  `/<year>/anket` for CONFDSA (off by default). TR/EN; after submitting, the participant downloads the certificate
  (PDF, English) and receives it by e-mail. The QR code of a year is under *QR Kod*.
  - **Toplantı bazında** – open until closed, one response per e-mail per year;
  - **Konuşmacı bazında** – open only inside the time windows (Türkiye time, UTC+3), one response per e-mail per
    window; a form opened in a window can still be sent 15 minutes after it ends.
- **Certificates** are drawn on request (`src/lib/certificate.tsx`); numbers are `<prefix>-<year>-XXXXXX` with the
  event's prefix. The event name and the second logo come from the year (*Anket Ayarları*). Each certificate has a
  QR code for **`/dogrula`**, which checks certificates of every event and year.
- **E-mails** go through a queue in the database (`src/lib/mailQueue.ts`): one SMTP connection, one mail a second,
  retries after 1, 5, 15 and 60 minutes; *Yanıtlar* can resend all failed ones. SMTP: `SMTP_HOST`, `SMTP_PORT`,
  `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (Google Workspace: `smtp.gmail.com`, port 465, an app password).
- **`/admin`**: the first admin is created when there is none (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, otherwise
  `admin@admin.com` / `admin123`). Sign-in needs the password and a 6-digit code sent by e-mail; 5 wrong
  passwords lock an address for 15 minutes; sessions end after 12 hours or when the password changes.
  **Şifremi unuttum** sends a one-time link (1 hour).

All links in e-mails, QR codes and certificates use `NEXT_PUBLIC_SITE_URL`, never the address in the request.

## Where things live

```
prisma/schema.prisma        Event, Edition (a year), Question, SurveySession, Response, Asset, User, …
src/app/(conference)/       CONFDSA: root layout, [year]/… pages (/program → /current/program, next.config.ts)
src/app/(event)/            event template pages, survey, /dogrula, /kvkk, admin panel and its actions
src/confdsa/                CONFDSA components, texts, data, menu (config/navigation.ts), content defaults
src/components/             event template components, survey UI, admin UI (content editor in admin/content)
src/lib/                    editions (years), bootstrap, survey, certificates, mail queue, stats, export, auth helpers
public/                     photos, posters, logos
```

## SEO

`src/app/sitemap.ts` lists the published CONFDSA pages, the speaker profiles and the event pages; event pages
take their title, description and link preview (`opengraph-image.tsx`) from the year's texts. The admin panel,
the surveys and `/api` stay out of search results.
