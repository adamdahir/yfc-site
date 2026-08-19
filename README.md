# yakimafoursquare.org

Single-file website for Yakima Foursquare Church. Hosted on Cloudflare Pages.

---

## Architecture

Everything is in `index.html` — no build step, no framework, no dependencies to install. The site is a single-page app that uses JavaScript to toggle between pages. Fonts come from Adobe Fonts. Images are base64-embedded so the file is fully self-contained.

```
yfc-site/
├── index.html       ← the entire website
├── _redirects       ← Cloudflare Pages redirect rules (www → apex, SPA fallback)
├── .gitignore
├── LAUNCH-CHECKLIST.md
└── README.md
```

---

## How to Update the Site

1. Open `index.html` in any text editor (VS Code recommended)
2. Make your changes
3. Save the file
4. Commit and push to GitHub:
   ```bash
   git add index.html
   git commit -m "Update: [what you changed]"
   git push
   ```
5. Cloudflare Pages detects the push and deploys automatically — usually live within 60 seconds

That's it. No build process, no npm, no server.

---

## Initial Setup — Cloudflare Pages

Do this once. After that, every push to GitHub deploys automatically.

### Step 1 — Push to GitHub

1. Create a new repository at [github.com/new](https://github.com/new)
   - Name: `yfc-site` (or anything you like)
   - Visibility: Private is fine
   - Don't initialize with README — you already have one
2. In Terminal, from this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/yfc-site.git
   git push -u origin main
   ```

### Step 2 — Connect to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → log in (or create a free account)
2. Click **Pages** in the left sidebar
3. Click **Create a project** → **Connect to Git**
4. Authorize Cloudflare to access your GitHub account → select `yfc-site`
5. Configure the build:
   - **Production branch:** `main`
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/` (just a forward slash)
6. Click **Save and Deploy**

Cloudflare will deploy the site and give you a URL like `yfc-site.pages.dev`. This is your preview URL — the real site before DNS is pointed.

### Step 3 — Add Your Domain

1. In Cloudflare Pages → your project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter `yakimafoursquare.org` → follow the prompts

**If your domain registrar is Cloudflare:** DNS records are added automatically.

**If your domain is at GoDaddy, Namecheap, etc.:** Cloudflare will give you specific DNS records to add. Log in to your registrar and add them. Propagation takes anywhere from 5 minutes to 48 hours.

**Strongly recommended:** Transfer your nameservers to Cloudflare. It's free, faster to propagate, and you manage everything in one place. Cloudflare walks you through it during setup.

---

## Config Values

Before launch, open `index.html` and find `YFC_CONFIG` (search for it, around line 4550).

Replace the placeholder values:

| Key | Where to get it |
|-----|----------------|
| `YOUTUBE_API_KEY` | Google Cloud Console → APIs & Services → Credentials |
| `YOUTUBE_CHANNEL_ID` | Already set: `UCzr3Q1kImqSqozM-E2g0lJQ` — confirm in YouTube Studio |
| `PUSHPAY_SLUG` | Pushpay dashboard → your giving page URL slug |
| `PCO_APP_ID` / `PCO_SECRET` | **Never put these here** — use a serverless proxy |

See `LAUNCH-CHECKLIST.md` for full instructions on each.

---

## Fonts

The site uses **Adobe Jenson Pro** from Adobe Fonts. You need an active Adobe Creative Cloud subscription and a Web Project set up at [fonts.adobe.com](https://fonts.adobe.com) with `yakimafoursquare.org` as an allowed domain.

The embed link is in `<head>` near the top of `index.html`. Replace it with your kit's link if it differs.

---

## Updating Content

| What | Where in index.html |
|------|---------------------|
| Service times | Search `9:00 AM` |
| Church address | Search `5 S 18th Ave` |
| Staff emails | Search `@yakimafoursquare.org` |
| Sermon videos | Search `<!-- SERMONS -->` |
| Events | Search `<!-- EVENTS -->` |
| Give section | Search `<!-- GIVE -->` or `ns-give` |

---

## Livestream

The Live page auto-detects when YFC is broadcasting on YouTube. When the YouTube API key is configured:

- **When live:** The LIVE badge pulses red in the nav, the player loads the active stream, live chat appears in the sidebar
- **When offline:** A clean offline card shows with service times and the latest sermon

Staff don't need to touch the website. Just start the YouTube broadcast in YouTube Studio and the site detects it automatically (within ~60 seconds).

**Test this** the Thursday before your first live Sunday. See `LAUNCH-CHECKLIST.md` → Section 5.

---

## Need Help?

Contact: adam.j.dahir@gmail.com
