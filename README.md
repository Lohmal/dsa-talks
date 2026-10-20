# DSATalks

One-page site for DSATalks (Adana Alparslan Türkeş Science and Technology University, 4–5 November 2026, ATÜ Library Conference Hall),
with the Event Satisfaction Survey (`/anket`), participation certificates and an admin panel (`/admin`).

```bash
cp .env.example .env   # fill in DATABASE_URL and AUTH_SECRET
npm install            # also runs `prisma generate`
npm run db:push        # creates the MongoDB indexes (once, and after schema changes)
npm run dev            # http://localhost:3000
npm run build
```

Docker: `docker compose up -d --build` starts the site on port 3000 and Mailpit (test inbox for certificate
e-mails) on http://localhost:8025. The site reads `.env`; the database is MongoDB Atlas.

## Survey, certificates and admin panel

- **`/anket`** – "Etkinlik Memnuniyet Anketi" (TR/EN). Not linked from the site; shared by QR code.
  After submitting, the participant sees and downloads the certificate (PDF, English) and receives it by e-mail.
- **`/admin`** – not linked anywhere. On a fresh database the first account is created automatically:
  `admin@admin.com` / `admin123` (only when there are no admins at all). Add your own admin and remove or change it.
  - *Genel Bakış*: totals, average satisfaction, per-question averages and 5…1 distribution charts, filter by session.
  - *Yanıtlar*: search, details, certificate download, resend e-mail, delete, Excel export (`/admin/export`).
  - *Anket Ayarları*: open/close registration; mode
    - **Toplantı bazında** – open until closed, one response per e-mail;
    - **Konuşmacı bazında** – open only inside the time windows (entered in Türkiye time, UTC+3). A window can
      hold several talks (speakers); one response and one certificate (listing all its talks) per e-mail per
      window. A form opened in a window can still be sent 15 minutes after it ends.
  - *Sorular*: add, edit, reorder and delete questions — 5-point, multiple choice (with an optional
    “other” field; used for the topics participants would like to see) or text. Answers store the question
    text, so editing questions never changes earlier results.
  - *Yöneticiler*: add, edit and remove admins (the last admin cannot be removed).
  - *QR Kod*: PNG of the survey link, plain or as a printable poster.

Certificates are drawn on request from `src/lib/certificate.tsx` (fonts and logos in `src/assets`), so nothing is
stored but the response. The download link contains a long random token. Each certificate carries its number and a
QR code for **`/dogrula`**, where anyone can check a certificate number (only what is printed on it is shown).
The QR code and links use `NEXT_PUBLIC_SITE_URL` when set, otherwise the address the site was opened with.

**`/kurullar`** lists the committees (data in `src/data/committees.json`, shared with the CONFDSA site).

E-mail: set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` in `.env`
(and, with Docker, remove the two SMTP lines under `environment` in `docker-compose.yml`). If sending fails the
response is still saved; the admin can resend from the response page.

On Vercel add `DATABASE_URL` and `AUTH_SECRET` (plus the SMTP keys) as environment variables; in MongoDB Atlas allow
Vercel's IPs (or 0.0.0.0/0) under Network Access.

## Where things live

```
prisma/schema.prisma    MongoDB models: User, Settings, SurveySession, Question, Response
src/
  app/                  site page, /anket (survey + server action), /admin (panel, login, export),
                        /api/certificate/[token] (PDF/PNG), metadata files
  auth.ts, proxy.ts     Auth.js (credentials) and the /admin guard
  components/           site sections, survey/ (form UI), admin/ (panel UI, charts, QR)
  lib/                  db, bootstrap (first admin, defaults), survey state, certificate, mail, stats, export, time
  config/site.ts        Instagram, website, e-mail, map query
  data/speakers.ts      Speakers: name, affiliation, photo, biography, academic links
  i18n/messages/        en.json / tr.json — every public text, including the program and the survey
public/images/speakers  Speaker photos (square .webp)
```

## SEO and sharing

`src/app` holds the metadata files: `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`
(the link preview, drawn with the Poppins files in `src/assets/fonts`), `icon.svg` and `apple-icon.png`.
The home page also carries schema.org `Event` data (dates, venue, speakers, talks). `/admin`, `/anket` and `/api`
are excluded from indexing.

The absolute site address comes from `src/config/url.ts`: on Vercel the production domain is used
automatically; once the site has its own domain, set `NEXT_PUBLIC_SITE_URL` (e.g. `https://dsatalks.example.com`)
in the Vercel project settings and redeploy.

Talk titles and times come from `program.days` in the message files; the speaker cards and badges
("Day 1 · 10:15") are derived from it, so the program only needs to be edited in one place.
