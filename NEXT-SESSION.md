# Pick up here

Last session fixed four defects, all verified by rendering. The full suite is
green: **69 passed, 1 skipped, 0 failed** (desktop + mobile).

---

## Fixed and verified

### 1. Any page switch could black-screen the site permanently — FIXED

The worst of the four, and it was hiding behind item 2 below.

`_doShowPage` calls `heroEntrance`, which called `anime(...)` **unguarded**.
Every other anime block on the site is wrapped in
`typeof anime !== 'undefined'`; this one was missed. When the jsdelivr CDN was
slow, blocked or simply hadn't finished executing its `defer` scripts, `anime`
was undefined, the ReferenceError unwound out of `_doShowPage`, and the two
lines that retract the transition panel never ran.

The panel is opaque `#110F0E` at `z-index: 9999`, full viewport. So the result
was a **permanent black screen**, plus `_pageTransitioning` stuck `true`, which
killed every subsequent navigation. Confirmed by stack trace, reproduced on
every page, and reproduced again from a second unguarded call site in the
IntersectionObserver reveal (that one fired on nearly every section of every
page, so it threw continuously rather than once).

Three changes:

- `heroEntrance` returns early when `anime` is undefined.
- The observer's reveal block is guarded the same way; `io.unobserve` stays
  outside the guard so it can't re-throw on every scroll.
- `showPage` wraps `_doShowPage` in **try/finally**. This is the structural
  one: the panel now retracts whether the page switch succeeded or not. A page
  with no transition is recoverable; a black screen is not.

Skipping the animations is safe for a specific reason worth keeping in mind —
every one of those calls animates `opacity: [1,1]`, i.e. no opacity change at
all. That is the standing rule paying off.

### 2. The pathway wheel has been dead in production — FIXED

`show()` wrote to `.pw-hub-n`, `.pw-hub-t` and `.pw-hub-s`. **None of those
three exist in the markup.** An earlier wheel had a centre hub that retitled
itself per stage; the Venn redesign replaced it with a static `.pw-core` /
`.pw-core-t` ("one life") and dropped the hub from the HTML — but not from the
JS. So `show(0)` threw on every single page load: no stage highlighted, and the
entire right-hand panel (number, verb, title, lede, list, CTA, reference) stayed
at whatever the HTML hardcoded. Independent of the CDN.

Now writes the hub only if it is present.

### 3. Three sections were invisible until scrolled to — FIXED

`.pw-detail` (`ns-belong`, `ns-contribute`, `ns-multiply`) started at
`opacity: 0` and waited for an IntersectionObserver. **This is the fifth time
this project has hit the "content hidden behind an animation" bug.** A visitor
who landed and read for two seconds saw three empty bands; the ui.js safety net
only catches it at 2.5s.

Entrance is now motion only — `translateY`, no opacity — plus a
`prefers-reduced-motion` branch. The ui.js safety net stays as belt-and-braces,
but nothing relies on it now.

### 4. Events filter buttons failed WCAG AA — FIXED

`.events-filter-btn` used `--text-light` on `.events-bar`, which is `--u-200`
`#DDCDAC`. Measured **4.34:1**, under the 4.5 threshold — the only place on the
site where `--text-light` lands on a surface that dark. Changed to
`--text-mid`: **5.33:1**, and the next stop on the existing ramp, so no new
value enters the system.

---

## Could NOT reproduce: team portraits

**The twelve portraits render correctly.** Chromium, desktop and mobile
viewports, against the built `dist/`, with and without lazy-loading forced, with
and without the CDN reachable. Screenshot confirms all twelve.

The previous note's ruled-out list was accurate and the diff it recommended was
the right instinct, but the delta it predicted isn't there: computed styles are
identical across all twelve `<img>` elements, all twelve report
`complete: true` with non-zero `naturalWidth`, and the `sizes` attribute
resolves to a real candidate.

Best guess at what was actually being seen: **the stuck transition panel from
item 1.** It paints opaque over everything at `z-index: 9999` the moment a
navigation fails. The note describes `--u-200` tan blocks and the panel is near
black, so this isn't a clean match — but the panel bug was real, reproducible,
and would black out exactly that region.

**Do not spend more time on this without a fresh screenshot showing it.** If it
reappears, capture the screenshot first and attach it here.

---

## Still open

### Video header — not started, and worth a decision before it is

Video: https://youtu.be/0VvmR5TV490 — still unwatched. The previous analysis of
placement and constraints holds and is worth re-reading before building.

The honest case against, from the notes themselves: a 3MB hero video is the
single heaviest thing on the site and works directly against the performance and
dependency work already done. It also needs an MP4 + WebM export that does not
exist yet. Decide whether it earns the weight before building it.

### Security review — not started

The useful version checks whether the sermon function can be abused, whether
form handling is injection-safe, and what the third-party script origins
expose — not a linter run pasted into a file.

Note that the third-party origin question now has teeth: the site pulls five
libraries from jsdelivr plus fonts from Google and Typekit, and item 1 above is
what happened when they didn't arrive. Self-hosting anime.js is worth costing
out.

### Deploy is behind a 401

`https://remarkable-yeot-b87ce8.netlify.app/` returns **401 on every route**,
including `/`. The deploy itself is fine — this is Netlify's
**Site settings → Access & security → Visitor access** password protection, not
a build or routing failure. Note that a 401 on `/team` is consistent with
site-wide protection and is *not* evidence the `_redirects` SPA fallback broke.

`build.sh` also still writes a `robots.txt` that disallows everything. Both the
password and that block have to come off at launch — there is a note in
`build.sh` marking it.

### Unchanged from before

- Home sermons block looks sparse locally; the feed function only runs on
  Netlify. Confirm once the 401 is lifted.
- Skylee Aguilar, Brennan Platt and Juven Garcia have no local portrait, so
  they are missing from `/team`.
- Privacy policy and custom 404 still missing. The `_redirects` SPA fallback
  serves the homepage for any mistyped URL, which is worse than a 404.
- **Cheree's title is inconsistent**: "Discipleship Director" on `/team`,
  "Discipleship Pastor" on Next Steps. One of them is wrong — check which
  before publishing.

---

## Note on running the suite

`devices['iPhone 13']` defaults to **WebKit**. If WebKit isn't installed the
whole mobile project fails instantly (~2ms per test) with
`browserType.launch: Target page, context or browser has been closed` — that is
a missing browser, not 35 real failures. Run
`npx playwright install --with-deps` first. The green run above forced Chromium
for the mobile project, so **mobile has not been verified on real WebKit** this
session.
