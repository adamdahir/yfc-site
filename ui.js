/* ═══ UI BEHAVIOUR — loaded separately so a failure in app.js
   cannot take the navigation, menu or dock down with it. ═══ */
/* ─── PAGE SWITCHER: dock behaviour (isolated so upstream errors can't kill it) ─── */
(function(){
  function init(){
    var dock = document.querySelector('.switcher');
    if (!dock || dock.dataset.dockReady) return;
    dock.dataset.dockReady = '1';
    var zone = document.createElement('div'); zone.className = 'sw-zone';
    var handle = document.createElement('div'); handle.className = 'sw-handle';
    handle.setAttribute('role','button');
    handle.setAttribute('aria-label','Show page switcher');
    handle.setAttribute('tabindex','0');
    handle.innerHTML = '<span class="sw-chev" aria-hidden="true"></span>PAGES';
    document.body.appendChild(zone);
    document.body.appendChild(handle);
    var t = null, pinned = false;
    function up(){ clearTimeout(t); dock.classList.add('is-up'); handle.classList.add('is-hidden'); }
    function down(){ if (pinned) return; clearTimeout(t); t = setTimeout(function(){ dock.classList.remove('is-up'); handle.classList.remove('is-hidden'); }, 420); }
    zone.addEventListener('mouseenter', up);
    zone.addEventListener('mouseleave', down);
    dock.addEventListener('mouseenter', up);
    dock.addEventListener('mouseleave', down);
    handle.addEventListener('mouseenter', up);
    handle.addEventListener('click', function(){ pinned = !pinned; if (pinned) { up(); } else { down(); } });
    handle.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pinned = !pinned; if (pinned) { up(); } else { down(); } } });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && dock.classList.contains('is-up')) { pinned = false; dock.classList.remove('is-up'); handle.classList.remove('is-hidden'); }
    });
    /* teach the affordance once: peek up, then retract */
    var seen = false;
    try { seen = sessionStorage.getItem('yfcDockSeen') === '1'; } catch (err) { seen = false; }
    function markSeen(){ handle.classList.remove('pulse'); try { sessionStorage.setItem('yfcDockSeen','1'); } catch (err) {} }
    if (!seen) {
      setTimeout(function(){
        if (dock.classList.contains('is-up')) return;
        dock.classList.add('is-up'); handle.classList.add('is-hidden');
        setTimeout(function(){
          if (pinned) return;
          dock.classList.remove('is-up'); handle.classList.remove('is-hidden');
          handle.classList.add('pulse');
        }, 1900);
      }, 1200);
    }
    ['mouseenter','click','keydown'].forEach(function(ev){ handle.addEventListener(ev, markSeen); });
    zone.addEventListener('mouseenter', markSeen);

    /* touch: no hover, so reveal on a tap near the bottom edge */
    window.addEventListener('touchstart', function(e){
      var y = e.touches && e.touches[0] ? e.touches[0].clientY : 0;
      if (y > window.innerHeight - 80) { pinned = true; up(); }
    }, { passive: true });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();


/* ══════════════════════════════════════════ */


/* ─── NAV CONTRAST — samples the real background luminance under the bar ───
   No hardcoded section list: reads computed background-color of whatever
   element is actually beneath the nav and picks text colour from its
   relative luminance. Works for any section, now or later. ─── */
(function(){
  function init(){
    var nav = document.getElementById('nav');
    if (!nav || nav.dataset.contrastReady) return;
    nav.dataset.contrastReady = '1';
    var ticking = false, lastDark = null;

    function parse(col){
      if (!col) return null;
      var m = col.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/);
      if (!m) return null;
      var alpha = m[4] === undefined ? 1 : parseFloat(m[4]);
      if (alpha < 0.35) return null;                 /* too sheer to count */
      return [ +m[1], +m[2], +m[3] ];
    }
    function lum(rgb){
      var a = rgb.map(function(v){ v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
      return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
    }
    /* Luminance of whatever is actually PAINTED under a viewport point.
       The old version did `if (nav.contains(el)) el = el.parentElement`, which
       walks the DOM tree, not the paint stack — from a nav child that lands on
       <body>, so any probe hitting the logo or a nav link reported the page
       background and the header picked the wrong text colour. The fix is to
       take the nav out of hit-testing for the duration of the sample. */
    function bgAt(x, y){
      var el = document.elementFromPoint(x, y);
      var guard = 0;
      while (el && guard++ < 14) {
        var cs = getComputedStyle(el);
        var bi = cs.backgroundImage;
        if (bi && bi !== 'none' && !/grain|noise/.test(bi)) {
          if (/url\(/.test(bi)) return 0.18;         /* photo — assume dark, use a scrim */
          /* Gradient. Prefer the element's OWN background-color: on this site
             every gradient hero paints over a solid dark base, and that base is
             the honest answer. Only fall back to reading the gradient's stops
             when there is no backing colour.
             Do NOT switch this to "lightest stop" — that was tried and it read
             the dark home and sermons heroes as light, putting dark text on
             near-black. Dark is the safe default for a gradient here. */
          var own = parse(cs.backgroundColor);
          if (own) return lum(own);
          var stops = bi.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/g) || [];
          var darkest = null;
          for (var i = 0; i < stops.length; i++) {
            var c = stops[i][0] === '#' ? hexRgb(stops[i]) : parse(stops[i]);
            if (!c) continue;
            var L = lum(c);
            if (darkest === null || L < darkest) darkest = L;
          }
          return darkest === null ? 0.18 : darkest;
        }
        var rgb = parse(cs.backgroundColor);
        if (rgb) return lum(rgb);
        el = el.parentElement;
      }
      return null;
    }
    function hexRgb(h){
      h = h.replace('#','');
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      if (h.length < 6) return null;
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    }
    function apply(){
      ticking = false;
      var scrolled = window.scrollY > 80;
      nav.classList.toggle('scrolled', scrolled);

      /* Scrolled paints the cream glass bar (nav#nav.scrolled), so text is
         always dark here. This is a CSS contract — do NOT try to "verify" it by
         reading getComputedStyle(nav).backgroundColor. That was tried: the bar
         uses backdrop-filter, which puts the header on its own compositing
         layer, and the computed value comes back rgba(0,0,0,0) even while the
         bar is visibly painting. The check therefore always failed, fell
         through to sampling, and set on-dark over a cream bar — dark-on-dark
         text, the exact bug it was meant to prevent. */
      if (scrolled) {
        if (lastDark !== false) { nav.classList.add('on-light'); nav.classList.remove('on-dark'); lastDark = false; }
        return;
      }

      var w = window.innerWidth, y = 40, vals = [];
      /* Setting pointer-events on the nav alone is NOT enough: .nav-logo and
         the buttons each declare `pointer-events: all`, so they stay in the
         hit-test and elementFromPoint keeps returning them. The probes that
         landed on the logo and the MENU/GIVE buttons then climbed to <body>
         and reported the page background — two light votes out of four, which
         flipped the median and put dark text on the dark heroes.
         .is-sampling kills hit-testing on the nav AND its descendants.
         Class is added and removed inside one frame, so nothing repaints. */
      nav.classList.add('is-sampling');
      try {
        [w*0.06, w*0.5, w*0.78, w*0.92].forEach(function(x){
          var l = bgAt(Math.round(x), y);
          if (l !== null) vals.push(l);
        });
      } finally {
        nav.classList.remove('is-sampling');
      }
      if (!vals.length) return;
      vals.sort(function(a,b){ return a-b; });
      /* Median, not min. Biasing to the darkest sample was tried and reverted:
         it flipped the header to white text any time a single probe clipped a
         dark element, which reads far worse on this light-dominant site than
         the reverse. Points are weighted toward the logo and the controls,
         which is where legibility actually matters. */
      var dark = vals[Math.floor(vals.length/2)] < 0.45;
      if (dark === lastDark) return;                 /* no thrash */
      lastDark = dark;
      nav.classList.toggle('on-dark', dark);
      nav.classList.toggle('on-light', !dark);
    }
    function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(apply); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function(){ lastDark = null; onScroll(); }, { passive: true });
    window._yfcNavContrast = function(){ lastDark = null; apply(); };

    /* Page switches change what sits under the header but fire no scroll event,
       so the header used to keep the previous page's colour until you scrolled. */
    (function(){
      var orig = window.showPage;
      if (typeof orig !== 'function') return;
      window.showPage = function(){
        var r = orig.apply(this, arguments);
        lastDark = null;
        requestAnimationFrame(apply);
        setTimeout(function(){ lastDark = null; apply(); }, 420);
        return r;
      };
    })();

    setTimeout(apply, 60);
    apply();
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();


/* ─── ANIMATION FAILSAFE ───────────────────────────────────────
   If an entrance animation is interrupted or targets a removed
   element, content can be left stranded at opacity:0. Nothing
   should ever be invisible because a decorative animation failed.
   ───────────────────────────────────────────────────────────── */
(function(){
  function reveal(){
    document.querySelectorAll('.page.active h1, .page.active h2, .page.active p, .page.active a, .page.active section')
      .forEach(function(el){
        var s = el.style;
        if (s.opacity !== '' && parseFloat(s.opacity) < 0.05) {
          s.opacity = '';
          s.transform = '';
        }
      });
  }
  window._yfcRevealFailsafe = reveal;
  window.addEventListener('load', function(){ setTimeout(reveal, 1600); });
  document.addEventListener('click', function(e){
    if (e.target.closest('[onclick*="showPage"], [onclick*="navToPage"]')) setTimeout(reveal, 1400);
  }, true);
})();


/* ─── MENU: guaranteed ways out ───────────────────────────────
   The overlay previously trapped the user: close button covered
   by the overlay, no Escape handler, no click-outside dismissal.
   ───────────────────────────────────────────────────────────── */
(function(){
  function isOpen(){
    var o = document.querySelector('.menu-overlay');
    return o && o.classList.contains('open');
  }
  function shut(){ if (typeof closeMenu === 'function') closeMenu(); }

  /* 1. Escape key */
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && isOpen()) { e.preventDefault(); shut(); }
  });

  /* 2. Click on empty overlay space (not on a link) */
  document.addEventListener('click', function(e){
    if (!isOpen()) return;
    var o = document.querySelector('.menu-overlay');
    if (!o.contains(e.target)) return;
    if (e.target.closest('a, button')) return;
    shut();
  });

  /* 3. Any page change closes it — showPage() alone used to leave it open */
  var _orig = window.showPage;
  if (typeof _orig === 'function') {
    window.showPage = function(id){ if (isOpen()) shut(); return _orig.apply(this, arguments); };
  }
})();



/* ─── MENU CLOSE: deterministic ────────────────────────────────
   The original closeMenu() removed the .open class inside an
   anime.js complete callback and guarded on a module flag, so a
   second call (or a dropped animation) left the menu stuck open
   over the page. State changes now happen immediately; the CSS
   transition does the fade.
   ───────────────────────────────────────────────────────────── */
(function(){
  function hardClose(){
    var o = document.getElementById('menu-overlay');
    var n = document.getElementById('nav');
    if (o) o.classList.remove('open');
    if (n) n.classList.remove('menu-open');
    document.body.style.overflow = '';
    /* clear any inline opacity anime left on the links */
    if (o) o.querySelectorAll('.menu-primary-link, .menu-panel-link').forEach(function(el){
      el.style.opacity = ''; el.style.transform = '';
    });
  }
  var orig = window.closeMenu;
  window.closeMenu = function(){
    try { if (typeof orig === 'function') orig.apply(this, arguments); } catch (e) {}
    hardClose();
    setTimeout(hardClose, 260);   /* also after any animation would have run */
  };
  window._yfcHardCloseMenu = hardClose;
})();

/* ─── MENU: intent-aware panel switching ──────────────────────
   Three problems with naive hover on a two-column menu:
     1. Passing the cursor over an item on the way somewhere else
        fires a switch you did not ask for.
     2. Moving diagonally from an item toward its panel crosses
        the items below it, yanking the panel away mid-reach.
     3. A deliberate click can be overridden by a stray hover.
   Fixes, in order: hover-intent delay, a directional "safe
   corridor" toward the open panel, and a click lock.
   ───────────────────────────────────────────────────────────── */
(function(){
  function init(){
    var overlay = document.getElementById('menu-overlay');
    if (!overlay || overlay.dataset.panelsReady) return;
    overlay.dataset.panelsReady = '1';

    var links   = overlay.querySelectorAll('.menu-primary-link');
    var panels  = overlay.querySelectorAll('.menu-panel');
    var right   = overlay.querySelector('.menu-right');
    var current = 'default';
    var locked  = false;          /* set by an explicit click */
    var timer   = null;
    var pts     = [];             /* recent cursor positions */
    var HOVER_DELAY = 180;        /* ms of intent before switching */

    function apply(name){
      if (name === current) return;
      current = name;
      panels.forEach(function(p){ p.hidden = (p.getAttribute('data-panel') !== name); });
      links.forEach(function(l){
        var on = l.getAttribute('data-sub') === name;
        l.classList.toggle('is-active', on);
        l.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    }
    function cancel(){ if (timer) { clearTimeout(timer); timer = null; } }

    /* Is the cursor travelling toward the open panel? If so, ignore
       whatever item it happens to be passing over. */
    function headingToPanel(){
      if (current === 'default' || pts.length < 3) return false;
      var a = pts[0], b = pts[pts.length - 1];
      var dx = b.x - a.x, dy = Math.abs(b.y - a.y);
      if (dx < 6) return false;                 /* not moving rightward */
      var r = right.getBoundingClientRect();
      if (b.x > r.left) return true;            /* already inside the panel */
      return dx > dy * 0.7;                     /* shallow rightward angle */
    }

    document.addEventListener('mousemove', function(e){
      pts.push({ x:e.clientX, y:e.clientY, t:Date.now() });
      if (pts.length > 6) pts.shift();
    }, { passive:true });

    links.forEach(function(l){
      var sub = l.getAttribute('data-sub');

      l.addEventListener('mouseenter', function(){
        if (locked) return;                     /* a click wins */
        if (headingToPanel()) return;           /* passing through, not choosing */
        cancel();
        timer = setTimeout(function(){ apply(sub); }, HOVER_DELAY);
      });
      l.addEventListener('mouseleave', cancel);

      /* explicit choice: immediate, and it sticks */
      l.addEventListener('click', function(e){
        e.preventDefault(); cancel();
        /* Home is a destination, not a category, so it is the one exception to
           the "choose a sub-item before you leave the menu" rule. That rule
           exists so category items don't dump you at the top of a long page
           with no particular target — Home has no such problem, and requiring
           Home -> Welcome reads as a broken button. Hovering still previews
           the panel; clicking just goes. */
        if (l.dataset.direct) {
          if (typeof navToPage === 'function') navToPage(l.dataset.direct);
          return;
        }
        locked = true; apply(sub);
      });
      l.addEventListener('focus', function(){ cancel(); apply(sub); });
      l.addEventListener('keydown', function(e){
        if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); locked = true; apply(sub);
          var first = overlay.querySelector('.menu-panel[data-panel="'+sub+'"] .menu-panel-link');
          if (first) first.focus();
        }
      });
    });

    /* entering the panel keeps it; leaving the whole menu resets */
    if (right) right.addEventListener('mouseenter', cancel);
    overlay.addEventListener('mouseleave', function(){
      cancel(); locked = false; apply('default');
    });

    var nav = document.getElementById('nav');
    if (nav) new MutationObserver(function(){
      if (!nav.classList.contains('menu-open')) { cancel(); locked = false; apply('default'); }
    }).observe(nav, { attributes:true, attributeFilter:['class'] });

    apply('default');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();



/* ─── PATHWAY STEPS: one step dominant, colour field follows ───
   Only the step nearest the viewport centre is at full strength;
   the right-hand field takes that step's colour. Steps sit at
   opacity .22 rather than 0, so a JS failure still leaves the
   whole section readable.
   ───────────────────────────────────────────────────────────── */
(function(){
  function init(){
    var steps = Array.prototype.slice.call(document.querySelectorAll('.pstep'));
    var field = document.querySelector('.pathsteps-right');
    var ticks = document.querySelectorAll('.pathsteps-tick');
    if (!steps.length || !field) return;

    var current = null, ticking = false;

    function pick(){
      ticking = false;
      var mid = window.innerHeight / 2, best = null, bestDist = Infinity;
      steps.forEach(function(s){
        var r = s.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var d = Math.abs((r.top + r.height / 2) - mid);
        if (d < bestDist) { bestDist = d; best = s; }
      });
      if (!best || best === current) return;
      current = best;
      var n = best.getAttribute('data-step');
      steps.forEach(function(s){ s.classList.toggle('is-active', s === best); });
      field.setAttribute('data-active', n);
      ticks.forEach(function(t){
        t.classList.toggle('is-on', parseInt(t.getAttribute('data-tick'),10) <= parseInt(n,10));
      });
    }
    function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(pick); } }

    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll, { passive:true });
    document.addEventListener('click', function(){ setTimeout(pick, 500); }, true);

    /* failsafe: if nothing became active within 3s, light them all */
    setTimeout(function(){
      if (!document.querySelector('.pstep.is-active')) {
        steps.forEach(function(s){ s.classList.add('is-active'); });
      }
    }, 3000);

    pick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ══════════════════════════════════════════════════════════════════════
   REVEAL FAILSAFE
   Three separate incidents in this project have ended with real content
   stranded at opacity:0 because a scroll-reveal never fired — most recently
   39 elements on the home page, invisible because the CSS still declared
   opacity:0 after the animation stopped setting opacity.

   Two two-state patterns remain that legitimately start hidden and are
   revealed by a class:
     .stagger-parent .stagger-child  ->  .stagger-parent.stagger-fired
     .pw-detail                      ->  .pw-detail.is-visible / .lit

   This guarantees they end up visible no matter what happens upstream.
   It lives in ui.js so an exception in app.js cannot take it down.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  var DELAY = 2500;

  function reveal(root) {
    var scope = root || document;

    scope.querySelectorAll('.stagger-parent').forEach(function (p) {
      if (!p.classList.contains('stagger-fired')) p.classList.add('stagger-fired');
    });

    scope.querySelectorAll('.pw-detail').forEach(function (el) {
      var cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 0.9) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });

    /* Belt and braces: anything still fully transparent that holds real text
       and occupies space gets forced visible. Deliberately excludes the menu
       overlay, dock and other things that are hidden on purpose. */
    scope.querySelectorAll('#main-content *').forEach(function (el) {
      var cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) > 0.05) return;
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (!el.textContent || !el.textContent.trim()) return;
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      el.style.opacity = '1';
    });
  }

  function schedule() { setTimeout(function () { reveal(); }, DELAY); }

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule);

  /* Page switches re-run the reveal, since a newly shown page starts hidden. */
  var orig = window.showPage;
  if (typeof orig === 'function') {
    window.showPage = function () {
      var r = orig.apply(this, arguments);
      setTimeout(function () { reveal(); }, DELAY);
      return r;
    };
  }

  window._yfcRevealAll = reveal;
})();

/* ══════════════════════════════════════════════════════════════════════
   LAZY IMAGES IN A DISPLAY:NONE SPA
   Native loading="lazy" never fires for images inside a page that was
   display:none when the document parsed and is later revealed by a class
   toggle rather than by scrolling — the intersection that would trigger the
   load never happens. Cheree's portrait sat in the viewport with an empty
   currentSrc until forced.

   On every page switch, promote lazy images in the newly shown page to eager
   once they are within a viewport of the fold. Keeps the bandwidth saving for
   images far down a long page, without the silent-blank failure.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  function wake(root) {
    var scope = root || document;
    var vh = window.innerHeight || 800;
    scope.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) return;
      var r = img.getBoundingClientRect();
      if (r.top < vh * 2 && r.bottom > -vh) {
        img.loading = 'eager';
        if (img.src) img.src = img.src;   /* re-kick the fetch */
      }
    });
  }

  function wakeActive() {
    var page = document.querySelector('.page.active');
    wake(page || document);
  }

  var orig = window.showPage;
  if (typeof orig === 'function') {
    window.showPage = function () {
      var r = orig.apply(this, arguments);
      requestAnimationFrame(wakeActive);
      setTimeout(wakeActive, 500);
      return r;
    };
  }
  window.addEventListener('scroll', function () { wakeActive(); }, { passive: true });
  if (document.readyState === 'complete') setTimeout(wakeActive, 300);
  else window.addEventListener('load', function () { setTimeout(wakeActive, 300); });

  window._yfcWakeImages = wake;
})();

/* Dismissing the announcement used to set display:none inline, which lasted
   exactly one page view — it returned on every reload and on every SPA page
   switch. Remember it for the session instead. Matches how the page-switcher
   dock remembers it has been seen. */
function yfcDismissAnnouncement() {
  var el = document.getElementById('ann-banner');
  if (el) el.classList.remove('ann-visible');
  try { sessionStorage.setItem('yfcAnnDismissed', '1'); } catch (e) {}
}
window.yfcDismissAnnouncement = yfcDismissAnnouncement;

(function () {
  var dismissed = false;
  try { dismissed = sessionStorage.getItem('yfcAnnDismissed') === '1'; } catch (e) {}
  if (!dismissed) return;
  function hide() {
    var el = document.getElementById('ann-banner');
    if (el) el.classList.remove('ann-visible');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hide);
  else hide();
  setTimeout(hide, 200);   /* after app.js may have shown it */
})();
