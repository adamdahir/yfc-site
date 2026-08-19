# YFC Design System

The rules every change answers to. If a value isn't on these scales, it's a bug.

Researched against Swiss/International Typographic Style and WCAG 2.2 (W3C Recommendation, Oct 2023 — supersedes the 2.1 criteria most guides still cite).

---

## Spacing — 10 steps

```
4  8  12  16  24  32  48  64  96  128
```

Only these values for `padding`, `margin`, `gap`. 1px and 2px are permitted for borders/hairlines only.

**Was:** 46 distinct values, 37 of them off any scale.

---

## Grid — one shell, four measures

| Token | Width | Use |
|---|---|---|
| shell | 1180px | every full-width section container |
| wide | 760px | wide text blocks, two-up layouts |
| prose | 620px | running body copy |
| narrow | 480px | intros, pull quotes |
| caption | 340px | captions, meta blocks |

**Was:** 26 different container widths. Every section invented its own.

Müller-Brockmann's point: the grid settles the boring decisions in advance so judgment goes to the ones that matter. Breaking it then reads as intentional, because there's a baseline to measure against.

---

## Type — 8 steps, ratio ~1.2

```
12  14  16  19  24  32  42  56
```

Plus `clamp()` for display sizes, and 120px for the pullquote mark.

- Floor is **12px** — nothing smaller anywhere (was 8px).
- Two families: **adobe-jenson-pro** (display/serif), **Inter** (UI/body). Space Mono is metadata only and is a candidate for removal.
- Hierarchy comes from size and weight, not from color or ornament.

**Was:** 28 sizes including 8, 9, 9.5, 10, 10.5 — differences no one reads as intentional.

---

## Tracking — 4 values

```
-0.02em  (display, tightened)
0        (body)
0.1em    (controls, small caps)
0.18em   (the few remaining labels)
```

**Was:** 37 values.

---

## Colour — one ladder, one accent

Single umber ramp, 13 stops, hues locked 24°–42°. Value does the work, not hue.

```
u-950 #110F0E   u-900 #191714   u-850 #28211B   u-800 #3A2A1D
u-700 #573A23   u-600 #7B4C2D   u-500 #A26A39   u-400 #C49054
u-300 #CEAF82   u-200 #DDCDAC   u-150 #E7DFCA   u-100 #EFEAE1
u-50  #F5F3EF
```

Accent — **amber only**, and only to carry meaning. Never to fill a quota.

```
amber-700 #8F521E   amber-600 #A55E22   amber-500 #D4823A   amber-300 #E8B778
```

Sampled from reference photography. Filmic curve: desaturated shadows, saturated wood midtones, soft cream highlights.

**Site is light-dominant.** Dark is punctuation — hero, manifesto, footer only. Roughly 60/30/10: value extremes dominate, wood midtones support, amber accents.

---

## Text on dark — 4 steps

The fourth uncontrolled scale, found and closed. Translucent white was being used to build hierarchy on dark sections, with the alpha picked by eye each time: **134 declarations across 38 distinct alpha values**, and most of them failed AA. 33 of 38 failing contrast rules on the site were this one habit.

```
--on-dark        #FFFFFF   primary     10.32:1
--on-dark-2      u-200     secondary    6.59:1
--on-dark-3      u-300     meta/label   4.95:1
--on-dark-faint  u-500     DECORATIVE ONLY
```

Ratios are worst case — measured against `--u-700` (#573A23), the lightest surface these appear on. Anything darker scores higher.

Mapping used for the migration: `α ≥ .75 → on-dark` · `.40–.75 → on-dark-2` · `.20–.40 → on-dark-3` · `< .20 → on-dark-faint`.

**Two rules that are easy to get wrong:**

- **Amber panels are the exception.** On `--amber-600` only white clears AA (4.97:1). `on-dark-2` is 3.17 there, `on-dark-3` is 2.39. White text only on amber.
- **amber-700 is the on-light amber; amber-500 is the on-dark amber.** amber-700 on ink is 2.89:1. Two separate fixes in this file had been computed against the wrong background and were re-breaking things.

`--on-dark-faint` carries no meaning, ever. Rules, glyphs, separators — things that are `aria-hidden` and exempt from 1.4.3. The moment real text uses it, it's a bug.

---

## Accessibility — WCAG 2.2 AA

Nine criteria are new in 2.2. These are the ones that bite on this site:

| Criterion | Level | Implementation |
|---|---|---|
| 2.5.8 Target Size (Minimum) | AA | all controls ≥24×24px; filters/tabs ≥32px |
| 2.4.11 Focus Not Obscured | AA | `scroll-margin-top: 112px` clears the sticky nav + browse bar |
| 2.4.13 Focus Appearance | AAA | 2px amber outline, 3px offset, ≥3:1 both sides |
| 2.4.7 Focus Visible | AA | `:focus-visible` on every interactive element |
| 1.4.3 Contrast | AA | lowest pairing 4.97:1 (white on amber CTA); rest AAA |

Also enforced: `prefers-reduced-motion` globally, `rel="noopener"` on all 40 external links, every SVG labelled or `aria-hidden`, every form field named, one `<h1>` per page, skip link, `<main>` landmark.

**Nav contrast** is measured, not guessed — samples background luminance under the bar and picks text colour from it. No hardcoded section list to go stale.

Three things about that sampler, all learned the hard way:

1. **The header must leave hit-testing before you sample.** `nav` sets `pointer-events: none`, but `.nav-logo` and the buttons each set `pointer-events: all`, so they stay hit-testable and `elementFromPoint` returns *them*. The old code then did `if (nav.contains(el)) el = el.parentElement`, which climbs the DOM to `<body>` and reports the page background. Two of four probes were reading `<body>`, which flipped the median and put dark text on the dark heroes. Fixed with `.is-sampling`, added and removed inside one frame, which disables pointer events on the nav *and every descendant*.
2. **Median, not minimum.** Biasing to the darkest sample was tried and reverted — one probe clipping a dark element flipped the whole header to white on cream.
3. **Gradients: read the element's own `background-color` first.** Judging a gradient by its lightest stop reads the dark home and sermons heroes as light. Dark is the safe default here.

Resamples on scroll, resize, **and page change** — a page switch changes what's under the header but fires no scroll event, so the header used to keep the previous page's colour.

### Verify by screenshot, not by `getComputedStyle`

`getComputedStyle` reported `background: rgba(0,0,0,0)` and `padding: 24px 32px` on the scrolled nav while the element was demonstrably painting its cream bar at 16px — including when an injected `!important` rule was in the sheet. `backdrop-filter` puts the element on its own compositing layer and the computed values went stale. Several debugging rounds were spent trusting that reading. **A screenshot settled it in one call.** Measure text contrast programmatically; confirm anything about paint with pixels.

---

## Content must never depend on animation to be visible

This has now bitten four times. The most recent instance: **39 elements on the home page were at `opacity: 0` and stayed there**, including the entire sermon card. Cause was a half-applied fix — the anime.js calls had been changed to `opacity: [1,1]` so they stopped setting opacity, but the CSS still declared `opacity: 0` in *two* places. The elements animated their position perfectly, invisibly.

**Entrance effects are motion and blur only.** No opacity gates:

```
.yfc-fade       { transform: translateY(28px); }
.yfc-fade-left  { transform: translateX(-32px); }
.yfc-fade-right { transform: translateX(32px); }
.yfc-scale      { transform: scale(0.94); }
```

Same rule applied to the inline `opacity:0` written by `splitWords()` and the hero character split, and to the manifesto, which rests at `--on-dark-3` and merely brightens to white.

Two legitimate two-state reveals remain (`.stagger-child`, `.pw-detail`). Both are covered by the **reveal failsafe in `ui.js`** — 2.5s after load and after every page switch it forces visible anything inside `#main-content` that is fully transparent, occupies space, and contains text. It lives in `ui.js` so an exception in `app.js` cannot disable it.

The contrast audit skips elements below 0.15 opacity, so it will never catch this class of bug. **Check for invisible-but-present content separately.**

---

## Mobile

Built desktop-first and never rendered below 1450px until now. At 390px every page scrolled horizontally.

**Testing:** the embedded browser tab cannot be resized (`outerWidth` reports 0). `mobile-test.html` loads the site in an iframe, which establishes its own viewport so media queries fire against the iframe width. Same origin, so the harness can measure inside it. Dev tool — do not deploy. One iframe at a time; three at once freezes the renderer.

**Root cause of the overflow:** sections laid out with inline `style="display:grid;grid-template-columns:1fr 1fr"` in the markup. Inline styles beat every normal rule, so ordinary media queries could not collapse them — hence the attribute selectors and `!important` in the mobile safety layer. That is the correct tool for overriding inline styles, not specificity abuse. **The real fix is to move those grids into classes.**

Also fixed: `flex-wrap: nowrap` pill rows, `min-height` on `display:inline` CTAs (which does nothing — they need `inline-block`), and the horizontal entrance offsets, which put elements outside a 390px viewport at rest.

Current state: **10/10 pages clean at 390px** — no horizontal scroll, no sub-24px targets, no invisible content.

---

## The reduction method

From Swiss practice, and the reason to keep this file:

> Put everything on the page that might plausibly belong. Remove one element at a time and watch what breaks. If nothing breaks, it was decoration. If clarity drops, put it back.

Removed so far and **not** missed: 52 arrow glyphs, 69 uppercase transforms, 10 duplicate eyebrows, the self-selector card grid (competing navigation), send-pillar cards (superseded by Commissioning).

Backups if a cut goes too far: `index.pre-minimal.*.html`, `index.pre-system.*.html`.

---

## Discipleship pathway

**Begin → Belong → Contribute → Multiply** — circular, not linear.

| Stage | Church verb | Anchor | Concrete step |
|---|---|---|---|
| 01 Begin | receives | Acts 2:41 | Get baptized |
| 02 Belong | shepherds | Acts 2:42 | Life Group + Membership |
| 03 Contribute | equips | Eph 4:12 | Serve from gifting |
| 04 Multiply | sends | Matt 28:19–20 | **Commissioning** |

Rendered as four overlapping circles (venn), not a row — the stages coexist. Multiply returns to Begin.

Research consensus from the pathway documents is implemented as **function, not language**: next steps are always one verb, each stage shows three outcomes rather than the full list, and the same four words appear in nav, footer, and headings with no synonyms.

*Open:* the Begin-stage class has no name yet.

---

## Facts — verified, do not edit casually

- **700 N 40th Ave, Yakima, WA 98908** (ZIP was wrong as 98902 in 8 places)
- **(509) 575-1490** (was 966-0880, plus a 000-0000 placeholder)
- **46.6089771, -120.5629527** (previous coords were ~1.5km off, from the old site)
- Sundays **9:00 AM & 10:30 AM**

Sources: yakimafoursquare.org Service Times page, Greater Yakima Chamber directory.

---

## Security

- PCO credentials (`PCO_APP_ID`, `PCO_SECRET`) must **never** reach front-end code — proxy through a serverless function.
- YouTube API key must be domain-restricted to yakimafoursquare.org in Google Cloud Console.
- API-derived text uses `textContent`; structure uses `createElement`. **No `innerHTML` with API data.** (`renderYouTube` was rebuilt for this — verified against an `<img src=x onerror=...>` payload.)
