# YFC Site — Launch Checklist

Complete every item before flipping DNS. Nothing goes live until this list is done.

---

## 1. API Keys & Config

Open `index.html` and find the `YFC_CONFIG` block (~line 4550). Replace each placeholder:

### YouTube API Key
- [ ] Go to [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Create a new project (or use an existing one) → Enable **YouTube Data API v3**
- [ ] Credentials → Create API Key → copy it
- [ ] **Restrict the key:** Application restrictions → HTTP referrers → add `yakimafoursquare.org/*` and `www.yakimafoursquare.org/*`
- [ ] API restrictions → Restrict to **YouTube Data API v3**
- [ ] Paste key into `YFC_CONFIG.YOUTUBE_API_KEY`
- [ ] Confirm channel ID is still `UCzr3Q1kImqSqozM-E2g0lJQ` (check YouTube Studio → Settings → Channel → Advanced)

### Pushpay
- [ ] Log in to Pushpay → Settings → find your giving page slug
- [ ] Paste into `YFC_CONFIG.PUSHPAY_SLUG`
- [ ] Test the Give button at `yakimafoursquare.org/#give` before launch

### PCO (Planning Center Online)
- [ ] PCO credentials must **never** go in `index.html` directly
- [ ] Set up a serverless proxy (Cloudflare Worker or Netlify Function) that holds `PCO_APP_ID` and `PCO_SECRET` server-side
- [ ] The proxy returns event data as JSON — `index.html` calls the proxy URL, not PCO directly
- [ ] Until the proxy is ready, the Events page shows static placeholder content (acceptable for launch)

---

## 2. Content Placeholders

Search `index.html` for these strings and replace with real content:

- [ ] `YOUR_YOUTUBE_API_KEY` → real key (covered above)
- [ ] `YOUR_PUSHPAY_SLUG` → real slug (covered above)
- [ ] `info@yakimafoursquare.org` → confirm this is the right inbox for general contact
- [ ] `cheree@yakimafoursquare.org` → confirm Cheree's email is correct
- [ ] Service times: **9:00 AM and 10:30 AM** — confirm these are current
- [ ] Address: **5 S 18th Ave, Yakima, WA 98902** — confirm
- [ ] Phone number if one should be added to the footer
- [ ] Pastor name/bio on the Believe page — confirm copy is accurate
- [ ] Any event dates in the Events section — update or remove stale placeholders

---

## 3. Fonts

The site uses **Adobe Jenson Pro** via Adobe Fonts (Typekit). Before launch:

- [ ] Log in to [fonts.adobe.com](https://fonts.adobe.com)
- [ ] Go to your Web Projects → find or create a project that includes **Adobe Jenson Pro**
- [ ] Add `yakimafoursquare.org` and `www.yakimafoursquare.org` to the allowed domains
- [ ] Copy the `<link>` embed code and replace the existing Adobe Fonts link in `index.html` `<head>` (around line 10)
- [ ] Confirm the kit ID in the link matches your account's kit

---

## 4. Cloudflare Pages — Deploy

Follow the steps in `README.md`. Once deployed:

- [ ] Visit the Cloudflare Pages preview URL (e.g. `yfc-site.pages.dev`)
- [ ] Walk through every page: Home, Sermons, Events, Ministries, Next Steps, Give, Believe, Live
- [ ] Click every CTA button and confirm mailto links work
- [ ] Click a pathway stage card and confirm smooth scroll to detail section
- [ ] Submit the "I'm ready for Stage 4" form — confirm success state shows
- [ ] Open hamburger menu — confirm all items work and menu closes on selection
- [ ] Resize to mobile (375px) — confirm nav, cards, and grid layouts are readable

---

## 5. Livestream — Pre-Sunday Test

Do this the Thursday or Friday before your first live Sunday:

- [ ] Start a test YouTube broadcast on the YFC channel (Private is fine)
- [ ] Open the live page on the deployed site
- [ ] Confirm the LIVE badge appears in the nav and the player loads
- [ ] Confirm the offline state shows when the broadcast ends
- [ ] Confirm live chat popout works (requires a real video ID, not just channel embed)

---

## 6. DNS — Flip to Go Live

Only after all above items are checked:

- [ ] Log in to your domain registrar (GoDaddy / Namecheap / wherever `yakimafoursquare.org` is registered)
- [ ] Add a **CNAME record**: `www` → `yfc-site.pages.dev` (your Cloudflare Pages URL)
- [ ] Add an **A record** (apex): point `@` to Cloudflare's IPs — Cloudflare Pages will give you these
- [ ] OR: transfer nameservers to Cloudflare entirely (recommended — easiest long-term)
- [ ] Wait for DNS propagation (5 min – 48 hrs depending on TTL)
- [ ] Visit `yakimafoursquare.org` — confirm site loads with SSL (green padlock)
- [ ] Confirm `www.yakimafoursquare.org` redirects to apex (handled by `_redirects`)

---

## 7. Post-Launch (First Week)

- [ ] Share the URL with staff and get eyes on it from different devices (iPhone, Android, iPad)
- [ ] Check Google Search Console — add `yakimafoursquare.org` as a property and submit sitemap (or just the root URL)
- [ ] Confirm the YouTube live detection works on the first real Sunday
- [ ] Set a calendar reminder to update Events content monthly

---

## Quick Reference — Config Block Location

```
index.html → search for "YFC_CONFIG" → around line 4550
```

```javascript
var YFC_CONFIG = {
  YOUTUBE_API_KEY:    'REPLACE_THIS',        // ← Google Cloud Console
  YOUTUBE_CHANNEL_ID: 'UCzr3Q1kImqSqozM-E2g0lJQ',  // ← already set
  YOUTUBE_MAX_RESULTS: 9,
  PCO_APP_ID: 'PROXY_ONLY',                 // ← never put real value here
  PCO_SECRET:  'PROXY_ONLY',                // ← never put real value here
  PUSHPAY_SLUG: 'REPLACE_THIS'              // ← Pushpay settings
};
```
