# Deploying

The repository is **built and committed**. One commit on `main`, 23 files,
clean working tree. You are not starting from scratch.

---

## What's left, and why it's left

Three things I can't do, in order of how annoying that is:

1. **Delete one file.** `.git/index.lock` — zero bytes, left behind by a git
   process that got interrupted. My sandbox can create and overwrite files in
   your folder but cannot delete anything, so this one file survives me. Git
   refuses to write while it exists.
2. **Create a GitHub account and push.** That needs credentials, and handling
   your passwords or tokens is a line I won't cross even if asked.
3. **Link Netlify to the repo.** Requires being signed into your account.

Everything else is done.

---

## Your part — about five minutes

### 1. Delete one file

In Finder, open `yfc-site`, press <kbd>Cmd</kbd> <kbd>Shift</kbd> <kbd>.</kbd>
to reveal hidden files, open `.git`, delete **`index.lock`** (it's 0 KB), then
press <kbd>Cmd</kbd> <kbd>Shift</kbd> <kbd>.</kbd> again to re-hide.

Delete only that file. Leave the rest of `.git` alone — it holds the history.

### 2. Install GitHub Desktop and publish

**desktop.github.com** → sign in or create a free account.

**File → Add Local Repository** → choose `yfc-site`. It will find the existing
repository and the commit already in it.

Click **Publish repository**. **Tick "Keep this code private."**

### 3. Point Netlify at it

Netlify → your site → **Site configuration → Build & deploy → Link to a
repository** → GitHub → `yfc-site`.

It reads `netlify.toml` and fills in the settings itself:

- Build command `bash build.sh`
- Publish directory `dist`

Deploy.

---

## From then on

I edit. You open GitHub Desktop, click **Commit to main**, then **Push
origin**. Live in about a minute.

Two clicks. No zip, no dragging, no folder picking.

---

## What the setup gives you

**Nothing unintended can ship.** `build.sh` copies an explicit list of files
into `dist/`. Your folder also contains 17MB of `index.pre-*.html` backups,
working notes, the mobile test harness and a photo inbox. None of it is on the
copy list, so none of it can reach the internet — that was one wrong drag away
under the old zip method.

**Real version history.** Every change recorded and reversible, which is why
those backup snapshots are now gitignored. Git does that job properly, and
several of them contain superseded copy.

**Deploys that fail loudly.** The build aborts if `index.html`, `styles.css`,
`app.js` or `ui.js` come out missing or empty, instead of publishing a broken
site quietly.

**Sensible caching.** Images cache for a year, HTML always revalidates, so an
edit is live the moment it deploys.

---

## Before the real public launch

- [ ] Delete the `robots.txt` block at the end of `build.sh` — it currently
      tells search engines to ignore the entire site
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` from `index.html`
- [ ] Confirm `canonical`, `og:url`, `og:image` point at the real domain
- [ ] **Netlify → Forms → notifications**: add an email address, or connection
      cards are captured and nobody is told
- [ ] YouTube API key in `YFC_CONFIG`, domain-restricted in Google Cloud Console
- [ ] Adobe Fonts kit ID — headlines currently fall back to Times
- [ ] Site fee for Life Pacific University Yakima
- [ ] Photography: congregation, worship and baptism shots don't exist yet
