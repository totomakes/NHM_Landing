# NHM Unleashed — Landing Page

Landing page for the **NHM (No Half Measures) Unleashed** launch event on **May 23, 2026**.

NHM is a 501(c)(3) non-profit based in Fredericksburg, VA, meeting people in addiction, recovery, and transition — connecting them to community, job training, and housing.

---

## What's on the Page

| Section | Description |
|---|---|
| **Hero + Countdown** | Live countdown to May 23, 2026 · 6:00 PM EDT at The Woolen Mill |
| **Mission** | Four pillars: In Addiction, In Recovery, Transitioning Out, At Every Stage |
| **On the Ground** | Parallax photo mosaic — street, gathering, work, housing, training |
| **Manifesto** | "All in is the only way out." — the NHM conviction |
| **Values** | Six core values: Purpose, Generosity, Excellence, Truth, Standard, Potential |
| **Event** | Event details, evening schedule, and RSVP button |
| **Footer** | Ticker, links, social |

---

## Countdown Target

```
May 23, 2026  ·  6:00 PM EDT  ·  The Woolen Mill  ·  Fredericksburg, VA
```

The countdown uses `new Date('2026-05-23T18:00:00-04:00')` (EDT / UTC-4) and ticks every second client-side. No server required — fully static.

---

## Tech

- **Astro** (static output — builds to plain HTML/CSS/JS, no client framework)
- Fonts: Archivo Black, Archivo, Archivo Narrow, JetBrains Mono via Google Fonts
- Deployed as a static site on **Vercel** (builds `astro build` on every push)

### Structure

```
src/
  pages/        index.astro · donate.astro · recap.astro   ← one file per page
  components/   Nav · Ticker · Newsletter · Footer          ← shared modules (edit once, updates every page)
  layouts/      Base.astro                                  ← shared <head>, meta, fonts, site scripts
public/         photos, images, assets/*.js, favicons, adminlog.html, nhm.html (served as-is)
api/            Vercel serverless functions (login/save/content/geo for the live editor)
content.json    live-editable copy (written by /adminlog editor via GitHub API)
```

---

## Local Preview

```bash
bun install        # or: npm install
bun run dev        # or: npm run dev → http://localhost:4321 (hot reload)
bun run build      # production build into dist/
```

---

## Deployment

Hosted on Vercel. Every push to `main` triggers a new deployment.

```bash
vercel --prod
```

---

## License

© 2026 No Half Measures · All rights reserved.
