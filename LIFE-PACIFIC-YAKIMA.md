# Life Pacific Yakima — decisions and source material

Status: **built and live at `/college`**, rebuilt from LPU's own deck. Sections marked THE DECK are source-of-truth; anything above them is our own reasoning.

---

## Verified facts

Sourced from Life Pacific University directly — do not edit casually.

- Micro campus agreement with Yakima Foursquare Church signed **March 2, 2026**
- Signed with **Pastor Chantal Edler**, who is an **LPU alumna**, and her leadership team
- LPU President is **Dr. Angie Richey**
- Also present at signing: George Bostanic, Sara Huson, Dan Fernandez, and Jake Edler
  (LPU's article spells it "Jack".)
  **Jake Edler is no longer on staff.** He was present at the March 2026 signing, so this
  is accurate as history, but do not carry his name into any current or forward-looking
  copy, staff listing, or contact route. Chantal Edler remains Lead Pastor and is the
  correct name for anything about the partnership going forward.
- Yakima joins **17 other active micro campuses**; LPU's public map lists 23 partners
- LPU's public-facing page: `lifepacific.edu/micro-campus/yakima-foursquare-church/`
- **An "LPU at Yakima Foursquare" logo already exists** — LPU produced a "Yakima Blue" wordmark. Get the source file from them before commissioning anything.
- LPU now brands the program **"Church Micro-Sites"**, not "microcampus"

**Division of responsibility.** LPU owns accreditation, admissions, financial aid, coursework, and the student portal (Moodle / Canvas / LPU Portal). The church owns discipleship, mentorship, hands-on ministry, and the room. Students complete coursework online while embedded locally, and can earn academic credit for ministry they are already doing.

Sources:
- [LPU signing announcement](https://lifepacific.edu/news/life-pacific-university-signs-new-micro-campus-agreement-with-yakima-foursquare-church-in-washington/)
- [LPU Church Micro-Sites](https://lifepacific.edu/church-partner/)

---

## Decision 1 — Section, not a separate site

Build at `/college` inside `yfc-site`, with its own nav, footer, and visual register. **Not** a second domain.

Reasoning:

1. **A separate domain competes with LPU for our own search results.** They already rank a page for "Life Pacific Yakima." A new thin domain splits authority against them and loses.
2. **A new domain starts at zero.** yakimafoursquare.org has years of accumulated authority; a section inherits it on day one.
3. **The church is the pitch.** The whole model is "accredited degree without leaving your church." A site that hides the church argues against its own value proposition. Prospective students — and especially their parents — want to see the room and the pastors.
4. **Maintenance.** One codebase, one design system, one deploy. A second site doubles the mobile pass, the accessibility work, and the content decay.

Buy the eventual name as a **redirect domain** pointing at `/college`, for print and word of mouth. Memorability without splitting SEO.

**Must still feel like a college, not a church page:** own hero and type treatment, same umber ramp, different energy. A *darker* register was tried first and read seminary rather than campus. The live version keeps the light canvas and promotes amber from accent (~10% on the church side) to structural surface (~30%), with near-black used once as punctuation. A navy secondary was costed and rejected — it would have broken the match with the church.

---

## Decision 2 — Ministry-only scope

Adam, 2026-08-18: *"we are strictly focused on ministry and degrees that point people to ministry in one way or another."*

**This changes the competitive set.** We are *not* competing with Yakima Valley College or CWU. Anyone choosing this has already decided they're called. The copy answers "how do I get trained without leaving Yakima," not "what job does this get me."

An earlier framing in this project assumed the YVC/CWU comparison and drove the copy toward cost and transferability. That framing is dead — do not revive it.

### Degrees — SUPERSEDED by the deck

I previously filtered the degree list myself on the ministry-only reasoning and dropped AA General Studies. **That was my inference, not LPU's position** — the deck lists all six, plus six graduate degrees on Flex. See THE DECK below for the authoritative list.

The framing notes still hold and are used on the page: Psychology reads as care and counselling ministry, Organizational Management as church operations.

### Naming — SETTLED BY LPU: Life Pacific University Yakima

LPU's own deck ("LPU Yakima Campus Interest") titles it **Life Pacific University Yakima / Yakima Campus**. That is the name. Implemented everywhere.

**"Yakima Life College" was mine and is superseded.** I coined it before the deck existed, and while the reasoning held, inventing a name for something the partner had already named was the wrong instinct — the source document should have come first.

The earlier RCW 28B.85.040 concern is now moot: using LPU's own institutional name is by definition an accurate representation. "Yakima Life University" remains a bad idea for the same reasons, but the question no longer arises.

---

## THE DECK — everything below is from LPU's source document

### Two tracks (the biggest thing the first build missed)

| | Traditional | Flex |
|---|---|---|
| Who | 18–25, formative season | Adult learners with work, family, or existing ministry |
| Commitment | Structured weekly schedule, full internship rotations | Flexible, no required rotations |
| Degrees | 6 undergraduate | Same 6 **plus 6 graduate/doctoral** |

This is the first real decision a visitor makes, so it now sits directly under the hero.

### Degrees — both tracks, undergraduate

AA Biblical Studies · AA General Studies · BA Ministry & Leadership · BA Organizational Management · BA Psychology · BA Worship Arts & Media

**AA General Studies IS offered.** I had dropped it on the "ministry-only" reasoning. That was my inference, not LPU's position.

### Degrees — Flex only, graduate & doctoral

MA Strategic Leadership · MBA · M.Div · MA Theological Studies · MA Counseling · Doctor of Ministry

Missed entirely in the first build. It also reframes the audience: this is not a purely undergraduate offering.

### Progression

- **Year 1 — Exploration & Formation:** spiritual formation, ministry exposure, character development, learning how the church functions
- **Year 2 — Apprenticeship & Ownership:** specialised training, leadership responsibility, mentorship, skill refinement
- **Years 3 & 4 — Leadership & Multiplication:** leading others, mentoring, strategic ministry leadership, discipline

Maps almost exactly onto the church's Begin → Belong → Contribute → Multiply. Stated in both vocabularies on the page.

### Weekly schedule

- Monday–Thursday, 9:00 AM–12:00 PM (Traditional): spiritual discipline, ministry track, mentorship, schoolwork
- Sundays, 8:00 AM–12:00 PM — Sunday Serve, **also required for Flex**

### Programme goals

Spiritual formation & Christlike character · Biblical & theological foundations · Ministry competence & practical skills · Calling discernment & vocational clarity · Leadership development & ministry readiness

### Apply

https://lifepacific.edu/micro-campus/

---

### Naming conventions in the peer set

Two conventions:

- **Plain church name** — Gettysburg Foursquare, Grace Covenant, GrowPoint, Hope Boulder, Northwest Church
- **Named institution** — City Light College, Daybreak Leadership College, Kings Way Leadership College, Pacific Coast Discipleship School

Kept for reference only — the naming question is closed, since LPU had already named this one. The pattern is still worth knowing: of 23 micro campuses, none uses "University."

---

## Structural connection to the existing site

The pathway is **Begin → Belong → Contribute → Multiply**. The college is what Multiply looks like when someone goes all in. That is a real structural link to content that already exists, not a stretched metaphor — use it rather than inventing a separate origin story.

---

## Open

- [ ] Name
- [ ] Get the "Yakima Blue" logo source from LPU
- [ ] Confirm which of the six degrees YFC is actually approved to offer
- [ ] Cost figures — LPU says "very affordable tuition plus a site fee that varies per site." We need our actual site fee.
- [ ] Whether housing is offered here (some sites do)
- [ ] Named contact for enquiries
- [ ] Photography of actual students in actual rooms — the whole pitch is local and embedded, so stock imagery would undercut it

Launches alongside the church site.
