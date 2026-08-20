// @ts-check
import { test, expect } from '@playwright/test';

const PAGES = ['home','sermons','believe','nextsteps','livestream',
               'resources','ministries','events','give','college'];

async function show(page, id) {
  await page.evaluate((p) => window.showPage(p), id);
  await page.waitForTimeout(450);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => typeof window.showPage === 'function', null,
    { timeout: 15_000 });
  await page.waitForTimeout(1200);   // let entrance animation settle
});

/* ───────────────────────────────────────────────────────────────
   1. NOTHING INVISIBLE
   39 elements on the home page once sat at opacity:0 permanently —
   including the whole sermon card — because CSS hid them and the
   animation that was meant to reveal them had stopped setting opacity.
   The contrast audit could not catch it: it skips anything under 0.15
   opacity, which is exactly how it stayed hidden.
   ─────────────────────────────────────────────────────────────── */
for (const id of PAGES) {
  test(`${id}: no invisible content`, async ({ page }) => {
    await show(page, id);
    const ghosts = await page.evaluate((pid) => {
      const root = document.getElementById('page-' + pid);
      return [...root.querySelectorAll('*')].filter((el) => {
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) > 0.05) return false;
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        if (!el.textContent.trim()) return false;
        const r = el.getBoundingClientRect();
        return r.width > 2 && r.height > 2;
      }).map((el) => el.className || el.tagName);
    }, id);
    expect(ghosts, `invisible text on ${id}`).toEqual([]);
  });
}

/* ───────────────────────────────────────────────────────────────
   2. NO HORIZONTAL SCROLL
   Every page scrolled sideways at 390px because sections used inline
   grid-template-columns that media queries could not override.
   ─────────────────────────────────────────────────────────────── */
for (const id of PAGES) {
  test(`${id}: no horizontal scroll`, async ({ page }) => {
    await show(page, id);
    const { scrollW, clientW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(scrollW, `${id} overflows horizontally`).toBeLessThanOrEqual(clientW + 2);
  });
}

/* ───────────────────────────────────────────────────────────────
   3. SECTION ORDER ON HOME
   A stale mobile-only `order` rule put the hero 4,000px down the page
   and silently defeated a reorder that looked correct on desktop.
   ─────────────────────────────────────────────────────────────── */
test('home: hero renders first', async ({ page }) => {
  await show(page, 'home');
  const first = await page.evaluate(() => {
    const kids = [...document.getElementById('page-home').children];
    return kids
      .map((el) => ({ c: String(el.className || ''), t: el.getBoundingClientRect().top + scrollY }))
      .sort((a, b) => a.t - b.t)[0].c;
  });
  expect(first).toContain('home-hero');
});

/* ───────────────────────────────────────────────────────────────
   4. WCAG 2.2 AA CONTRAST — measured on composited backgrounds.
   Static CSS analysis cannot resolve custom properties; this can.
   ─────────────────────────────────────────────────────────────── */
for (const id of PAGES) {
  test(`${id}: contrast AA`, async ({ page }) => {
    await show(page, id);
    const fails = await page.evaluate((pid) => {
      const parse = (s) => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null;
        const p = m[1].split(',').map(parseFloat);
        return { r:p[0], g:p[1], b:p[2], a:p.length>3?p[3]:1 }; };
      const lum = (c) => { const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
        return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); };
      const over = (f,b)=>({r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a),a:1});
      const bgOf = (el) => { let n=el, st=[], g=0;
        while (n && g++ < 40) { const cs=getComputedStyle(n);
          if (cs.backgroundImage && /url\(/.test(cs.backgroundImage)) return null;
          const c=parse(cs.backgroundColor);
          if (c && c.a>0) { st.push(c); if (c.a>=0.999) break; }
          n=n.parentElement; }
        let bg={r:255,g:255,b:255,a:1};
        for (let i=st.length-1;i>=0;i--) bg=over(st[i],bg);
        return bg; };

      const out=[], seen=new Set();
      const root=document.getElementById('page-'+pid);
      const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n=w.nextNode())) {
        const t=n.nodeValue.trim(); if (!t) continue;
        const el=n.parentElement; if (!el) continue;
        const cs=getComputedStyle(el);
        if (cs.display==='none'||cs.visibility==='hidden') continue;
        if (parseFloat(cs.opacity)<0.15) continue;
        const r=el.getBoundingClientRect(); if (r.width<2||r.height<2) continue;
        const fg=parse(cs.color); if (!fg) continue;
        const bg=bgOf(el); if (!bg) continue;          // over a photo — scrim handles it
        const eff=fg.a<1?over(fg,bg):fg;
        const l1=lum(eff), l2=lum(bg);
        const ratio=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
        const size=parseFloat(cs.fontSize), wt=parseInt(cs.fontWeight,10)||400;
        const need=(size>=24||(size>=18.66&&wt>=700))?3:4.5;
        if (ratio>=need) continue;
        if (el.getAttribute('aria-hidden')==='true') continue;   // decorative
        const key=el.className+ratio.toFixed(2);
        if (seen.has(key)) continue; seen.add(key);
        out.push(`${ratio.toFixed(2)}:1 (need ${need}) ${el.className||el.tagName}`);
      }
      return out;
    }, id);
    expect(fails, `contrast failures on ${id}`).toEqual([]);
  });
}

/* ───────────────────────────────────────────────────────────────
   5. NAVIGATION INTEGRITY
   Every menu destination must resolve to a real page.
   ─────────────────────────────────────────────────────────────── */
test('menu: every destination resolves', async ({ page }) => {
  const result = await page.evaluate(async () => {
    window.openMenu();
    await new Promise((r) => setTimeout(r, 600));
    const dests = [...new Set([...document.querySelectorAll('.menu-panel-link')]
      .map((b) => (b.getAttribute('onclick')||'').match(/navToPage\('([a-z]+)'/)?.[1])
      .filter(Boolean))];
    window.closeMenu();
    const ids = [...document.querySelectorAll('.page')].map((p) => p.id.replace('page-',''));
    return { dests, broken: dests.filter((d) => !ids.includes(d)) };
  });
  expect(result.dests.length).toBeGreaterThan(5);
  expect(result.broken, 'menu links pointing at pages that do not exist').toEqual([]);
});

/* ───────────────────────────────────────────────────────────────
   6. NO JAVASCRIPT ERRORS
   ─────────────────────────────────────────────────────────────── */
test('no console errors while visiting every page', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const id of PAGES) await show(page, id);
  expect(errors).toEqual([]);
});

/* ───────────────────────────────────────────────────────────────
   7. THE CONNECTION FORM MUST BE ABLE TO SEND
   It once hid itself and showed "success" without sending anything —
   worse than having no form, because the person is told it worked.
   ─────────────────────────────────────────────────────────────── */
test('connection form is wired to a real destination', async ({ page }) => {
  await show(page, 'nextsteps');
  const form = page.locator('#connection-form');
  await expect(form).toHaveAttribute('data-netlify', 'true');
  await expect(form.locator('input[name="form-name"]')).toHaveCount(1);
  const routed = await page.evaluate(() =>
    /connect-decision|connect-belong|connect-serve|connect-talk/.test(window.nsSubmit.toString()));
  expect(routed, 'nsSubmit no longer routes by selection').toBe(true);
});

/* ───────────────────────────────────────────────────────────────
   8. TAP TARGETS — WCAG 2.2 SC 2.5.8, mobile only
   ─────────────────────────────────────────────────────────────── */
test('tap targets meet 24px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only');
  await show(page, 'home');
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('#page-home a, #page-home button')]
      .filter((el) => { const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24); })
      .map((el) => el.textContent.trim().slice(0, 24)));
  expect(small).toEqual([]);
});
