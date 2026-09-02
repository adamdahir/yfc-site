# Start here

Entry point for anyone — human or agent — picking this project up cold.
Read in this order. It takes about ten minutes and saves a day.

---

## 1. What this is

Website for Yakima Foursquare Church. Vanilla HTML, CSS and JS. **No framework,
no build tooling to install.** `build.sh` assembles `dist/` from an explicit
file list; Netlify runs it on push.

The no-framework choice is deliberate and load-bearing: it is why a church can
maintain this. Proposals that require React, Tailwind or a bundler are a
rewrite, not an addition. Say so plainly rather than starting one.

## 2. Read these, in order

| File | What it gives you |
|---|---|
| `NEXT-SESSION.md` | **Open bugs and what has already been ruled out.** Read first. |
| `DESIGN-SYSTEM.md` | Scales, ramps, type split, WCAG rules — and the bugs that produced each rule |
| `README.md` | Architecture, forms, sermon feed, verified facts |
| `LIFE-PACIFIC-YAKIMA.md` | College section. Our reasoning vs. LPU's source deck, kept separate |
| `PHOTOS.md` | Image slots and what each needs |
| `DEPLOY.md` | Publishing |

## 3. Run the tests before touching anything

```bash
npm install && npx playwright install --with-deps chromium
npm test
```

`tests/site.spec.js` is the most reliable memory in this repo. Every test
exists because that exact bug happened. If one fails, read its comment — it
explains what broke and why the check is there.

---

## How to work on this

**Look, don't only measure.** Repeated lesson. The mobile layout passed every
numeric check while rendering in the wrong order. `getComputedStyle` reports
stale values under `backdrop-filter` and will lie to you. Screenshot it.

**Isolate before you change.** When something renders wrong, find a working
instance of the same pattern and diff the two. Changing one property and
re-screenshotting is slow and does not converge — that is how the team
portrait bug ate an afternoon.

**Verify claims about the site by checking the site.** Several confident
statements in this project turned out to be false: that a CSS rule existed
when it did not, that a name was correct when the partner's own deck said
otherwise, that a fix had been logged when it had not.

**Say what you did not do.** Half-finished work described as finished costs
more than admitting the gap.

**Do not invent facts.** Addresses, phone numbers, costs, staff names, event
dates and impact figures must come from a source. Anything unknown gets marked
visibly, not filled in plausibly.

**Nothing may depend on an animation to be visible.** This has broken four
times. Entrance effects are motion and blur only, never opacity.

---

## Standing constraints

- **PCO credentials never reach front-end code.** Proxy through a function.
- **No YouTube API key needed.** Sermons read the public Atom feed via
  `netlify/functions/sermons.mjs`.
- Verified and hard-won: **700 N 40th Ave, Yakima, WA 98908** ·
  **(509) 575-1490** · Sundays **9:00 and 10:30 AM**. All three were wrong
  somewhere on the old site.
- **Jake Edler no longer works there.** Accurate as history for the March 2026
  LPU signing; must not appear in current copy or staff listings.
