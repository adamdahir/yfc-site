# yakimafoursquare.org

Website for Yakima Foursquare Church, Yakima WA.

Static site — no framework, no dependencies, no build tooling to install.

---

## Structure

```
index.html            all 10 pages; JS toggles between them
styles.css            cascade layers: reset, tokens, base, layout,
                      components, utilities, a11y
app.js                page switching, sermons, forms, animation
ui.js                 nav contrast, menu, dock, reveal failsafes —
                      kept separate so an error in app.js cannot take
                      navigation down with it
assets/               photography
netlify/functions/    sermons.mjs — reads YouTube's public feed
build.sh              assembles dist/ from an explicit file list
netlify.toml          build config and cache headers
```

**Documentation worth reading before changing anything:**

- `DESIGN-SYSTEM.md` — spacing, type, colour and contrast rules, plus the
  bugs that produced them
- `LIFE-PACIFIC-YAKIMA.md` — source facts for the college section
- `PHOTOS.md` — image slots and what each one needs
- `DEPLOY.md` — publishing

---

## Deploying

Hosted on **Netlify**, deployed from this repository. Push to `main` and it
builds automatically.

`build.sh` copies an explicit list of files into `dist/`. This matters: the
working folder also contains notes, a mobile test harness and a photo inbox.
Nothing ships unless it is named in that list.

---

## Pages

Home · Sermons · What We Believe · Next Steps · Watch Live · Resources ·
Ministries · Events · Give · Life Pacific University Yakima

---

## Forms

Four Netlify forms route submissions by what the visitor selects:

| Form | Receives |
|---|---|
| `connect-decision` | Decisions for Jesus, baptism |
| `connect-belong` | Life Groups, membership |
| `connect-serve` | Serving, commissioning |
| `connect-talk` | General enquiries |

Recipients are configured in Netlify, not in this repository, so staff changes
need no code change. `nsSubmit()` in `app.js` holds the routing map.

---

## Sermons

`netlify/functions/sermons.mjs` reads YouTube's public Atom feed server-side.

**No API key.** The feed is public and unmetered; the function exists only
because YouTube sends no CORS header, so the browser cannot read it directly.
Nothing to leak, restrict, rotate or exhaust.

The Sermons page is built to work with no data at all — if the feed fails it
shows a link to the YouTube archive rather than an error.

---

## Config

`YFC_CONFIG` in `app.js`:

| Key | Status |
|---|---|
| `YOUTUBE_CHANNEL_ID` | set |
| `YOUTUBE_API_KEY` | **optional and unused for sermons** — only for a custom live indicator |
| `PCO_APP_ID` / `PCO_SECRET` | **never put these in front-end code** — proxy through a serverless function |

---

## Verified facts

Do not change these casually. All were wrong somewhere on the old site and
were corrected against primary sources.

- **700 N 40th Ave, Yakima, WA 98908**
- **(509) 575-1490**
- Sundays **9:00 AM & 10:30 AM**

---

## Fonts

**Adobe Jenson Pro** via Adobe Fonts, plus **Inter** from Google Fonts.

The Typekit link is in `<head>`. It requires an active Creative Cloud
subscription. Without it, every serif headline silently falls back to Times —
which is exactly what happened for most of this build before anyone noticed.

---

## Accessibility

WCAG 2.2 AA. Contrast is measured programmatically across all pages rather
than eyeballed; see `DESIGN-SYSTEM.md` for the ramps and the reasoning.

Two standing rules:

1. **Nothing may depend on an animation to become visible.** Entrance effects
   are motion and blur only, never opacity.
2. **Verify paint with screenshots, not `getComputedStyle`.** Under
   `backdrop-filter` the computed values go stale and will lie to you.
