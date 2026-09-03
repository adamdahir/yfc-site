
/* ─── CORE NAV FUNCTIONS — defined in head so onclick attrs always work ─── */
var _pageTransitioning = false;
function showPage(id) {
  if (_pageTransitioning) return;
  _pageTransitioning = true;
  var panel = document.getElementById('yfc-transition-panel');
  /* Duration comes from the CONTROL PANEL block at the top of styles.css.
     Set --ctl-page-fade-ms to 0 there to switch the transition off entirely. */
  var _fade = parseFloat(getComputedStyle(document.documentElement)
                .getPropertyValue('--ctl-page-fade-ms'));
  if (!isFinite(_fade)) _fade = 260;
  if (panel && _fade <= 0) panel = null;
  if (panel) {
    panel.classList.add('entering');
    setTimeout(function() {
      /* try/finally is load-bearing, not defensive habit. The panel is an
         opaque full-viewport element at z-index 9999. If anything inside
         _doShowPage throws, the two lines that retract it never run, and the
         site is a permanent black screen with _pageTransitioning stuck true —
         which also kills every future navigation. That is exactly what
         happened when the jsdelivr CDN was unreachable and heroEntrance hit an
         undefined `anime`. The panel must retract whether the page switch
         succeeded or not: a page with no transition is recoverable, a black
         screen is not. */
      try {
        _doShowPage(id);
      } catch (e) {
        if (window.console) console.error('showPage failed, retracting panel anyway:', e);
      } finally {
        panel.classList.add('leaving');
        panel.classList.remove('entering');
        setTimeout(function() {
          panel.classList.remove('leaving');
          _pageTransitioning = false;
        }, 380);
      }
    }, _fade);
  } else {
    try {
      _doShowPage(id);
    } catch (e) {
      if (window.console) console.error('showPage failed:', e);
    } finally {
      _pageTransitioning = false;
    }
  }
}
function _doShowPage(id) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.switcher button').forEach(function(b) { b.classList.remove('active'); });
  var page = document.getElementById('page-' + id);
  var sw   = document.getElementById('sw-' + id);
  if (page) page.classList.add('active');
  if (sw)   sw.classList.add('active');
  if (window._lenisInstance) window._lenisInstance.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0); if (window._yfcNavContrast) setTimeout(window._yfcNavContrast, 30);
  /* ── SEO: update title + meta description per page ── */
  var _seo = {
    home:       { title: 'Yakima Foursquare Church | Sundays 9 & 10:30 AM | Yakima, WA',                    desc: 'A Christian community in Yakima, WA. Sunday services at 9 & 10:30 AM. Kids ministry, youth, support groups, and more. Find your place here.' },
    sermons:    { title: 'Sermons | Yakima Foursquare Church | Yakima, WA',                                  desc: 'Watch recent sermons and teachings from Yakima Foursquare Church. New messages every week from our Sunday services.' },
    events:     { title: 'Events & Gatherings | Yakima Foursquare Church | Yakima, WA',                      desc: 'Upcoming events and gatherings at Yakima Foursquare Church in Yakima, WA. Find something for every age and season of life.' },
    ministries: { title: 'Ministries & Programs | Yakima Foursquare Church | Yakima, WA',                    desc: 'Kids ministry, youth group, Celebrate Recovery, GriefShare, DivorceCare, Life Groups, and more at Yakima Foursquare Church in Yakima, WA.' },
    nextsteps:  { title: 'Next Steps | Start Your Journey | Yakima Foursquare Church',                       desc: 'Ready to take a next step in your faith? Connect with Yakima Foursquare Church — whether you\'re brand new or looking to go deeper.' },
    give:       { title: 'Give | Yakima Foursquare Church | Yakima, WA',                                     desc: 'Support the mission of Yakima Foursquare Church through generous giving. Every gift helps us serve Yakima and the world.' },
    believe:    { title: 'What We Believe | Yakima Foursquare Church | Yakima, WA',                          desc: 'Learn what Yakima Foursquare Church believes about God, Jesus, the Holy Spirit, and the Bible — and what that means for everyday life.' },
    livestream: { title: 'Watch Live | Yakima Foursquare Church | Yakima, WA',                          desc: 'Watch Yakima Foursquare Church live every Sunday at 9:00 AM and 10:30 AM PT. Join us from anywhere.' },
    team:       { title: 'Our Team | Yakima Foursquare Church | Yakima, WA',                       desc: 'Meet the pastors and staff of Yakima Foursquare Church \u2014 the people you will actually see on a Sunday in Yakima, WA.' },
    resources:  { title: 'Resources | Yakima Foursquare Church | Yakima, WA',                           desc: 'Studies, reading, and resources to go deeper in your faith, from Yakima Foursquare Church in Yakima, WA.' },
    /* Name comes straight from LPU's own deck: "Life Pacific University
       Yakima". An invented name ("Yakima Life College") was used before the
       deck arrived; it is superseded. Using LPU's own name also settles the
       RCW 28B.85.040 accuracy question outright. */
    college:    { title: 'Life Pacific University Yakima | Micro Campus at Yakima Foursquare Church',    desc: 'Earn an accredited Life Pacific University degree in Yakima. Traditional and Flex tracks, undergraduate through doctoral, with real ministry at Yakima Foursquare Church.' }
  };
  if (_seo[id]) {
    document.title = _seo[id].title;
    var _dm = document.querySelector('meta[name="description"]');
    if (_dm) _dm.setAttribute('content', _seo[id].desc);
    var _ogT = document.querySelector('meta[property="og:title"]');
    if (_ogT) _ogT.setAttribute('content', _seo[id].title);
    var _ogD = document.querySelector('meta[property="og:description"]');
    if (_ogD) _ogD.setAttribute('content', _seo[id].desc);
  }
  /* Seed the header colour so it doesn't flash the wrong way on switch; the
     luminance sampler in ui.js corrects it a frame later either way. Pages
     with dark heroes go in the first list. */
  var nav = document.getElementById('nav');
  if (nav) {
    var _darkTop = (id === 'home' || id === 'sermons' || id === 'college');
    nav.classList.remove('on-dark','on-light');
    nav.classList.add(_darkTop ? 'on-dark' : 'on-light');
  }
  if (window._yfcHeroEntrance) window._yfcHeroEntrance(id);
  if (id === 'sermons' && window._yfcLivestreamInit) window._yfcLivestreamInit();
  if (window._yfcTagPage) setTimeout(function() {
    window._yfcTagPage(document.getElementById('page-' + id));
  }, 350);
}
var _menuOpen = false;
function openMenu() {
  if (_menuOpen) return;
  _menuOpen = true;
  var o = document.getElementById('menu-overlay');
  var n = document.getElementById('nav');
  if (!o) return;
  o.classList.add('open');
  if (n) n.classList.add('menu-open');
  document.body.style.overflow = 'hidden';
  /* Stagger animate links in — runs after overlay fades in */
  var links = o.querySelectorAll('.menu-primary-link');
  var secondary = o.querySelectorAll('.menu-secondary a, .menu-info > div');
  if (typeof anime !== 'undefined') {
    /* Reset first */
    anime.set(links, { opacity: 0, translateX: -28 });
    anime.set(secondary, { opacity: 0, translateY: 10 });
    /* Stagger in */
    anime({ targets: links, opacity: [1,1], translateX: [0,0],
      duration: 480, delay: anime.stagger(55, {start: 120}), easing: 'easeOutCubic' });
    anime({ targets: secondary, opacity: [1,1], translateY: [10,0],
      duration: 360, delay: anime.stagger(40, {start: 340}), easing: 'easeOutQuart' });
  } else {
    links.forEach(function(l){ l.style.opacity=1; l.style.transform='none'; });
    secondary.forEach(function(l){ l.style.opacity=1; });
  }
}
function closeMenu() {
  if (!_menuOpen) return;
  _menuOpen = false;
  var o = document.getElementById('menu-overlay');
  var n = document.getElementById('nav');
  if (!o) return;
  var links = o.querySelectorAll('.menu-primary-link');
  if (typeof anime !== 'undefined') {
    anime({ targets: links, opacity: [1,0], translateX: [0,-16],
      duration: 200, delay: anime.stagger(25), easing: 'easeInCubic',
      complete: function() {
        o.classList.remove('open');
        if (n) n.classList.remove('menu-open');
        document.body.style.overflow = '';
      }
    });
  } else {
    o.classList.remove('open');
    if (n) n.classList.remove('menu-open');
    document.body.style.overflow = '';
  }
}
function navToPage(id, anchor) { closeMenu(); setTimeout(function() { showPage(id); if (anchor) { setTimeout(function() { var t = document.getElementById(anchor); if (t) t.scrollIntoView({ behavior: 'smooth' }); }, 420); } }, 320); }
    

/* ══════════════════════════════════════════ */


  (function(){
    var c = document.getElementById('coil-canvas');
    if (!c) return;
    var ctx = c.getContext('2d');
    var W = 240, H = 320;
    var cx = W / 2;
    var TURNS = 4.5;
    var SEGS = 120;
    var rx = 60, ry = 12; // ellipse radii
    var TOP_Y = 48, BOT_Y = H - 48;
    var COIL_H = BOT_Y - TOP_Y;
    var CREAM = [212, 204, 178];
    var frame = 0;

    function segColor(z, fadeT) {
      // z in [-1,1]: 1=front, -1=back
      var bright = z > 0
        ? 0.78 + 0.22 * z   // front: 78–100%
        : 0.18 + 0.10 * (1 + z); // back: 18–28%
      bright *= fadeT;
      var a = bright;
      return 'rgba(' + CREAM[0] + ',' + CREAM[1] + ',' + CREAM[2] + ',' + a.toFixed(3) + ')';
    }

    function drawHelix(offset) {
      // collect all segments with z so we can sort back-to-front
      var segs = [];
      for (var i = 0; i < SEGS; i++) {
        var t0 = i / SEGS;
        var t1 = (i + 1) / SEGS;
        var angle0 = offset + t0 * TURNS * Math.PI * 2;
        var angle1 = offset + t1 * TURNS * Math.PI * 2;
        var x0 = cx + rx * Math.cos(angle0);
        var y0 = TOP_Y + COIL_H * t0;
        var x1 = cx + rx * Math.cos(angle1);
        var y1 = TOP_Y + COIL_H * t1;
        var z = Math.sin(angle0); // depth cue
        // fade at ends (10% of length)
        var fade0 = Math.min(t0 / 0.10, 1) * Math.min((1 - t0) / 0.10, 1);
        segs.push({ x0:x0, y0:y0, x1:x1, y1:y1, z:z, fade:fade0 });
      }
      // sort back (negative z) first so front draws on top
      segs.sort(function(a, b) { return a.z - b.z; });
      segs.forEach(function(s) {
        ctx.beginPath();
        ctx.moveTo(s.x0, s.y0);
        ctx.lineTo(s.x1, s.y1);
        ctx.strokeStyle = segColor(s.z, s.fade);
        ctx.lineWidth = s.z > 0 ? 2.0 : 1.2;
        ctx.stroke();
      });
    }

    function drawLabels() {
      ctx.font = '700 10px Inter, sans-serif';
      ctx.letterSpacing = '0.14em';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(212,204,178,0.72)';
      ctx.fillText('LIFE IN CHRIST', cx, 22);
      ctx.fillText('DEATH TO SELF', cx, H - 12);
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      // offset animates forward for helix 1, backward for helix 2
      var t = frame * 0.018;
      drawHelix(t);
      drawHelix(t + Math.PI); // counter-rotate by half turn
      drawLabels();
      frame++;
      requestAnimationFrame(tick);
    }

    tick();
  })();
  

/* ══════════════════════════════════════════ */


/* ─── ANIMATION ENGINE ─── */
(function() {
  'use strict';
  const observed = new Set();

  const io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting || observed.has(entry.target)) return;
      observed.add(entry.target);
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || '0');
      /* Second unguarded `anime` call site. This one fires from an
         IntersectionObserver on nearly every section of every page, so with
         the CDN slow or blocked it threw continuously, not once.
         As above, skipping is safe precisely because these animate
         opacity: [1,1] — the entrance is motion, never reveal. The unobserve
         below stays outside the guard: the element is done either way, and
         leaving it observed would re-throw on every scroll. */
      if (typeof anime !== 'undefined') {
        if (el.classList.contains('yfc-fade')) {
          anime({ targets: el, opacity: [1,1], translateY: [28,0], duration: 700, delay: delay, easing: 'easeOutCubic' });
        } else if (el.classList.contains('yfc-fade-left')) {
          anime({ targets: el, opacity: [1,1], translateX: [-32,0], duration: 700, delay: delay, easing: 'easeOutCubic' });
        } else if (el.classList.contains('yfc-fade-right')) {
          anime({ targets: el, opacity: [1,1], translateX: [32,0], duration: 700, delay: delay, easing: 'easeOutCubic' });
        } else if (el.classList.contains('yfc-scale')) {
          anime({ targets: el, opacity: [1,1], scale: [0.94,1], duration: 600, delay: delay, easing: 'easeOutQuart' });
        }
      }
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function tagPage(pageEl) {
    pageEl.querySelectorAll('.yfc-fade, .yfc-fade-left, .yfc-fade-right, .yfc-scale').forEach(function(el) {
      observed.delete(el); io.unobserve(el); io.observe(el);
    });
    pageEl.querySelectorAll('.section-heading, .home-statement h2, .home-community h2, .give-left h2, .give-right h2, .believe-hero h1, .sermons-latest-info h2, .nextsteps-intro h1, .pullquote-text').forEach(function(el, i) {
      if (!el.classList.contains('yfc-fade')) { el.classList.add('yfc-fade'); el.dataset.delay = i * 60; }
      observed.delete(el); io.observe(el);
    });
    pageEl.querySelectorAll('.home-statement p, .home-community p, .believe-text p, .give-reason, .sermons-latest-info .desc, .nextsteps-intro p, .stage-desc, .resource-desc').forEach(function(el, i) {
      if (!el.classList.contains('yfc-fade')) { el.classList.add('yfc-fade'); el.dataset.delay = 80 + i * 50; }
      observed.delete(el); io.observe(el);
    });
    pageEl.querySelectorAll('.home-card, .sermon-card, .archive-item, .resource-card, .nextsteps-stage').forEach(function(el, i) {
      if (!el.classList.contains('yfc-scale')) { el.classList.add('yfc-scale'); el.dataset.delay = i * 90; }
      observed.delete(el); io.observe(el);
    });
    pageEl.querySelectorAll('.sermon-feature').forEach(function(el, i) {
      const cls = i % 2 === 0 ? 'yfc-fade-left' : 'yfc-fade-right';
      if (!el.classList.contains(cls)) { el.classList.add(cls); el.dataset.delay = i * 100; }
      observed.delete(el); io.observe(el);
    });
    pageEl.querySelectorAll('.believe-text').forEach(function(el, i) {
      const cls = i % 2 === 0 ? 'yfc-fade-left' : 'yfc-fade-right';
      if (!el.classList.contains(cls)) { el.classList.add(cls); el.dataset.delay = 100; }
      observed.delete(el); io.observe(el);
    });
    pageEl.querySelectorAll('.btn-outline-dark, .btn-outline-light, .btn-amber, .all-sermons-link, .hero-cta').forEach(function(el, i) {
      if (!el.classList.contains('yfc-fade')) { el.classList.add('yfc-fade'); el.dataset.delay = 160 + i * 60; }
      observed.delete(el); io.observe(el);
    });
    pageEl.querySelectorAll('.info-block').forEach(function(el, i) {
      if (!el.classList.contains('yfc-fade')) { el.classList.add('yfc-fade'); el.dataset.delay = i * 120; }
      observed.delete(el); io.observe(el);
    });
    pageEl.querySelectorAll('.scripture-text, .scripture-ref, .pullquote-cite, .stat-num').forEach(function(el, i) {
      if (!el.classList.contains('yfc-fade')) { el.classList.add('yfc-fade'); el.dataset.delay = i * 100; }
      observed.delete(el); io.observe(el);
    });
    pageEl.querySelectorAll('.event-list-card').forEach(function(el, i) {
      if (!el.classList.contains('yfc-fade')) { el.classList.add('yfc-fade'); el.dataset.delay = i * 80; }
      observed.delete(el); io.observe(el);
    });
    pageEl.querySelectorAll('footer .footer-col, footer .footer-brand').forEach(function(el, i) {
      if (!el.classList.contains('yfc-fade')) { el.classList.add('yfc-fade'); el.dataset.delay = i * 80; }
      observed.delete(el); io.observe(el);
    });
  }

  function heroEntrance(pageId) {
    /* Every other anime block on the site is guarded with this check; this one
       was missed, and _doShowPage calls it on EVERY page switch. With the CDN
       slow or blocked, `anime` is undefined here, the ReferenceError unwinds
       out of _doShowPage, and the transition panel never retracts.
       Bailing out costs only motion: every call below animates
       opacity: [1,1] — i.e. no opacity change at all — so nothing here is
       required for content to be visible. That is the site's standing rule and
       it is what makes returning early safe. */
    if (typeof anime === 'undefined') return;
    anime({ targets: '#nav .nav-logo', opacity: [1,1], translateY: [-12,0], duration: 800, delay: 100, easing: 'easeOutQuart' });
    anime({ targets: '#nav .nav-right', opacity: [1,1], translateY: [-8,0], duration: 700, delay: 250, easing: 'easeOutCubic' });
    var heroH = document.querySelector('#page-' + pageId + ' h1');
    if (heroH) anime({ targets: heroH, opacity: [1,1], translateY: [20,0], duration: 900, delay: 350, easing: 'easeOutExpo' });
    var rule = document.querySelector('#page-' + pageId + ' .sermons-hero-rule, #page-' + pageId + ' .give-hero-rule, #page-' + pageId + ' .events-hero-rule, #page-' + pageId + ' .resources-hero-rule, #page-' + pageId + ' .hero-scroll-line');
    if (rule) anime({ targets: rule, opacity: [1,1], scaleY: [0,1], duration: 700, delay: 200, easing: 'easeOutQuart' });
    if (pageId === 'home') {
        anime({ targets: '.home-hero h1', opacity: [1,1], translateY: [0,0], duration: 900, delay: 200, easing: 'easeOutExpo' });
        anime({ targets: '.hero-when', opacity: [1,1], translateY: [12,0], duration: 700, delay: 450, easing: 'easeOutCubic' });
        anime({ targets: '.hero-primary, .hero-secondary', opacity: [1,1], translateY: [12,0], duration: 700, delay: 600, easing: 'easeOutCubic' });
        anime({ targets: '.hero-es', opacity: [1,1], duration: 700, delay: 800, easing: 'easeOutCubic' });
      }
  }

  window._yfcHeroEntrance = heroEntrance;
  window._yfcTagPage = tagPage;

  window.addEventListener('DOMContentLoaded', function() {
    heroEntrance('home');
    setTimeout(function() { tagPage(document.getElementById('page-home')); }, 400);
  });
})();

/* ─── NAVIGATION — functions defined in <head>, wired here for Escape key ─── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeMenu();
});

/* ─── SCROLL NAV COLOR + BACKGROUND ─── */
window.addEventListener('scroll', function() {
  const nav = document.getElementById('nav');
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;
  const id = activePage.id.replace('page-', '');
  // scrolled background — kicks in after 80px on any page
  if (window.scrollY > 80) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  // color: only change when not scrolled (scrolled state locks to dark/white text)
  if (!nav.classList.contains('scrolled')) {
    if (id === 'believe' || id === 'nextsteps') {
      nav.classList.remove('on-light'); nav.classList.add('on-dark');
    } else {
      nav.classList.remove('on-light'); nav.classList.add('on-dark');
    }
  }
});

/* ─── RESOURCES FILTER ─── */
document.querySelectorAll('.resources-filter-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var cat = this.dataset.filter;
    document.querySelectorAll('.resources-filter-btn').forEach(function(b) { b.classList.remove('active'); });
    this.classList.add('active');
    document.querySelectorAll('.resource-card').forEach(function(card) {
      card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
    });
  });
});

/* ─── EVENTS FILTER (works on both static & PCO-populated cards) ─── */
document.querySelector('.events-filter-pills') && document.querySelector('.events-filter-pills').addEventListener('click', function(e) {
  var btn = e.target.closest('.events-filter-btn');
  if (!btn) return;
  var cat = btn.dataset.filter;
  document.querySelectorAll('.events-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.event-list-card').forEach(function(card) {
    card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
  });
});


/* ─── MINISTRIES FILTER ─── */
document.getElementById('ministries-filter-bar') && document.getElementById('ministries-filter-bar').addEventListener('click', function(e) {
  var btn = e.target.closest('.min-filter');
  if (!btn) return;
  var cat = btn.dataset.filter;
  document.querySelectorAll('.min-filter').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.ministry-card').forEach(function(card) {
    card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
  });
});

/* ─── NEXT STEPS: FORM SUBMIT ─── */
/* This used to hide the form and show "success" without sending anything
   anywhere. On a live site that is worse than having no form at all: someone
   asks for help, is told it worked, and nobody ever sees it.

   It now POSTs to Netlify Forms and only shows success when the POST actually
   succeeds. If it fails, it says so and gives the phone number, because the
   person still needs to reach someone. */
function nsSubmit(e, formId, successId) {
  e.preventDefault();
  var form = document.getElementById(formId);
  var success = document.getElementById(successId);
  if (!form) return;

  var btn = form.querySelector('.ns-submit');
  var original = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  function fail(msg) {
    if (btn) { btn.disabled = false; btn.textContent = original; }
    var err = form.querySelector('.ns-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'ns-error';
      err.setAttribute('role', 'alert');
      form.appendChild(err);
    }
    err.textContent = msg;
  }

  /* Route to the right destination form based on what they picked, so the
     submission lands with the person who actually handles it rather than in one
     shared inbox somebody has to remember to watch. The four names are declared
     as hidden forms in index.html; recipients are configured in Netlify, not
     here, so staff changes never require a code change. */
  var ROUTES = {
    'I made a decision to follow Jesus': 'connect-decision',
    'I want to be baptized':             'connect-decision',
    'I want to join a Life Group':       'connect-belong',
    'I want to become a member':         'connect-belong',
    'I want to start serving':           'connect-serve',
    "I'm ready to be commissioned":      'connect-serve',
    'I just want to talk to someone':    'connect-talk'
  };
  var stepEl = form.querySelector('[name="step"]');
  var chosen = stepEl ? stepEl.value : '';
  var target = ROUTES[chosen] || 'connect-talk';   /* unknown answer still reaches a human */

  var data = new FormData(form);
  data.set('form-name', target);
  var body = new URLSearchParams();
  data.forEach(function (v, k) { body.append(k, v); });

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      form.style.display = 'none';
      if (success) success.style.display = 'block';
    })
    .catch(function () {
      fail('That didn’t send — sorry. Please call us on (509) 575-1490 and we’ll pick it up from there.');
    });
}

/* ══════════════════════════════════════════════════════════════
   YFC LIVE INTEGRATIONS
   ── Fill in credentials below before going live on Squarespace ──
   ══════════════════════════════════════════════════════════════ */
var YFC_CONFIG = {

  /* ── YOUTUBE ──────────────────────────────────────────────
     NO API KEY NEEDED. Sermons read YouTube's public Atom feed via
     netlify/functions/sermons.mjs — no credentials, no quota, nothing
     to restrict or rotate.

     The key below is optional and used for ONE thing: detecting whether
     a stream is live right now, which the Atom feed cannot report.
     Left unset, the livestream page embeds YouTube's own live_stream
     URL, which shows the stream when there is one and an offline state
     when there isn't. That is the current behaviour and it works.
     Only set a key if you want a custom "we're live" indicator. */
  YOUTUBE_API_KEY:    'YOUR_YOUTUBE_API_KEY',
  YOUTUBE_CHANNEL_ID: 'UCzr3Q1kImqSqozM-E2g0lJQ',
  YOUTUBE_MAX_RESULTS: 9,

  /* ── PLANNING CENTER ──────────────────────────────────────
     1. planningcenteronline.com → Apps & Integrations → API
     2. Personal Access Token → Create
     3. Paste App ID and Secret below                         */
  PCO_APP_ID: 'YOUR_PCO_APP_ID',
  PCO_SECRET:  'YOUR_PCO_SECRET',

  /* ── PUSHPAY ──────────────────────────────────────────────
     Your giving page slug from: pushpay.com/g/[SLUG]
     e.g. if your link is pushpay.com/g/yakimafoursquare
     set this to 'yakimafoursquare'                          */
  PUSHPAY_SLUG: 'YOUR_PUSHPAY_SLUG',
    // Optional: show a banner at top of site
    // ANNOUNCEMENT: { text: 'Special service this Sunday at 10:30 AM.', link: '#', linkText: 'Details' }
    ANNOUNCEMENT: null,
    FORMSPREE_ID: 'YOUR_FORMSPREE_ID' // get free at formspree.io
};


/* ─── YOUTUBE: AUTO-POPULATE SERMONS ─── */
(function() {
  function fmtDate(str) {
    return new Date(str).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function renderYouTube(items) {
      if (!items || !items.length) return;
      function ytThumb(id, q) { return 'https://img.youtube.com/vi/' + id + '/' + (q || 'hqdefault') + '.jpg'; }
      function classify(title) {
        var t = (title || '').toLowerCase();
        if (/worship|praise|holy|king|echo|behold/.test(t)) return 'worship';
        if (/christmas|easter|good friday|baptism|special|conference/.test(t)) return 'special';
        return 'teaching';
      }

      /* ── Featured ── */
      var v0 = items[0], id0 = v0.id.videoId;
      var thumb = document.querySelector('.sermons-latest-thumb');
      if (thumb) {
        thumb.href = 'https://www.youtube.com/watch?v=' + id0;
        thumb.style.background = "linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.42)), url('" + ytThumb(id0, 'maxresdefault') + "') center/cover no-repeat";
      }
      var info = document.querySelector('.sermons-latest-info');
      if (info) {
        var t = info.querySelector('.srm-feature-title');
        if (t) t.textContent = v0.snippet.title;
        var d = info.querySelector('.date');
        if (d) d.textContent = fmtDate(v0.snippet.publishedAt);
        var tag = info.querySelector('.srm-series-tag');
        if (tag) tag.textContent = classify(v0.snippet.title) === 'worship' ? 'Worship' : 'Sunday Teaching';
        info.querySelectorAll('a.btn-outline-dark, a.srm-btn--solid').forEach(function(a){
          a.href = 'https://www.youtube.com/watch?v=' + id0;
        });
      }

      /* ── Archive grid — built with createElement, text via textContent ── */
      var grid = document.querySelector('.archive-grid');
      if (!grid) return;
      grid.textContent = '';
      var rest = items.slice(1);
      rest.forEach(function(v) {
        var id = v.id.videoId, kind = classify(v.snippet.title);
        var card = document.createElement('a');
        card.className = 'srm-card';
        card.href = 'https://www.youtube.com/watch?v=' + id;
        card.target = '_blank'; card.rel = 'noopener';
        card.setAttribute('data-kind', kind);

        var th = document.createElement('div');
        th.className = 'srm-card-thumb';
        th.style.background = "linear-gradient(rgba(0,0,0,.06),rgba(0,0,0,.3)), url('" + ytThumb(id) + "') center/cover no-repeat";
        var pl = document.createElement('span');
        pl.className = 'srm-card-play'; pl.setAttribute('aria-hidden','true');
        th.appendChild(pl);

        var body = document.createElement('div');
        body.className = 'srm-card-body';
        var s = document.createElement('p');
        s.className = 'srm-card-series';
        s.textContent = kind === 'worship' ? 'Worship' : (kind === 'special' ? 'Special' : 'Sunday Teaching');
        var ti = document.createElement('h3');
        ti.className = 'srm-card-title';
        ti.textContent = v.snippet.title;
        var meta = document.createElement('div');
        meta.className = 'srm-card-meta';
        var dt = document.createElement('span');
        dt.textContent = fmtDate(v.snippet.publishedAt);
        var wl = document.createElement('span');
        wl.textContent = 'Watch ↗';
        meta.appendChild(dt); meta.appendChild(wl);
        body.appendChild(s); body.appendChild(ti); body.appendChild(meta);

        card.appendChild(th); card.appendChild(body);
        grid.appendChild(card);
      });

      /* Cards are now in the DOM, so it is safe to swap the static fallback
         for the live controls. */
      if (window._yfcSrmRevealLive) window._yfcSrmRevealLive(items.length);

      /* ── Filters ── */
      var btns = document.querySelectorAll('.srm-filter');
      btns.forEach(function(btn) {
        btn.onclick = function() {
          btns.forEach(function(b){ b.classList.remove('active'); });
          btn.classList.add('active');
          var f = btn.getAttribute('data-f'), shown = 0;
          grid.querySelectorAll('.srm-card').forEach(function(card) {
            var ok = (f === 'all') || card.getAttribute('data-kind') === f;
            card.style.display = ok ? '' : 'none';
            if (ok) shown++;
          });
          if (cnt) cnt.textContent = f === 'all' ? items.length : shown;
        };
      });
    }

  /* The sermons page ships in a working static state. These blocks are the
     parts that only make sense once real videos exist — a filter bar, a count,
     an "archive" link below a populated grid. They stay hidden until we have
     something to put in them, and the static fallback hides at the same moment.
     Call this ONLY after cards are actually in the DOM. */
  function srmRevealLive(count) {
    if (!count) return;
    document.querySelectorAll('.srm-live-only').forEach(function(el) { el.hidden = false; });
    var empty = document.getElementById('srm-empty');
    if (empty) empty.hidden = true;
    var cnt = document.querySelector('.srm-count b');
    if (cnt) cnt.textContent = count;
  }
  window._yfcSrmRevealLive = srmRevealLive;

  /* Sermons come from a Netlify function that reads YouTube's public Atom feed
     server-side. No API key: nothing to leak, restrict, rotate or run out of.
     See netlify/functions/sermons.mjs.

     Fails soft by design — if the function is unreachable (e.g. running from a
     plain file:// or a static server with no functions), the page keeps its
     static archive link instead of showing an error. */
  function fetchYouTube() {
    fetch('/.netlify/functions/sermons')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.items || !d.items.length) {
          console.log('[YFC Sermons] No feed data — static archive link showing.');
          return;
        }
        /* Shape it like the old API response so renderYouTube is unchanged. */
        /* thumbnail/url are derived here rather than sent over the wire. */
        renderYouTube(d.items.map(function (v) {
          return {
            id: { videoId: v.id },
            snippet: { title: v.title, publishedAt: v.published }
          };
        }));
      })
      .catch(function () {
        console.log('[YFC Sermons] Feed unavailable — static archive link showing.');
      });
  }

  window._yfcFetchSermons = fetchYouTube;
  document.addEventListener('DOMContentLoaded', fetchYouTube);
})();


/* ─── PLANNING CENTER: AUTO-POPULATE EVENTS ─── */
(function() {
  function fmtEvent(dateStr) {
    var d = new Date(dateStr);
    return {
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day:   d.getDate(),
      time:  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  }

  function renderPCO(events) {
    var list = document.querySelector('.events-list');
    if (!list || !events || !events.length) return;
    list.innerHTML = events.map(function(ev) {
      var a = ev.attributes;
      var dt = fmtEvent(a.starts_at);
      var url = a.public_url || '#';
      var cta = a.registration_open ? 'Register' : 'Details';
      return '<div class="event-list-card">' +
        '<div class="event-date-block">' +
        '<span class="event-month-tag">' + dt.month + '</span>' +
        '<span class="event-day-num">' + dt.day + '</span>' +
        '</div>' +
        '<div class="event-info-col">' +
        '<p class="event-list-name">' + (a.name || '') + '</p>' +
        '<p class="event-list-desc">' + (a.description || '') + '</p>' +
        '<p class="event-list-time">' + dt.time + (a.location ? ' · ' + a.location : '') + '</p>' +
        '</div>' +
        '<div class="event-action">' +
        '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="btn-outline-dark">' + cta + '</a>' +
        '</div></div>';
    }).join('');
  }

  function fetchPCO() {
    if (YFC_CONFIG.PCO_APP_ID === 'YOUR_PCO_APP_ID') {
      console.log('[YFC Events] PCO credentials not set — static content showing. Add credentials to YFC_CONFIG to go live.');
      return;
    }
    var auth = 'Basic ' + btoa(YFC_CONFIG.PCO_APP_ID + ':' + YFC_CONFIG.PCO_SECRET);
    fetch('https://api.planningcenteronline.com/registrations/v2/events?filter=upcoming&per_page=10&order=starts_at', {
      headers: { 'Authorization': auth }
    })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.errors) { console.warn('[YFC Events] PCO error:', d.errors); return; }
        renderPCO(d.data);
      })
      .catch(function(e) { console.warn('[YFC Events] Fetch failed:', e); });
  }

  window._yfcFetchEvents = fetchPCO;
  document.addEventListener('DOMContentLoaded', fetchPCO);
})();


/* ─── PUSHPAY: GIVE ─── */
(function() {
  var selectedAmount = 50;
  var selectedFreq   = 'recurring';

  document.querySelectorAll('.give-amount').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.give-amount').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var txt = this.textContent.trim();
      if (txt === 'Other') {
        var val = prompt('Enter a custom amount ($):');
        selectedAmount = val ? Math.abs(parseInt(val)) || 50 : 50;
      } else {
        selectedAmount = parseInt(txt.replace('$', ''));
      }
    });
  });

  document.querySelectorAll('.give-freq-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.give-freq-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      selectedFreq = this.textContent.trim() === 'Monthly' ? 'recurring' : 'once';
    });
  });

  var giveBtn = document.querySelector('.give-submit');
  if (giveBtn) {
    giveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (YFC_CONFIG.PUSHPAY_SLUG === 'YOUR_PUSHPAY_SLUG') {
        alert('PushPay not yet configured. Set YFC_CONFIG.PUSHPAY_SLUG to your church slug.');
        return;
      }
      var url = 'https://pushpay.com/g/' + YFC_CONFIG.PUSHPAY_SLUG +
                '?amount=' + selectedAmount + '&frequency=' + selectedFreq;
      window.open(url, '_blank');
    });
  }
})();

/* ─── HILLSCAPE INTERSECTION OBSERVER ─── */
(function() {
  var section = document.querySelector('.hillscape');
  if (!section) return;
  var observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) {
      section.classList.add('visible');
      var nodes = section.querySelectorAll('.hillscape-node');
      nodes.forEach(function(n, i) {
        setTimeout(function() { n.classList.add('visible'); }, i * 150);
      });
      observer.disconnect();
    }
  }, { threshold: 0.2 });
  observer.observe(section);
})();

/* ══════════════════════════════════════════════
   LIVESTREAM — live detection + countdown
══════════════════════════════════════════════ */
(function() {
  var _lsInitialized = false;

  function setNavLiveState(isLive) {
    var btn = document.getElementById('nav-live-btn');
    if (!btn) return;
    if (isLive) btn.classList.add('is-live');
    else btn.classList.remove('is-live');
  }

  function setLsBadge(isLive) {
    var badge = document.getElementById('ls-badge-el');
    var dot = document.getElementById('ls-badge-dot');
    var text = document.getElementById('ls-badge-text');
    if (!badge) return;
    if (isLive) {
      badge.classList.add('is-live');
      if (text) text.textContent = 'LIVE';
    } else {
      badge.classList.remove('is-live');
      if (text) text.textContent = 'Not Live';
    }
  }

  function setLiveState(videoId, title) {
    // Update player src to specific live video
    var player = document.getElementById('ls-player');
    if (player) {
      player.src = 'https://www.youtube-nocookie.com/embed/' + videoId +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    }
    // Show live chat
    var chat = document.getElementById('ls-chat');
    var chatCard = document.getElementById('ls-chat-card');
    if (chat) chat.src = 'https://www.youtube.com/live_chat?is_popout=1&v=' + videoId;
    if (chatCard) chatCard.style.display = 'flex';
    // Title
    var seriesTitle = document.getElementById('ls-series-title');
    if (seriesTitle && title) seriesTitle.textContent = title;
    // Labels
    var seriesLabel = document.getElementById('ls-series-label');
    if (seriesLabel) seriesLabel.textContent = 'On Air Now';
    // Service label in header
    var svcLabel = document.getElementById('ls-service-label');
    if (svcLabel) svcLabel.textContent = title || 'Yakima Foursquare Church';
    // Hide offline overlay
    var offline = document.getElementById('ls-offline');
    if (offline) offline.classList.add('hidden');
    // Badges
    setLsBadge(true);
    setNavLiveState(true);
  }

  function setOfflineState() {
    // Show offline overlay
    var offline = document.getElementById('ls-offline');
    if (offline) offline.classList.remove('hidden');
    setLsBadge(false);
    setNavLiveState(false);
    startCountdown();
  }

  function setUnknownState() {
    // No API key — just show channel embed, no overlay
    var offline = document.getElementById('ls-offline');
    if (offline) offline.classList.add('hidden');
    setLsBadge(false);
  }

  function getNextServiceUTC() {
    // Services: Sunday 9:00 AM and 10:30 AM Pacific
    var now = new Date();
    // Get current time in PT
    var ptStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    var pt = new Date(ptStr);
    var day = pt.getDay(); // 0=Sun
    var h = pt.getHours();
    var m = pt.getMinutes();
    var s = pt.getSeconds();

    var target = new Date(pt);
    if (day === 0 && (h < 9)) {
      target.setHours(9, 0, 0, 0);
    } else if (day === 0 && (h < 10 || (h === 10 && m < 30))) {
      target.setHours(10, 30, 0, 0);
    } else {
      // Next Sunday
      var days = (7 - day) % 7;
      if (days === 0) days = 7;
      target.setDate(target.getDate() + days);
      target.setHours(9, 0, 0, 0);
    }

    // Calculate offset between now (UTC-based) and pt (locale-based)
    var offset = now.getTime() - pt.getTime();
    return new Date(target.getTime() + offset);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  var _cdInterval = null;
  function startCountdown() {
    if (_cdInterval) clearInterval(_cdInterval);
    function tick() {
      var next = getNextServiceUTC();
      var diff = next.getTime() - Date.now();
      if (diff <= 0) { diff = 0; }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      var dEl = document.getElementById('cd-d');
      var hEl = document.getElementById('cd-h');
      var mEl = document.getElementById('cd-m');
      var sEl = document.getElementById('cd-s');
      if (dEl) dEl.textContent = pad(d);
      if (hEl) hEl.textContent = pad(h);
      if (mEl) mEl.textContent = pad(m);
      if (sEl) sEl.textContent = pad(s);
      // Next service header label
      var nextEl = document.getElementById('ls-next-service');
      if (nextEl) {
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        nextEl.textContent = 'Next: ' + days[next.getDay()] + ' · 9:00 AM PT';
      }
    }
    tick();
    _cdInterval = setInterval(tick, 1000);
  }

  window._yfcLivestreamInit = function() {
    if (_lsInitialized) return;
    _lsInitialized = true;

    var apiKey = (typeof YFC_CONFIG !== 'undefined') ? YFC_CONFIG.YOUTUBE_API_KEY : null;
    var channelId = (typeof YFC_CONFIG !== 'undefined') ? YFC_CONFIG.YOUTUBE_CHANNEL_ID : 'UCzr3Q1kImqSqozM-E2g0lJQ';

    if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY') {
      // No API key — treat as live for mockup purposes (live_stream embed auto-loads broadcast)
      setLiveState('live_stream?channel=' + channelId, 'Sunday Service · Yakima Foursquare Church');
      // Override player src to use channel live_stream URL
      var p = document.getElementById('ls-player');
      if (p) p.src = 'https://www.youtube-nocookie.com/embed/live_stream?channel=' + channelId + '&autoplay=0&rel=0&modestbranding=1&playsinline=1';
      return;
    }

    // Check live status via YouTube Data API
    fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' +
      channelId + '&eventType=live&type=video&key=' + apiKey)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.items && data.items.length > 0) {
          var item = data.items[0];
          setLiveState(item.id.videoId, item.snippet.title);
        } else {
          setOfflineState();
        }
      })
      .catch(function() { setOfflineState(); });
  };

  // Also check on load in case livestream page is default
  window.addEventListener('DOMContentLoaded', function() {
    var activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'page-livestream') {
      window._yfcLivestreamInit();
    }
  });
})();


/* ═══════════════════════════════════════════
   PATHWAY — jumper + scroll activation
═══════════════════════════════════════════ */
function pwJump(targetId, btn) {
  var el = document.getElementById(targetId);
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  document.querySelectorAll('.pw-jump-btn').forEach(function(b) { b.classList.remove('pw-active'); });
  if (btn) btn.classList.add('pw-active');
}

// Scroll reveal for .pw-detail sections
(function() {
  var details = document.querySelectorAll('.pw-detail');
  if (!details.length) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('pw-visible'); }
    });
  }, { threshold: 0.08 });
  details.forEach(function(d) { obs.observe(d); });

  // Update jumper active state on scroll
  var stageIds = ['ns-begin','ns-belong','ns-contribute','ns-multiply'];
  var scrollObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        var id = e.target.id;
        document.querySelectorAll('.pw-jump-btn').forEach(function(b) {
          b.classList.toggle('pw-active', b.dataset.target === id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-64px 0px 0px 0px' });
  stageIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) scrollObs.observe(el);
  });
})();



  document.getElementById('yfc-year') && (document.getElementById('yfc-year').textContent = new Date().getFullYear());

/* ── GIVE PAGE — Pushpay wiring ── */
(function() {
  var _giveAmount = 50;
  var _giveFreq = 'once';

  function _refreshAmountBtns() {
    document.querySelectorAll('.give-amount-btn').forEach(function(b) {
      b.classList.toggle('selected', b.dataset.amount === String(_giveAmount));
    });
  }
  function _refreshFreqBtns() {
    document.querySelectorAll('.give-freq-btn').forEach(function(b) {
      b.classList.toggle('selected', b.dataset.freq === _giveFreq);
    });
  }

  window.giveSelectAmount = function(btn, amount) {
    if (amount === 'other') {
      var custom = prompt('Enter amount (numbers only):');
      if (!custom || isNaN(Number(custom))) return;
      _giveAmount = Number(custom);
    } else {
      _giveAmount = amount;
    }
    _refreshAmountBtns();
  };

  window.giveSelectFreq = function(btn, freq) {
    _giveFreq = freq;
    _refreshFreqBtns();
  };

  window.giveLaunch = function() {
    var slug = (typeof YFC_CONFIG !== 'undefined') ? YFC_CONFIG.PUSHPAY_SLUG : null;
    if (!slug || slug === 'YOUR_PUSHPAY_SLUG') {
      alert('Giving is not yet configured. Please check back soon or contact the church office.');
      return;
    }
    var freq = _giveFreq === 'monthly' ? 'recurring' : 'once';
    var url = 'https://pushpay.com/g/' + slug + '?amount=' + _giveAmount + '&frequency=' + freq;
    window.open(url, '_blank', 'noopener');
  };

  // Init on page open
  document.addEventListener('DOMContentLoaded', function() {
    _refreshAmountBtns();
    _refreshFreqBtns();
  });
})();


/* ── LIVESTREAM — polling fix ── */
(function() {
  var _pollInterval = null;
  var _origInit = window._yfcLivestreamInit;
  window._yfcLivestreamInit = function() {
    if (_origInit) _origInit();
    if (_pollInterval) return;
    _pollInterval = setInterval(function() {
      // Only re-check if we're on the livestream page and not yet live
      if (document.getElementById('ls-offline') && !document.getElementById('ls-offline').classList.contains('hidden')) {
        _lsInitialized = false;
        if (_origInit) _origInit();
      }
    }, 60000);
  };
  // Clear interval when navigating away from livestream
  var _origShowPage = window.showPage;
  if (_origShowPage) {
    window.showPage = function(id) {
      if (id !== 'livestream' && _pollInterval) {
        clearInterval(_pollInterval);
        _pollInterval = null;
        _lsInitialized = false;
      }
      _origShowPage(id);
    };
  }
})();


/* ── ANNOUNCEMENT BANNER ── */
(function() {
  var ann = (typeof YFC_CONFIG !== 'undefined') ? YFC_CONFIG.ANNOUNCEMENT : null;
  if (ann && ann.text) {
    var el = document.getElementById('ann-banner');
    var txt = document.getElementById('ann-text');
    if (el && txt) {
      txt.innerHTML = ann.link
        ? ann.text + ' <a href="' + ann.link + '">' + (ann.linkText || 'Learn more') + ' &rarr;</a>'
        : ann.text;
      el.classList.add('ann-visible');
    }
  }
})();


/* ── FORM SUBMISSIONS — Formspree ── */
function yfcSubmitForm(formEl, successId) {
  var formspreeId = (typeof YFC_CONFIG !== 'undefined') ? YFC_CONFIG.FORMSPREE_ID : null;
  if (!formspreeId || formspreeId === 'YOUR_FORMSPREE_ID') {
    // Fallback: show success anyway in mockup mode
    formEl.style.display = 'none';
    var s = document.getElementById(successId);
    if (s) s.style.display = 'block';
    return;
  }
  var data = new FormData(formEl);
  fetch('https://formspree.io/f/' + formspreeId, {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' }
  }).then(function(r) {
    formEl.style.display = 'none';
    var s = document.getElementById(successId);
    if (s) s.style.display = 'block';
  }).catch(function() {
    // Silent fallback
    formEl.style.display = 'none';
    var s = document.getElementById(successId);
    if (s) s.style.display = 'block';
  });
}


/* ══════════════════════════════════════════════════════════════
   CREATIVE ENGINE — Lenis · GSAP · WebGL Shader · Stagger · Counters
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  /* ─── 0. WEBGL SHADER GRADIENT ─── */
  (function() {
    var canvas = document.getElementById('yfc-shader-canvas');
    if (!canvas) return;

    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { canvas.style.display = 'none'; return; }

    var VS = [
      'attribute vec2 a_pos;',
      'void main(){gl_Position=vec4(a_pos,0,1);}'
    ].join('\n');

    var FS = [
      'precision mediump float;',
      'uniform float u_time;',
      'uniform vec2  u_res;',

      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',

      'float noise(vec2 p){',
      '  vec2 i=floor(p);vec2 f=fract(p);',
      '  f=f*f*(3.0-2.0*f);',
      '  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),',
      '             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);',
      '}',

      'float fbm(vec2 p){',
      '  float v=0.0;float a=0.5;',
      '  for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.1+vec2(1.3,1.7);a*=0.5;}',
      '  return v;',
      '}',

      'void main(){',
      '  vec2 uv=gl_FragCoord.xy/u_res;',
      '  float t=u_time*0.09;',

      /* Domain warping — two passes give organic depth */
      '  vec2 q=vec2(fbm(uv+t),fbm(uv+vec2(5.2,1.3)+t*0.7));',
      '  float f=fbm(uv+1.6*q+vec2(1.7,9.2)+t*0.4);',

      /* YFC palette: forest-deep → forest → sage → amber accent */
      '  vec3 c0=vec3(0.067,0.059,0.055);', /* u-950 steel   */
      '  vec3 c1=vec3(0.157,0.129,0.106);', /* u-850 sepia   */
      '  vec3 c2=vec3(0.482,0.298,0.176);', /* u-600 cherry  */
      '  vec3 ca=vec3(0.831,0.510,0.227);', /* amber-500 sun */

      '  vec3 col=mix(c0,c1,smoothstep(0.0,0.5,f));',
      '  col=mix(col,c2,smoothstep(0.4,0.8,f));',
      '  col+=ca*smoothstep(0.72,0.95,f)*0.28;',

      /* Subtle vignette */
      '  vec2 vd=uv*2.0-1.0;',
      '  col*=1.0-dot(vd,vd)*0.28;',

      /* Keep it dark — overlay tones down brightness */
      '  col=mix(c0,col,0.78);',

      '  gl_FragColor=vec4(col,1.0);',
      '}'
    ].join('\n');

    function compileShader(src, type) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('YFC shader:', gl.getShaderInfoLog(s)); return null;
      }
      return s;
    }

    var vs = compileShader(VS, gl.VERTEX_SHADER);
    var fs = compileShader(FS, gl.FRAGMENT_SHADER);
    if (!vs || !fs) { canvas.style.display = 'none'; return; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('YFC shader link:', gl.getProgramInfoLog(prog));
      canvas.style.display = 'none'; return;
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    var uTime = gl.getUniformLocation(prog, 'u_time');
    var uRes  = gl.getUniformLocation(prog, 'u_res');

    var startTime = performance.now();
    var frameId;
    var running = true;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function render() {
      if (!running) return;
      var t = (performance.now() - startTime) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frameId = requestAnimationFrame(render);
    }

    /* Stop rendering when hero is scrolled way past — saves GPU */
    var heroSection = canvas.closest('section');
    if (heroSection && window.IntersectionObserver) {
      new IntersectionObserver(function(entries) {
        running = entries[0].isIntersecting;
        if (running) render();
        else cancelAnimationFrame(frameId);
      }, { threshold: 0 }).observe(heroSection);
    }

    window.addEventListener('resize', resize);
    resize();
    render();
  })();

  /* ─── 1. LENIS + GSAP SYNC ─── */
  window.addEventListener('DOMContentLoaded', function() {
    if (typeof Lenis !== 'undefined') {
      var lenis = new Lenis({
        lerp: 0.14,
        smoothWheel: true,
        syncTouch: false
      });
      window._lenisInstance = lenis;

      /* Hook Lenis into GSAP's ticker — canonical integration */
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        /* Fallback: standalone RAF */
        (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
      }

      lenis.on('scroll', function() {
        window.dispatchEvent(new Event('scroll'));
      });

      window._lenisInstance = lenis;
    }

    /* ─── GSAP SCROLLTRIGGER ANIMATIONS ─── */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

      /* Pinned section strip — statement section grows text as you scroll in */
      gsap.utils.toArray('.home-statement h2').forEach(function(el) {
        gsap.fromTo(el,
          { y: 40 },
          { y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
          }
        );
      });

      /* Hillscape nodes — stagger in via ScrollTrigger */
      ScrollTrigger.create({
        trigger: '.hillscape',
        start: 'top 70%',
        onEnter: function() {
          var nodes = document.querySelectorAll('.hillscape-node');
          gsap.fromTo(nodes,
            { y: 24 },
            { y: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out' }
          );
        }
      });

      /* Manifesto parallax REMOVED. It translated the whole block ±30px while
         each line's own ScrollTrigger was measuring that line's position, so
         the two fought and the reveal drifted out of sync with the reading
         position. The per-line scrub below is the only motion here now. */

      /* Section heading clip-path scrub */
      gsap.utils.toArray('.section-heading').forEach(function(el) {
        gsap.fromTo(el,
          { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.inOut',
            scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse' }
          }
        );
      });
    }

    /* ─── GSAP HERO ENTRANCE (replaces anime.js for home h1) ─── */
    if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined') {
      window._gsapHeroReady = true;
    }

  }); /* end DOMContentLoaded for GSAP block */


  /* ─── 3. HERO PARALLAX (home page) ─── */
  (function() {
    var isMobile = window.matchMedia('(max-width: 1180px)').matches;
    if (isMobile) return;

    var heroSection = document.querySelector('.home-hero');
    if (!heroSection) return;

    /* Grab the ::before pseudo — we animate the section's background-position instead */
    window.addEventListener('scroll', function() {
      var activePage = document.querySelector('.page.active');
      if (!activePage || activePage.id !== 'page-home') return;
      var y = window.scrollY;
      if (y > window.innerHeight * 1.5) return; /* stop computing past the fold */
      heroSection.style.setProperty('--parallax-y', (y * 0.35) + 'px');
    }, { passive: true });
  })();

  /* ─── 4. STAGGERED CARD GRIDS ─── */
  (function() {
    var staggerObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var parent = entry.target;
        var children = parent.querySelectorAll('.stagger-child');
        children.forEach(function(child, i) {
          setTimeout(function() {
            child.style.opacity = '1';
            child.style.transform = 'none';
          }, i * 75);
        });
        parent.classList.add('stagger-fired');
        staggerObs.unobserve(parent);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    /* Tag grids dynamically so it works on all pages */
    function tagStaggerGrids(pageEl) {
      /* Card grids */
      var grids = pageEl.querySelectorAll('.home-cards, .resources-grid, .ministry-cards, .give-reasons, .ns-selector-grid');
      grids.forEach(function(grid) {
        if (grid.classList.contains('stagger-parent')) return;
        grid.classList.add('stagger-parent');
        grid.querySelectorAll('.home-card, .resource-card, .ministry-card, .give-reason, .ns-selector-card').forEach(function(c) {
          c.classList.add('stagger-child');
        });
        staggerObs.observe(grid);
      });

      /* Sermon cards + archive */
      var sermonGrid = pageEl.querySelector('.sermons-cards, .archive-list');
      if (sermonGrid && !sermonGrid.classList.contains('stagger-parent')) {
        sermonGrid.classList.add('stagger-parent');
        sermonGrid.querySelectorAll('.sermon-card, .archive-item').forEach(function(c) { c.classList.add('stagger-child'); });
        staggerObs.observe(sermonGrid);
      }

      /* Events list */
      var eventsList = pageEl.querySelector('.events-list');
      if (eventsList && !eventsList.classList.contains('stagger-parent')) {
        eventsList.classList.add('stagger-parent');
        eventsList.querySelectorAll('.event-list-card').forEach(function(c) { c.classList.add('stagger-child'); });
        staggerObs.observe(eventsList);
      }

      /* Stage cards (Next Steps) */
      var stageGrid = pageEl.querySelector('.pw-stage-grid, [class*="stage-grid"], .ns-stage-grid');
      if (!stageGrid) {
        /* fallback: find any container holding pw-stage-cards */
        var firstCard = pageEl.querySelector('.pw-stage-card');
        if (firstCard) stageGrid = firstCard.parentElement;
      }
      if (stageGrid && !stageGrid.classList.contains('stagger-parent')) {
        stageGrid.classList.add('stagger-parent');
        stageGrid.querySelectorAll('.pw-stage-card').forEach(function(c) { c.classList.add('stagger-child'); });
        staggerObs.observe(stageGrid);
      }
    }

    /* Hook into the existing _yfcTagPage */
    var origTagPage = window._yfcTagPage;
    window._yfcTagPage = function(pageEl) {
      if (origTagPage) origTagPage(pageEl);
      tagStaggerGrids(pageEl);
    };

    /* Tag home page immediately */
    window.addEventListener('DOMContentLoaded', function() {
      var home = document.getElementById('page-home');
      if (home) tagStaggerGrids(home);
    });
  })();

  /* ─── 5. CLIP-PATH REVEALS on section labels ─── */
  (function() {
    var clipObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        clipObs.unobserve(entry.target);
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -30px 0px' });

    window.addEventListener('DOMContentLoaded', function() {
      /* Apply to section-label elements (the mono uppercase labels) */
      document.querySelectorAll('.section-label, .sermons-hero h1, .give-hero h1, .events-hero h1').forEach(function(el) {
        el.classList.add('clip-reveal');
        clipObs.observe(el);
      });
    });

    /* Also apply when new pages become active */
    var origHeroEntrance = window._yfcHeroEntrance;
    window._yfcHeroEntrance = function(pageId) {
      if (origHeroEntrance) origHeroEntrance(pageId);
      setTimeout(function() {
        var page = document.getElementById('page-' + pageId);
        if (!page) return;
        page.querySelectorAll('.section-label').forEach(function(el) {
          if (!el.classList.contains('clip-reveal')) {
            el.classList.add('clip-reveal');
          }
          /* Reset + re-trigger for each page show */
          el.classList.remove('revealed');
          clipObs.unobserve(el);
          setTimeout(function() { clipObs.observe(el); }, 100);
        });
      }, 50);
    };
  })();

  /* ─── 6. HERO ENTRANCES — focus reveal (home) + word-rise (other pages) ─── */
  (function() {

    /* ── Focus Reveal: blur → sharp, center-out stagger (Originkit Focus Reveal, vanilla)
       Each character begins soft and slightly enlarged, then comes into clarity.
       Center-out stagger feels like a breath expanding outward — intentional.    */
    function focusReveal(el, startDelay) {
      if (el.dataset.focusReveal) return;
      el.dataset.focusReveal = '1';
      startDelay = startDelay || 0;

      var parts = el.innerHTML.split(/(<br\s*\/?>)/gi);
      var chars = [];

      el.innerHTML = '';
      parts.forEach(function(part, pi) {
        if (/^<br/i.test(part)) {
          el.appendChild(document.createElement('br'));
          return;
        }
        var words = part.split(/\s+/).filter(Boolean);
        words.forEach(function(word, wi) {
          if (wi > 0) el.appendChild(document.createTextNode(' '));
          var wordWrap = document.createElement('span');
          wordWrap.style.cssText = 'display:inline-block;white-space:nowrap;';
          word.split('').forEach(function(ch) {
            var s = document.createElement('span');
            s.textContent = ch;
            s.style.cssText = 'display:inline-block;filter:blur(10px);transform:scale(1.08);will-change:filter,transform;';
            wordWrap.appendChild(s);
            chars.push(s);
          });
          el.appendChild(wordWrap);
        });
      });

      if (!chars.length) return;

      /* Center-out order */
      var mid   = (chars.length - 1) / 2;
      var order = chars.map(function(s, i) { return { s: s, dist: Math.abs(i - mid) }; });
      order.sort(function(a, b) { return a.dist - b.dist; });

      var STAGGER  = 30;
      var DURATION = 900;
      var EASE     = 'cubic-bezier(0.16,1,0.3,1)';

      order.forEach(function(item, rank) {
        setTimeout(function() {
          item.s.style.transition = [
            'opacity '   + DURATION + 'ms ' + EASE,
            'filter '    + DURATION + 'ms ' + EASE,
            'transform ' + DURATION + 'ms ' + EASE
          ].join(',');
          item.s.style.opacity   = '1';
          item.s.style.filter    = 'blur(0px)';
          item.s.style.transform = 'scale(1)';
        }, startDelay + rank * STAGGER);
      });
    }

    /* ── Word-rise for non-home h1s ── */
    function splitWords(el) {
      if (el.dataset.wordSplit) return;
      el.dataset.wordSplit = '1';
      var parts = el.innerHTML.split(/(<br\s*\/?>)/gi);
      el.innerHTML = parts.map(function(part) {
        if (/^<br/i.test(part)) return part;
        return part.split(/\s+/).filter(Boolean).map(function(word) {
          return '<span class="yfc-word" style="display:inline-block;transform:translateY(0.5em);will-change:transform;">' + word + '</span>';
        }).join(' ');
      }).join('');
    }

    function animateWords(el, baseDelay) {
      baseDelay = baseDelay || 0;
      el.querySelectorAll('.yfc-word').forEach(function(word, i) {
        setTimeout(function() {
          word.style.transition = 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)';
          word.style.opacity    = '1';
          word.style.transform  = 'none';
        }, baseDelay + i * 70);
      });
    }

    /* ── Wire into heroEntrance chain ── */
    var origHero2 = window._yfcHeroEntrance;
    window._yfcHeroEntrance = function(pageId) {
      if (origHero2) origHero2(pageId);
      var page = document.getElementById('page-' + pageId);
      if (!page) return;
      var h1 = page.querySelector('.home-hero h1, .nextsteps-intro h1, .believe-hero h1');
      if (!h1) return;
      if (pageId === 'home') {
        focusReveal(h1, 320);
      } else {
        splitWords(h1);
        setTimeout(function() { animateWords(h1, 280); }, 50);
      }
    };

    /* ── Initial page load ── */
    window.addEventListener('DOMContentLoaded', function() {
      var homeH1 = document.querySelector('.home-hero h1');
      if (homeH1) focusReveal(homeH1, 420);
    });
  })();

  /* ─── 7. MAGNETIC BUTTONS ─── */
  (function() {
    var isMobile = window.matchMedia('(max-width: 1180px)').matches;
    if (isMobile) return;

    function attachMagnetic(el) {
      if (el.dataset.magnetic) return;
      el.dataset.magnetic = '1';
      el.classList.add('magnetic');
      el.addEventListener('mousemove', function(e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width  / 2) * 0.28;
        var y = (e.clientY - rect.top  - rect.height / 2) * 0.28;
        el.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
      el.addEventListener('mouseleave', function() {
        el.style.transform = '';
      });
    }

    window.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.hero-cta, .give-submit, .btn-amber').forEach(attachMagnetic);
    });

    /* Also attach when new pages tag */
    var origTag2 = window._yfcTagPage;
    window._yfcTagPage = function(pageEl) {
      if (origTag2) origTag2(pageEl);
      pageEl.querySelectorAll('.hero-cta, .give-submit, .btn-amber').forEach(attachMagnetic);
    };
  })();

  /* ─── 8. COUNT-UP NUMBERS for Give page ─── */
  (function() {
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function countUp(el, target, suffix, duration) {
      duration = duration || 1400;
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      var start = Date.now();
      (function tick() {
        var elapsed = Date.now() - start;
        var progress = Math.min(elapsed / duration, 1);
        el.textContent = Math.round(easeOut(progress) * target) + (suffix || '');
        if (progress < 1) requestAnimationFrame(tick);
      })();
    }

    /* Add impact stats section to Give page if not present */
    window.addEventListener('DOMContentLoaded', function() {
      var giveLeft = document.querySelector('.give-left');
      if (!giveLeft || document.getElementById('give-impact-stats')) return;

      var statsHtml = '<div id="give-impact-stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap: 4px;margin-top: 32px;">' +
        '<div class="give-impact-block" style="background:var(--parchment);padding: 24px 16px;">' +
          '<div class="count-up-el" data-target="62" data-suffix="+" style="font-size:clamp(32px, 4.6vw, 61px);font-weight:300;color:var(--forest);line-height:1;letter-spacing: -0.02em;margin-bottom: 8px;">62+</div>' +
          '<div style="font-size: 12px;font-family:\'Space Mono\',monospace;letter-spacing: 0.1em;text-transform:uppercase;color:var(--text-light);">Families served</div>' +
        '</div>' +
        '<div class="give-impact-block" style="background:var(--parchment);padding: 24px 16px;">' +
          '<div class="count-up-el" data-target="4" data-suffix=" nations" style="font-size:clamp(32px, 4.6vw, 61px);font-weight:300;color:var(--forest);line-height:1;letter-spacing: -0.02em;margin-bottom: 8px;">4 nations</div>' +
          '<div style="font-size: 12px;font-family:\'Space Mono\',monospace;letter-spacing: 0.1em;text-transform:uppercase;color:var(--text-light);">Global partnerships</div>' +
        '</div>' +
        '<div class="give-impact-block" style="background:var(--parchment);padding: 24px 16px;">' +
          '<div class="count-up-el" data-target="1" data-suffix=" college" style="font-size:clamp(32px, 4.6vw, 61px);font-weight:300;color:var(--forest);line-height:1;letter-spacing: -0.02em;margin-bottom: 8px;">1 college</div>' +
          '<div style="font-size: 12px;font-family:\'Space Mono\',monospace;letter-spacing: 0.1em;text-transform:uppercase;color:var(--text-light);">Planted in Yakima</div>' +
        '</div>' +
      '</div>';
      giveLeft.insertAdjacentHTML('beforeend', statsHtml);

      /* Observe the stats container */
      var statsObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll('.count-up-el').forEach(function(el) {
            var target = parseInt(el.dataset.target, 10);
            var suffix = el.dataset.suffix || '';
            countUp(el, target, suffix, 1200);
          });
          statsObs.unobserve(entry.target);
        });
      }, { threshold: 0.3 });

      statsObs.observe(document.getElementById('give-impact-stats'));
    });
  })();

  /* ─── 9. PARALLAX CSS VAR — wire to home-hero::before ─── */
  /* (Injects via CSS custom property set on the section itself) */

  /* ─── 10. MANIFESTO SCROLL-LIGHT ─── */
  (function() {
    var lines = document.querySelectorAll('.manifesto-line');
    if (!lines.length) return;

    /* ── GSAP scrub path: each line gets its own ScrollTrigger ── */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      /* Remove the CSS transition so GSAP drives opacity/transform directly */
      /* Emphasis, not visibility. The resting colour is whatever the
         stylesheet already set (--on-dark-3, 4.95:1) and we only brighten
         to white. Do NOT set a dim state here: it used to start every line
         at rgba(255,255,255,.10), which made the copy invisible until the
         scrub ran — and lines low in the section never finished, so the
         bottom of the creed stayed unreadable no matter how you scrolled. */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      lines.forEach(function(line) {
        gsap.to(line, {
          color: '#FFFFFF',
          ease: 'none',
          scrollTrigger: {
            trigger: line,
            start: 'top 85%',
            end:   'top 55%',
            scrub: 0.6
          }
        });
      });

    } else {
      /* ── Fallback: IntersectionObserver binary toggle ── */
      var manifObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('lit');
          } else {
            var rect = entry.target.getBoundingClientRect();
            if (rect.top > 0) entry.target.classList.remove('lit');
          }
        });
      }, { threshold: 0, rootMargin: '-28% 0px -28% 0px' });

      lines.forEach(function(line) { manifObs.observe(line); });
    }
  })();

})(); /* end creative engine */

/* ─── PATHWAY WHEEL ─── */
(function(){
  var STAGES = [
    { n:'01', name:'Begin',      verb:'The church receives',  ref:'Acts 2:41',
      lede:'Respond to Jesus, be known by name, and be baptized.',
      cta:'Get baptized', href:'#ns-begin',
      pts:['Understand the gospel and respond in faith','Be personally known, celebrated, and prayed for','Be connected to someone who helps you start'] },
    { n:'02', name:'Belong',     verb:'The church shepherds', ref:'Acts 2:42',
      lede:'Be rooted in a community that knows your name.',
      cta:'Join a Life Group', href:'#ns-belong',
      pts:['Gather consistently with the church','Belong to a Life Group where you are known','Commit through membership'] },
    { n:'03', name:'Contribute', verb:'The church equips',    ref:'Ephesians 4:12',
      lede:'Use what God entrusted to you to build up the body.',
      cta:'Start serving', href:'#ns-contribute',
      pts:['Identify and develop your spiritual gifts','Serve where your gifting fits','Receive coaching and take responsibility'] },
    { n:'04', name:'Multiply',   verb:'The church sends',     ref:'Matthew 28:19–20',
      lede:'Help someone else follow Jesus — and go where you are sent.',
      cta:'Be commissioned', href:'#ns-commissioning',
      pts:['See everyday life as Kingdom mission','Share the gospel and your story','Disciple another person who will do the same'] }
  ];
  var sec = document.querySelector('.pw-wheel-sec');
  if (!sec) return;
  var arcs = sec.querySelectorAll('.pw-set'),
      lbls = sec.querySelectorAll('.pw-set-lbl'),
      rings = sec.querySelectorAll('.pw-ring'),
      tabs = sec.querySelectorAll('.pw-tab'),
      hubN = sec.querySelector('.pw-hub-n'), hubT = sec.querySelector('.pw-hub-t'), hubS = sec.querySelector('.pw-hub-s'),
      pNum = sec.querySelector('.pw-panel-num'), pVerb = sec.querySelector('.pw-panel-verb'),
      pTitle = sec.querySelector('.pw-panel-title'), pLede = sec.querySelector('.pw-panel-lede'),
      pList = sec.querySelector('.pw-panel-list'), pCta = sec.querySelector('.pw-panel-cta'),
      pRef = sec.querySelector('.pw-panel-ref'), cur = -1;

  function show(i){
    if (i === cur) return; cur = i;
    var s = STAGES[i];
    arcs.forEach(function(a,k){ a.classList.toggle('is-on', k===i); });
    lbls.forEach(function(a,k){ a.classList.toggle('is-on', k===i); });
    rings.forEach(function(a,k){ a.classList.toggle('is-on', k===i); });
    tabs.forEach(function(a,k){ a.classList.toggle('is-on', k===i); a.setAttribute('aria-selected', k===i); });
    /* The hub trio is vestigial. An earlier version of this wheel had a centre
       hub that retitled itself per stage; the Venn redesign replaced it with a
       static .pw-core / .pw-core-t ("one life") and dropped .pw-hub-n/-t/-s
       from the markup — but not from here. So show(0) threw on every single
       page load, which meant the wire() handlers were registered and then the
       initial show(0) died: no stage highlighted, and the whole right-hand
       panel (number, verb, title, lede, list, CTA, reference) stayed at
       whatever the HTML hardcoded. The component has been dead in production,
       independent of the CDN. Write the hub only if it is actually there. */
    if (hubN) hubN.textContent = s.n;
    if (hubT) hubT.textContent = s.name;
    if (hubS) hubS.textContent = s.verb;
    pNum.textContent = s.n; pVerb.textContent = s.verb;
    pTitle.textContent = s.name; pLede.textContent = s.lede;
    pCta.textContent = s.cta; pCta.setAttribute('href', s.href); pRef.textContent = s.ref;
    pList.innerHTML = '';
    s.pts.forEach(function(t){ var li = document.createElement('li'); li.textContent = t; pList.appendChild(li); });
  }
  function wire(nodes){
    nodes.forEach(function(el){
      var i = parseInt(el.getAttribute('data-s'), 10);
      el.addEventListener('click', function(){ show(i); });
      el.addEventListener('mouseenter', function(){ show(i); });
    });
  }
  wire(arcs); wire(lbls); wire(tabs);
  show(0);
})();




/* ══════════════════════════════════════════ */


