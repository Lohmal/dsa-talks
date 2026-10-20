# DSATalks

One-page site for DSATalks (Adana Alparslan Türkeş Science and Technology University, 4–5 November 2026, ATÜ Library Conference Hall).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Docker: `docker compose up -d --build` (standalone Next.js server on port 3000).

## Where things live

```
src/
  app/                  layout (Poppins, metadata), page (section order), icon.svg
  components/           Header, Hero (+ Constellation canvas, date badge, info strip),
                        About, Speakers (+ biography dialog), Program, Venue, Footer, ui
  config/site.ts        Instagram, website, e-mail (shown once filled in), map query
  data/speakers.ts      Speakers: name, affiliation, photo, biography, academic links
  i18n/messages/        en.json / tr.json — every text, including the program
public/images/speakers  Speaker photos (square .webp)
```

## SEO and sharing

`src/app` holds the metadata files: `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`
(the link preview, drawn with the Poppins files in `src/assets/fonts`), `icon.svg` and `apple-icon.png`.
The home page also carries schema.org `Event` data (dates, venue, speakers, talks).

The absolute site address comes from `src/config/url.ts`: on Vercel the production domain is used
automatically; once the site has its own domain, set `NEXT_PUBLIC_SITE_URL` (e.g. `https://dsatalks.example.com`)
in the Vercel project settings and redeploy.

Talk titles and times come from `program.days` in the message files; the speaker cards and badges
("Day 1 · 10:15") are derived from it, so the program only needs to be edited in one place.
