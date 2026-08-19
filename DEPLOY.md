# Deploying

**One-time setup, then publishing is one click.** No more zips.

---

## Why this isn't fully automatic

I can edit the files, but I can't publish them — pushing to GitHub needs
credentials I'm not able to hold. So the split is:

- **I do:** all the editing
- **You do:** one click to publish

---

## One-time setup — about ten minutes

### 1. Delete the half-made repo

There's a `.git` folder in here that I started and couldn't finish (my sandbox
can't delete files, and git needs to). **Delete the `.git` folder** and let
GitHub Desktop make a clean one.

It's hidden. In Finder press <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>.</kbd>
to show hidden files, drag `.git` to the trash, then press it again to re-hide.

### 2. Install GitHub Desktop

**desktop.github.com** — free, and you never touch a terminal. Sign in, or
create a free GitHub account when it asks.

### 3. Add this folder

**File → Add Local Repository** → choose `yfc-site` → it'll offer to create a
repository here. Say yes.

Then **Publish repository**. **Tick "Keep this code private."**

### 4. Point Netlify at it

In Netlify, open your site → **Site configuration → Build & deploy →
Link to a repository** → GitHub → pick `yfc-site`.

It reads `netlify.toml` and fills in the rest:

- Build command: `bash build.sh`
- Publish directory: `dist`

Deploy. Done.

---

## After that, every change

1. I tell you it's ready
2. Open GitHub Desktop — it lists what changed
3. Type a short note, click **Commit to main**
4. Click **Push origin**

Live in about a minute. You can watch it under **Deploys** in Netlify.

---

## What you also get

**Version history.** Every change is recorded and reversible. This is why the
seventeen megabytes of `index.pre-*.html` backup files are now gitignored —
git does that job properly, and those snapshots contain superseded copy that
should never reach a public server.

**A build step that can't leak.** `build.sh` copies an explicit list of files
into `dist/`. Working notes, backups, the mobile test harness and the photo
inbox physically cannot ship, because they're never copied. If a file isn't on
that list, it isn't on the internet.

**A guard against broken deploys.** The build fails loudly if `index.html`,
`styles.css`, `app.js` or `ui.js` come out missing or empty, rather than
publishing a broken site.

**Sensible caching.** Images cache for a year, HTML always revalidates, so an
edit is live the moment it deploys.

---

## Before the real public launch

- [ ] Delete the `robots.txt` block at the end of `build.sh` — it currently
      tells search engines to ignore the whole site
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` from `index.html`
- [ ] Confirm `canonical`, `og:url` and `og:image` point at the real domain
- [ ] **Forms → notifications** in Netlify: add an email address, or connection
      cards are captured and nobody is told
- [ ] YouTube API key in `YFC_CONFIG`, domain-restricted in Google Cloud Console
- [ ] Adobe Fonts kit ID — headlines are currently falling back to Times
- [ ] Site fee for Life Pacific University Yakima
