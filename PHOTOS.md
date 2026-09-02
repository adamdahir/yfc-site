# Photo slots — what to look for

Drop chosen images in **`photos-inbox/`** with any filename. I'll crop, compress,
generate the responsive sizes and wire them in. Originals are fine, bigger is
better, I'll downscale. Don't pre-crop; I need the full frame to crop correctly
per slot.

**Current state:** the site has 13 photographs — 12 team portraits, Cheree on
Next Steps, and the home hero as a background. Every other image slot is still a
colour gradient. 12 photographs are outstanding.

---

## Priority 1 — the largest visual gaps

### Journey strips · 3 images · **16:5 wide** (deliver ~2400×750)
`.home-strip` ×3 — the three doorways on the home page:

1. Sermons & Teaching
2. New Here?
3. Kids & Family

One strong horizontal each. Currently flat colour; these were always meant to be
photo strips and they are the biggest holes on the site.

### What We Believe · 4 images · **~1:1**, cropped to fill
`.believe-photo` ×4 — alternating left/right panels, each around 500px tall.
Four moments carrying the four beliefs: congregation singing, hands raised or
laid on someone, a baptism, communion. Real moments over posed.
**Avoid empty building shots.** These sit beside theology and need people.

### Missing team portraits · 3 images · **3:4 portrait**
Skylee Aguilar, Brennan Platt and Juven Garcia have no portrait, so they are
absent from `/team` while twelve colleagues are shown.

Match the existing twelve exactly — outdoor, same greenery, same light, same
distance. Export 400×533 and 800×1066, WebP and JPEG. Two of them currently use
a stock photo on the old Squarespace site; don't reuse it.

---

## Priority 2

### Resources · 3 images · **16:9**
`.resource-thumb` ×3. Hold until the Resources page has real content — the three
cards currently pair real-sounding titles with unrelated descriptions.

### Sermons and LPU Yakima heroes · 2 images · **wide, dark-tolerant**
`.srm-hero`, `.lp-hero` — flat colour now. Optional, but a real room behind
either would help. Must survive a dark scrim with white text over it, so keep
the upper left quiet.

---

## Video

There is no video on the site apart from the YouTube live embed on Watch Live.

If the hero video goes ahead: **MP4 and WebM, self-hosted**, under 2MB, 8–12
seconds, silent, no cuts. A poster image is mandatory and the headline must be
readable before the video loads and if it never loads. Poster only below 768px.
`prefers-reduced-motion` shows the poster and doesn't play.

Weigh it honestly first. A 3MB hero video would be the heaviest thing on the
site and works against the performance work already done.

---

## What makes a shot work here

- **Real over staged.** The copy is plain and honest; stock-feeling photography
  fights it.
- **Faces.** The site talks constantly about people and, outside the team page,
  shows none.
- **Warm light.** The palette is a single warm umber ramp. Cool blue-grey images
  will look foreign against it.
- **Room to crop.** Slots are fixed aspect ratios; loose framing survives.
- **Permission.** Anyone recognisable, especially children, needs consent on file
  before this goes public.

---

## Handled automatically, ignore

Sermon thumbnails pull from the public YouTube Atom feed via
`netlify/functions/sermons.mjs`. No API key needed.
