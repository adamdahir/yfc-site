/* ══════════════════════════════════════════════════════════════════════
   SITE EDITOR

   Add ?edit to any URL. Point at anything on the page and click it. The
   panel then edits that exact thing: its words, its type, its colour, its
   spacing, and the picture if it is one.

   Nothing is written anywhere while you work. Changes live in the browser
   until you press Export, which hands back the CSS to paste and, when the
   page is served over http, a rebuilt index.html to drop in.

   Held deliberately dependency-free and in one file, like the rest of this
   site, so it stays maintainable by whoever comes next.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  if (!/(^|[?&])edit\b/.test(location.search)) return;

  var ROOT = document.documentElement;
  var FILE_MODE = location.protocol === 'file:';

  /* Anything belonging to the editor itself is never selectable. */
  function mine(n) { return !!(n && n.closest && n.closest('#yfc-ed, #yfc-hl, #yfc-tip')); }

  /* ── what can be edited ──────────────────────────────────────────────
     Only properties a person would actually reach for. Each carries the
     unit handling and the control type, so the panel builds itself. */
  var PROPS = [
    { g: 'Type' },
    { p: 'fontSize',      c: 'font-size',      l: 'Size',        t: 'px', min: 9,   max: 96,  step: 1 },
    { p: 'fontWeight',    c: 'font-weight',    l: 'Weight',      t: 'range', min: 300, max: 800, step: 100 },
    { p: 'letterSpacing', c: 'letter-spacing', l: 'Tracking',    t: 'em', min: -0.06, max: 0.3, step: 0.005 },
    { p: 'lineHeight',    c: 'line-height',    l: 'Line height', t: 'num', min: 0.85, max: 2.2, step: 0.01 },
    { p: 'textTransform', c: 'text-transform', l: 'Case',        t: 'select',
      opts: [['As written', 'none'], ['ALL CAPS', 'uppercase'], ['Small caps', 'lowercase']] },
    { p: 'fontFamily',    c: 'font-family',    l: 'Font',        t: 'select', opts: [
        ['Inter (sans)',         "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"],
        ['Adobe Jenson (serif)', "'adobe-jenson-pro-caption', 'adobe-jenson-pro', Georgia, serif"],
        ['Georgia (serif)',      "Georgia, 'Times New Roman', serif"] ] },
    { p: 'textAlign',     c: 'text-align',     l: 'Align',       t: 'select',
      opts: [['Left', 'left'], ['Centre', 'center'], ['Right', 'right']] },

    { g: 'Colour' },
    { p: 'color',           c: 'color',            l: 'Text',       t: 'color' },
    { p: 'backgroundColor', c: 'background-color', l: 'Background', t: 'color' },

    { g: 'Spacing' },
    { p: 'paddingTop',    c: 'padding-top',    l: 'Space above', t: 'px', min: 0, max: 220, step: 2 },
    { p: 'paddingBottom', c: 'padding-bottom', l: 'Space below', t: 'px', min: 0, max: 220, step: 2 },
    { p: 'borderRadius',  c: 'border-radius',  l: 'Corners',     t: 'px', min: 0, max: 40,  step: 1 }
  ];

  var edits = {};      /* selector -> { 'css-prop': value } */
  var texts = [];      /* { path, before, after } */
  var images = [];     /* { path, was, file } */
  var sel = null;      /* selected element */
  var armed = true;

  /* ── a selector we can write into a stylesheet, and find again ─────── */
  function pathOf(node) {
    if (node.id) return '#' + node.id;
    var parts = [];
    while (node && node.nodeType === 1 && node !== document.body) {
      var seg = node.tagName.toLowerCase();
      if (node.id) { parts.unshift('#' + node.id); break; }
      var cls = (node.getAttribute('class') || '').trim().split(/\s+/)
        .filter(function (c) { return c && !/^(active|is-|pw-|goo-|yfc-ed)/.test(c); })[0];
      if (cls) seg += '.' + cls;
      var par = node.parentElement;
      if (par) {
        var same = [].filter.call(par.children, function (k) { return k.tagName === node.tagName; });
        if (same.length > 1) seg += ':nth-of-type(' + (same.indexOf(node) + 1) + ')';
      }
      parts.unshift(seg);
      node = par;
    }
    return parts.join(' > ');
  }

  function label(node) {
    var t = node.tagName.toLowerCase();
    var c = (node.getAttribute('class') || '').trim().split(/\s+/)[0];
    return t + (c ? '.' + c : '');
  }

  /* Text elements are ones whose own child text is the point of them. */
  function ownText(node) {
    return [].filter.call(node.childNodes, function (n) { return n.nodeType === 3; })
             .map(function (n) { return n.textContent; }).join('').trim();
  }
  /* How many separate runs of the element's own text there are. More than
     one means the text is wrapped around a child element — "We are part of
     the <a>ICFG</a>, a movement of 90,000 churches" is two runs either side
     of a link. Collapsing those into one box would silently move the words
     to one side of the link and delete the other side, so those are refused
     rather than edited. */
  function runs(node) {
    return [].filter.call(node.childNodes, function (n) {
      return n.nodeType === 3 && n.textContent.trim(); }).length;
  }
  /* Headings on this site break their lines with <br>, which makes them
     multi-run. That is not the dangerous case: when every element child is
     a <br>, the text is simply several lines with nothing else woven in, so
     it can be edited as a small block and rebuilt line by line. Only text
     wrapped around a link or a <span> is genuinely unsafe. */
  function brOnly(node) {
    var els = [].filter.call(node.childNodes, function (n) { return n.nodeType === 1; });
    return els.length > 0 && els.every(function (e) { return e.tagName === 'BR'; });
  }
  function editable(node) { return runs(node) === 1 || brOnly(node); }
  function linesOf(node) {
    var out = [''], i = 0;
    [].forEach.call(node.childNodes, function (n) {
      if (n.nodeType === 3) out[i] += n.textContent;
      else if (n.nodeType === 1 && n.tagName === 'BR') { out[++i] = ''; }
    });
    return out.map(function (l) { return l.trim(); }).filter(function (l, k, a) {
      return l || k < a.length - 1; }).join('\n');
  }
  function esc(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function writeLines(node, value) {
    node.innerHTML = value.split('\n').map(esc).join('<br>');
  }
  function isTextish(node) {
    return ownText(node).length > 0 &&
           !/^(script|style|svg|path|option)$/i.test(node.tagName);
  }

  /* ── highlight + tooltip ─────────────────────────────────────────── */
  var hl = document.createElement('div'); hl.id = 'yfc-hl';
  var tip = document.createElement('div'); tip.id = 'yfc-tip';
  document.body.appendChild(hl); document.body.appendChild(tip);

  function frame(node, locked) {
    if (!node) { hl.style.display = 'none'; tip.style.display = 'none'; return; }
    var r = node.getBoundingClientRect();
    hl.style.cssText = 'position:fixed;pointer-events:none;z-index:99997;left:' + r.left + 'px;top:' + r.top +
      'px;width:' + r.width + 'px;height:' + r.height + 'px;border:2px solid ' +
      (locked ? '#D08F4C' : 'rgba(208,143,76,.6)') + ';border-radius:3px;display:block;' +
      (locked ? 'box-shadow:0 0 0 9999px rgba(0,0,0,.06);' : '');
    tip.style.cssText = 'position:fixed;z-index:99998;left:' + r.left + 'px;top:' + Math.max(2, r.top - 21) +
      'px;background:#D08F4C;color:#16130F;font:600 10px/1.6 -apple-system,sans-serif;padding:1px 6px;' +
      'border-radius:3px;pointer-events:none;letter-spacing:.06em;display:block;';
    tip.textContent = label(node);
  }

  document.addEventListener('mousemove', function (e) {
    if (!armed || sel || mine(e.target)) return;
    frame(e.target, false);
  }, true);

  document.addEventListener('click', function (e) {
    if (!armed || mine(e.target)) return;
    if (e.metaKey || e.ctrlKey) return;      /* Cmd-click to use the site normally */
    e.preventDefault(); e.stopPropagation();
    pick(e.target);
  }, true);

  window.addEventListener('scroll', function () { if (sel) frame(sel, true); }, true);
  window.addEventListener('resize', function () { if (sel) frame(sel, true); });

  /* ── panel ───────────────────────────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    '#yfc-ed{position:fixed;right:14px;top:14px;z-index:99999;width:302px;max-height:calc(100vh - 28px);',
      'overflow:auto;background:#16130F;color:#F2EEE5;border:1px solid #3A2A1D;border-radius:12px;',
      'font:13px/1.45 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 16px 50px rgba(0,0,0,.55);}',
    '#yfc-ed header{padding:11px 13px;border-bottom:1px solid #3A2A1D;position:sticky;top:0;background:#16130F;z-index:3;}',
    '#yfc-ed .ttl{display:flex;align-items:center;gap:8px;}',
    '#yfc-ed .ttl b{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#DDCDAC;flex:1;}',
    '#yfc-ed .x{background:none;border:0;color:#8E8474;cursor:pointer;font-size:17px;padding:0 3px;}',
    '#yfc-ed .sel{margin-top:8px;background:#241E17;border:1px solid #3A2A1D;border-radius:7px;padding:7px 9px;',
      'font:600 11px/1.4 ui-monospace,Menlo,monospace;color:#D08F4C;word-break:break-all;}',
    '#yfc-ed .hint{margin-top:6px;font-size:11px;color:#8E8474;}',
    '#yfc-ed .grp{padding:11px 13px 3px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8E8474;}',
    '#yfc-ed .row{padding:4px 13px 8px;}',
    '#yfc-ed label{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#BCB1A0;margin-bottom:3px;}',
    '#yfc-ed label i{font-style:normal;color:#D08F4C;font-variant-numeric:tabular-nums;}',
    '#yfc-ed label i.set::after{content:" •";color:#7FBE92;}',
    '#yfc-ed input[type=range]{width:100%;accent-color:#D08F4C;}',
    '#yfc-ed select,#yfc-ed input[type=color],#yfc-ed textarea.txt{width:100%;background:#241E17;color:#F2EEE5;',
      'border:1px solid #3A2A1D;border-radius:6px;padding:6px;font:12px inherit;}',
    '#yfc-ed input[type=color]{height:30px;padding:2px;}',
    '#yfc-ed textarea.txt{min-height:74px;resize:vertical;line-height:1.4;}',
    '#yfc-ed footer{position:sticky;bottom:0;background:#16130F;border-top:1px solid #3A2A1D;padding:9px 13px;',
      'display:flex;gap:7px;flex-wrap:wrap;}',
    '#yfc-ed button.act{flex:1;background:#8F521E;color:#fff;border:0;border-radius:7px;padding:8px;font:600 12px inherit;cursor:pointer;}',
    '#yfc-ed button.ghost{background:none;border:1px solid #3A2A1D;color:#BCB1A0;border-radius:7px;padding:8px 9px;font:600 12px inherit;cursor:pointer;}',
    '#yfc-ed .warn{margin:0 13px 9px;padding:8px 10px;background:#2C1A18;border-left:3px solid #E09189;',
      'border-radius:0 6px 6px 0;font-size:11px;color:#E0B5AF;}',
    '#yfc-ed textarea.sink{position:absolute;left:-9999px;}'
  ].join('');
  document.head.appendChild(css);

  var box = document.createElement('div');
  box.id = 'yfc-ed';
  box.innerHTML =
    '<header><div class="ttl"><b>Site editor</b><button class="x" title="Close (Esc)">&times;</button></div>' +
    '<div class="sel" id="yfc-sel">Click anything on the page</div>' +
    '<div class="hint">Cmd-click to use the site normally. Esc to deselect.</div></header>' +
    (FILE_MODE ? '<div class="warn"><b>Opened as a file.</b> Design changes and Copy CSS work. ' +
       'Rebuilding index.html needs the page served over http — see the note after Export.</div>' : '') +
    '<div class="body" id="yfc-body"></div>' +
    '<footer><button class="act" data-a="export">Export</button>' +
    '<button class="ghost" data-a="clear">Clear</button>' +
    '<button class="ghost" data-a="pause">Pause</button></footer>' +
    '<textarea class="sink"></textarea>';
  document.body.appendChild(box);
  var body = box.querySelector('#yfc-body');
  var sink = box.querySelector('textarea.sink');
  var selBar = box.querySelector('#yfc-sel');

  function num(v) { return parseFloat(v) || 0; }
  function show(f, v) {
    return f.t === 'px' ? Math.round(num(v)) + 'px'
         : f.t === 'em' ? num(v).toFixed(3) + 'em'
         : f.t === 'num' ? num(v).toFixed(2)
         : f.t === 'range' ? String(Math.round(num(v))) : '';
  }
  function toCss(f, raw) {
    return f.t === 'px' ? num(raw) + 'px' : f.t === 'em' ? num(raw) + 'em' : String(raw);
  }
  function hex(rgb) {
    var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb || '');
    if (!m) return '#000000';
    return '#' + [1, 2, 3].map(function (i) {
      return ('0' + (+m[i]).toString(16)).slice(-2); }).join('');
  }

  function pick(node) {
    sel = node;
    frame(sel, true);
    selBar.textContent = pathOf(sel);
    render();
  }

  function render() {
    body.innerHTML = '';
    if (!sel) { body.innerHTML = '<div class="hint" style="padding:14px 13px">Nothing selected.</div>'; return; }
    var cs = getComputedStyle(sel);
    var key = pathOf(sel);
    var frag = '';

    /* words */
    if (isTextish(sel) && editable(sel)) {
      frag += '<div class="grp">Words</div><div class="row">' +
              '<textarea class="txt" id="yfc-txt"></textarea></div>';
    } else if (isTextish(sel)) {
      frag += '<div class="grp">Words</div><div class="warn" style="margin:0 13px 9px">' +
              'This text wraps around a link or other tag inside it. Editing it here would ' +
              'move the words to one side and drop the rest, so it is locked. Design changes ' +
              'below still work.</div>';
    }
    /* picture */
    if (sel.tagName === 'IMG') {
      frag += '<div class="grp">Picture</div><div class="row">' +
              '<input type="file" id="yfc-img" accept="image/*" style="width:100%;font-size:11px;color:#BCB1A0">' +
              '<div class="hint" id="yfc-imgnote">Choose a file to preview it here.</div></div>';
    }
    PROPS.forEach(function (f, i) {
      if (f.g) { frag += '<div class="grp">' + f.g + '</div>'; return; }
      frag += '<div class="row" data-i="' + i + '"><label>' + f.l + '<i></i></label>';
      if (f.t === 'select') {
        frag += '<select>' + f.opts.map(function (o) {
          return '<option value="' + o[1].replace(/"/g, '&quot;') + '">' + o[0] + '</option>'; }).join('') + '</select>';
      } else if (f.t === 'color') {
        frag += '<input type="color">';
      } else {
        frag += '<input type="range" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '">';
      }
      frag += '</div>';
    });
    body.innerHTML = frag;

    var ta = body.querySelector('#yfc-txt');
    if (ta) {
      var multi = brOnly(sel);
      ta.value = multi ? linesOf(sel) : ownText(sel);
      ta.addEventListener('input', function () {
        var before = multi ? linesOf(sel) : ownText(sel);
        /* replace the element's own text nodes with the new value */
        if (multi) writeLines(sel, ta.value);
        else {
          /* Exactly one run, guaranteed above, so this replaces it in place
             and cannot disturb sibling markup. */
          [].forEach.call(sel.childNodes, function (n) {
            if (n.nodeType === 3 && n.textContent.trim()) n.textContent = ta.value;
          });
        }
        var rec = texts.filter(function (t) { return t.path === key; })[0];
        if (rec) rec.after = ta.value;
        else texts.push({ path: key, before: before, after: ta.value });
        frame(sel, true);
      });
    }

    var fi = body.querySelector('#yfc-img');
    if (fi) fi.addEventListener('change', function () {
      var f = fi.files && fi.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var was = sel.getAttribute('src');
      sel.setAttribute('src', url);
      sel.removeAttribute('srcset');
      var pic = sel.closest('picture');
      if (pic) [].forEach.call(pic.querySelectorAll('source'), function (s) { s.remove(); });
      images.push({ path: key, was: was, file: f.name });
      body.querySelector('#yfc-imgnote').textContent =
        'Previewing ' + f.name + '. On export you will be told where to copy it.';
      frame(sel, true);
    });

    body.querySelectorAll('.row[data-i]').forEach(function (row) {
      var f = PROPS[+row.dataset.i];
      var input = row.querySelector('input,select');
      var tag = row.querySelector('label i');
      var own = edits[key] && edits[key][f.c];
      var cur = own || cs[f.p];

      if (f.t === 'color') { input.value = hex(cur); tag.textContent = hex(cur); }
      else if (f.t === 'select') {
        var m = [].slice.call(input.options).filter(function (o) {
          return o.value.replace(/\s+/g, '') === String(cur).replace(/\s+/g, ''); })[0];
        if (m) input.value = m.value;
      } else { input.value = num(cur); tag.textContent = show(f, cur); }
      if (own) tag.classList.add('set');

      input.addEventListener('input', function () {
        var v = toCss(f, input.value);
        sel.style.setProperty(f.c, v);
        (edits[key] = edits[key] || {})[f.c] = v;
        tag.textContent = (f.t === 'color' || f.t === 'select') ? input.value : show(f, input.value);
        tag.classList.add('set');
        frame(sel, true);
      });
    });
  }

  /* ── export ──────────────────────────────────────────────────────── */
  function cssOut() {
    var out = '';
    Object.keys(edits).forEach(function (k) {
      var props = edits[k];
      if (!Object.keys(props).length) return;
      out += k + ' {\n' + Object.keys(props).map(function (p) {
        return '  ' + p + ': ' + props[p] + ';'; }).join('\n') + '\n}\n\n';
    });
    return out || '/* no design changes yet */\n';
  }

  function report() {
    var lines = [];
    if (texts.length) {
      lines.push('/* ' + texts.length + ' text change' + (texts.length > 1 ? 's' : '') + ' — applied to index.html on export');
      texts.forEach(function (t) {
        lines.push('   ' + t.path + '\n     was: ' + t.before.slice(0, 70) + '\n     now: ' + t.after.slice(0, 70));
      });
      lines.push('*/\n');
    }
    if (images.length) {
      lines.push('/* pictures — copy these files into assets/ then rebuild');
      images.forEach(function (i) { lines.push('   ' + i.file + '  ->  replaces ' + i.was); });
      lines.push('*/\n');
    }
    return lines.join('\n');
  }

  function download(name, text) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/html' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }

  function exportAll() {
    var block = report() + cssOut();
    sink.value = block; sink.select();
    try { document.execCommand('copy'); } catch (e) {}
    if (navigator.clipboard) navigator.clipboard.writeText(block).catch(function () {});
    flash('CSS copied');

    if (!texts.length && !images.length) return;
    if (FILE_MODE) {
      alert('CSS is on your clipboard — paste it at the end of styles.css.\n\n' +
            'To also rebuild index.html with your text changes, serve the folder first:\n\n' +
            '  cd ~/Downloads/yfc-site/dist\n  python3 -m http.server 8080\n\n' +
            'then open  http://localhost:8080/?edit  and press Export again.');
      return;
    }
    /* Patch a clean copy of the source rather than serialising the live DOM,
       which by now carries injected SVGs, runtime classes and inline styles. */
    fetch('index.html', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (src) {
      var doc = new DOMParser().parseFromString(src, 'text/html');
      var ok = 0, miss = [];
      texts.forEach(function (t) {
        var node;
        try { node = doc.querySelector(t.path); } catch (e) { node = null; }
        if (!node) { miss.push(t.path + ' (not found)'); return; }
        /* Refuse unless the source still reads exactly as it did when the
           edit was made. Anything else means the file moved under us, and a
           blind write would corrupt it. */
        var multiSrc = brOnly(node);
        var cur = multiSrc ? linesOf(node)
                           : [].filter.call(node.childNodes, function (n) {
                               return n.nodeType === 3 && n.textContent.trim(); })
                             .map(function (n) { return n.textContent.trim(); }).join('');
        if (!multiSrc && runs(node) !== 1) { miss.push(t.path + ' (markup changed)'); return; }
        if (cur.trim() !== t.before.trim()) {
          miss.push(t.path + ' (text changed in the file)'); return; }
        if (multiSrc) node.innerHTML = t.after.split('\n').map(esc).join('<br>');
        else [].forEach.call(node.childNodes, function (n) {
          if (n.nodeType === 3 && n.textContent.trim()) n.textContent = t.after; });
        ok++;
      });
      download('index.html', '<!DOCTYPE html>\n' + doc.documentElement.outerHTML);
      alert('Downloaded index.html with ' + ok + ' of ' + texts.length + ' text change' +
            (texts.length > 1 ? 's' : '') + '.' +
            (miss.length ? '\n\nSkipped, because the page changed under them:\n' + miss.join('\n') : '') +
            '\n\nReplace ~/Downloads/yfc-site/index.html with it, then run: bash build.sh' +
            (images.length ? '\n\nAlso copy your picture files into assets/.' : ''));
    }).catch(function () {
      alert('Could not read index.html to patch it. The CSS is still on your clipboard.');
    });
  }

  function flash(msg) {
    var b = box.querySelector('button.act'), old = b.textContent;
    b.textContent = msg; setTimeout(function () { b.textContent = old; }, 1400);
  }

  box.addEventListener('click', function (e) {
    if (e.target.classList.contains('x')) { teardown(); return; }
    var a = e.target.dataset && e.target.dataset.a;
    if (a === 'export') exportAll();
    if (a === 'pause') {
      armed = !armed;
      e.target.textContent = armed ? 'Pause' : 'Resume';
      if (!armed) { sel = null; frame(null); render(); }
    }
    if (a === 'clear' && sel) {
      var key = pathOf(sel);
      if (edits[key]) { Object.keys(edits[key]).forEach(function (p) { sel.style.removeProperty(p); });
                        delete edits[key]; }
      render(); flash('Cleared');
    }
  });

  function teardown() { box.remove(); css.remove(); hl.remove(); tip.remove(); }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (sel) { sel = null; frame(null); selBar.textContent = 'Click anything on the page'; render(); }
    else teardown();
  });

  render();
})();
