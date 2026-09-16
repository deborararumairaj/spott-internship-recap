/* ══════════════════════════════════════════════════
   Debora the intern — Spott internship recap
   ══════════════════════════════════════════════════ */

/* Everything lives inside this closure. Nothing here — not CONFIG, not
   enterSite — is reachable from the console, so the gate can't be waved
   through by typing its name at a devtools prompt. */
(() => {
'use strict';

const CONFIG = {
  /* ┌──────────────────────────────────────────────────────┐
     │  false = no countdown, no passcode, site just opens. │
     │  Flip to true to put the gate back for launch day.   │
     └──────────────────────────────────────────────────────┘ */
  gateEnabled: true,

  /* The one moment, same for everyone.
     Wed 16 Sep 2026, 18:30 Brussels (CEST = UTC+2) → 16:30 UTC.
     Change this one line to move the unlock.                     */
  unlockAt: '2026-09-16T16:30:00Z',

  /* The codes themselves are NOT in this file. These are SHA-256 of the
     normalised codes, so reading the source doesn't hand them over.
     Matching stays forgiving: case, spaces and punctuation are all
     ignored before hashing — so the @ and the dash are optional.
     To add one: sha256(code.toLowerCase().replace(/[^a-z0-9]/g,''))

       [0] the front door — the code everyone is given
       [1] Debora's own, for getting in before the clock runs out      */
  codeHashes: [
    '6cc4edfa71ce6c0ab0b4869fcfe31269e87359529297a68026755f1b655e5d97',
    '50e6ce81c4a0a7dfd8b032f795f5916c8d32ec6e96f9961cff7136578422ce5c',
  ],
};

/* ─────────── tiny helpers ─────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const softMatch = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const sha256Hex = async (s) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
};
const isGoodCode = async (raw) => {
  const norm = softMatch(raw);
  if (!norm) return false;
  return CONFIG.codeHashes.includes(await sha256Hex(norm));
};

/* ══════════════════════════════════════════════════
   1. THE GATE
   ══════════════════════════════════════════════════ */

const gate      = $('#gate');
const panelPass = $('#gate-passcode');
const unlockTs  = new Date(CONFIG.unlockAt).getTime();

function renderWhen() {
  const d = new Date(unlockTs);
  const opts = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
  let local;
  try { local = d.toLocaleString(undefined, opts); } catch { local = d.toString(); }
  $('#gate-when').textContent = `${local} — the minute my internship officially ends`;
}

const WRONG = [
  "that's not it. try again.",
  "nope. it's three words.",
  "close, probably. but no.",
  "incorrect, and slightly hurtful.",
  "still no. ask whoever sent you this.",
];
let wrongIdx = 0;

$('#pass-form').addEventListener('submit', async e => {
  e.preventDefault();
  const input = $('#pass-input');
  if (await isGoodCode(input.value)) return enterSite();
  $('#pass-error').textContent = WRONG[wrongIdx++ % WRONG.length];
  panelPass.classList.remove('shake');
  void panelPass.offsetWidth;
  panelPass.classList.add('shake');
  input.select();
});

/* ─────────── entering ─────────── */
function wireAudio(autoplay) {
  const audio  = $('#intro-audio');
  const toggle = $('#sound-toggle');
  const label  = $('.st-label', toggle);

  const setState = (muted, text) => {
    toggle.classList.toggle('is-muted', muted);
    label.textContent = text;
  };

  toggle.hidden = false;
  if (autoplay) {
    audio.play()
      .then(() => setState(false, 'sound on'))
      .catch(() => setState(true, 'play audio'));   // browser blocked it; offer the button
  } else {
    setState(true, 'play audio');
  }

  toggle.addEventListener('click', () => {
    if (audio.paused) { audio.play().catch(() => {}); setState(false, 'sound on'); }
    else              { audio.pause();                setState(true,  'sound off'); }
  });
  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    setState(true, 'replay');
  });
}

function revealSite(autoplayAudio) {
  document.body.classList.remove('is-locked');
  $('#site').hidden = false;
  wireAudio(autoplayAudio);
  buildWeeks();
  observeAll();
}

function enterSite() {
  gate.classList.add('is-gone');
  setTimeout(() => gate.remove(), 900);
  revealSite(true);
}

/* ══════════════════════════════════════════════════
   2. THE WEEKS
   ══════════════════════════════════════════════════ */

/* Little mock-ups of the things I actually typed into.
   Each question renders as the real composer it was typed in. */
const MARKS = {
  google: `<svg class="m-g" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`,
  mic: `<svg class="m-i" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3z"/><path fill="#34A853" d="M18 12a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93V22h2v-2.07A8 8 0 0 0 20 12h-2z"/></svg>`,
  lens: `<svg class="m-i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="#EA4335"/><path fill="#4285F4" d="M4 4h5v2H6v3H4V4zm11 0h5v5h-2V6h-3V4zM4 15h2v3h3v2H4v-5zm14 0h2v5h-5v-2h3v-3z"/></svg>`,
  claude: `<svg class="m-c" viewBox="0 0 24 24" aria-hidden="true"><g stroke="#D97757" stroke-width="2.2" stroke-linecap="round"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/></g></svg>`,
  send: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`,
};

function renderQ([src, text, mod]) {
  const punch = mod === 'punch' ? ' is-punch' : '';
  const t = `<span class="q-txt">${text}</span>`;

  switch (src) {
    case 'google':
      return `<div class="q q-google${punch}">
        ${MARKS.google}${t}
        <span class="g-icons">${MARKS.mic}${MARKS.lens}</span>
      </div>`;

    case 'chatgpt':
      return `<div class="q q-gpt${punch}">
        <div class="gpt-top"><span class="chip">ChatGPT 5 <span aria-hidden="true">▾</span></span></div>
        <div class="gpt-row">${t}<span class="gpt-send">${MARKS.send}</span></div>
      </div>`;

    case 'claude':
      return `<div class="q q-claude${punch}">
        <div class="cl-row">${MARKS.claude}${t}</div>
        <div class="cl-bottom"><span class="chip chip-cl">Claude Opus <span aria-hidden="true">▾</span></span><span class="cl-send">${MARKS.send}</span></div>
      </div>`;

    default: /* slack */
      return `<div class="q q-slack${punch}">
        <span class="sl-av" data-who="${src}" aria-hidden="true"></span>
        <div class="sl-body">
          <p class="sl-head"><b>${src === 'me' ? 'Debora' : 'Kevin'}</b><time>${src === 'me' ? '4:25 PM' : '1:49 PM'}</time></p>
          ${t}
        </div>
      </div>`;
  }
}

const WEEK1 = {
  title: 'Absolutely no idea what is happening',
  note: 'I was thrown in the deep end — but of course I also had a floaty (my Claude subscription), so it was all good.',
  qs: [
    ['google',  'what is a repository'],
    ['google',  'what is an ATS'],
    ['claude',  'explain what this company actually sells, like i am five'],
    ['claude',  'what does Kevin mean by <em>this</em>'],
    ['google',  'what is an API'],
    ['google',  'tech bro words i can use to sound like i know things'],
    ['chatgpt', 'how do i clone a repo'],
    ['google',  'what is a CRM'],
    ['chatgpt', 'what is a JSON file'],
    ['google',  'what does GTM stand for'],
    ['claude',  'is it normal to understand absolutely nothing on day three', 'punch'],
  ],
};

const WEEK2 = {
  title: "By now I'm a pro…",
  note: '…at both using Spott and Claude.',
  beats: [
    {
      img: 'assets/img/valuation.jpg',
      alt: 'Spott dashboard showing Total Revenue booked: €2,470,634,719.86',
      bub: 'blue',
      b: 'Single-handedly took our revenue to €2.4 billion',
      p: "Series B will end up coming sooner than you think. You're welcome.",
    },
    {
      img: 'assets/img/seat-upgraded.jpg',
      alt: 'Email: Your seat was upgraded — you now have more Claude usage',
      bub: 'pink',
      b: 'You can call me Deblaude now',
      p: "Claude is the personal assistant I can finally have on my payroll (well — Spott's, but who's checking right). The intern's intern ;)",
      aside: {
        b: 'I even had to take Claude to the doctor a few times',
        p: "Poor thing couldn't keep up with startup life.",
        shot: 'assets/img/claude-doctor.png',
        shotAlt: 'Terminal: Auto-update failed · Run claude doctor',
      },
    },
  ],
};

function weekHead(n, w) {
  return `<div class="wk-head">
    <div class="wk-head-in">
      <p class="week-num">Week ${n}</p>
      <h3 class="week-title">${w.title}</h3>
      <p class="week-note">${w.note}</p>
    </div>
  </div>`;
}

/* left %, width % — tuned so nothing collides and the eye keeps moving */
const SCATTER = [
  [ 3, 34], [54, 38], [24, 36], [62, 33],
  [ 5, 40], [39, 36], [66, 31], [13, 34],
  [46, 41], [ 2, 36], [35, 34], [57, 39],
];

function buildWeeks() {
  const root = $('#weeks-root');
  const frag = document.createDocumentFragment();

  /* week 1 — a field of questions coming at you from every side */
  const w1 = document.createElement('section');
  w1.className = 'wk wk-1';
  w1.innerHTML = `
    ${weekHead(1, WEEK1)}
    <div class="wrap wrap-wide">
      <div class="wk-field" style="--n:${WEEK1.qs.length}">${
        WEEK1.qs.map((q, i) => {
          const [x, w] = SCATTER[i % SCATTER.length];
          const y = 1 + i * (86 / (WEEK1.qs.length - 1));
          const rot = [-1.1, 1.3, -.6, .9][i % 4];
          return renderQ(q).replace('class="q ', `style="--x:${x}%;--w:${w}%;--y:${y}%;--rot:${rot}deg" class="q `);
        }).join('')
      }</div>
    </div>`;
  frag.appendChild(w1);

  /* week 2 — two moments, each with a bubble coming off the screenshot */
  const w2 = document.createElement('section');
  w2.className = 'wk wk-2';
  w2.innerHTML = `
    ${weekHead(2, WEEK2)}
    <div class="wrap">
      <div class="wk-beats">
        ${WEEK2.beats.map(x => `
          <div class="beat-wrap">
            <figure class="beat">
              <span class="beat-chrome" aria-hidden="true"><i></i><i></i><i></i></span>
              <img src="${x.img}" alt="${x.alt}" loading="lazy">
            </figure>
            <div class="bub bub-${x.bub} bub-up beat-bub"><b>${x.b}</b><span>${x.p}</span></div>
            ${x.aside ? `
              <div class="beat-aside">
                <div class="bub bub-yellow bub-up"><b>${x.aside.b}</b><span>${x.aside.p}</span></div>
                <figure class="aside-shot"><img src="${x.aside.shot}" alt="${x.aside.shotAlt}" loading="lazy"></figure>
              </div>` : ''}
          </div>`).join('')}
      </div>
    </div>`;
  frag.appendChild(w2);

  root.appendChild(frag);
}

/* ─────────── reveal on scroll ─────────── */
let asked = 0;
function observeAll() {
  const qObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.target.classList.contains('in')) return;
      e.target.classList.add('in');
      if (e.target.classList.contains('q')) {
        $('#qcount').textContent = ++asked;
      }
      qObs.unobserve(e.target);
    });
  }, { rootMargin: '-12% 0px -18% 0px' });

  $$('.beat-wrap, .bub-hero').forEach(el => qObs.observe(el));

  /* stat counters */
  const sObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      sObs.unobserve(el);
      if (target === 0) { el.textContent = '0'; return; }
      let cur = 0;
      const step = Math.max(1, Math.round(target / 24));
      const iv = setInterval(() => {
        cur = Math.min(target, cur + step);
        el.textContent = cur;
        if (cur >= target) clearInterval(iv);
      }, 34);
    });
  }, { threshold: .6 });
  $$('.stat-n').forEach(el => sObs.observe(el));

  wireQueries();
  wireStills();
  wireClips();
  wireMiss();
  wireReveal();
  wireBlur();
}

/* ─────────── what she'll miss ───────────
   There is exactly one right answer and it is all of them. Anything
   short of the full set gets told off and the picks stay put, so you
   can keep adding rather than starting over. */
const MISS_WRONG = [
  "Nope, you're wrong. Try again.",
  "Not even close. Try again.",
  "Wrong. There's more to it than that.",
  "Still wrong. Think bigger.",
];

function wireMiss() {
  const grid = $('#miss-grid');
  const btn = $('#miss-submit');
  const verdict = $('#miss-verdict');
  if (!grid || !btn || !verdict) return;

  const picks = $$('.miss-pick', grid);
  let wrongIdx = 0;

  picks.forEach(p => p.addEventListener('click', () => {
    const on = p.getAttribute('aria-pressed') === 'true';
    p.setAttribute('aria-pressed', String(!on));
    p.closest('.miss-item').classList.toggle('is-picked', !on);
    verdict.textContent = '';
    verdict.className = 'miss-verdict';
  }));

  btn.addEventListener('click', () => {
    const chosen = picks.filter(p => p.getAttribute('aria-pressed') === 'true').length;

    if (chosen === picks.length) {
      verdict.textContent = 'Correct. All of it. Obviously.';
      verdict.className = 'miss-verdict is-right';
      grid.classList.add('is-solved');
      btn.disabled = true;
      return;
    }

    verdict.textContent = MISS_WRONG[wrongIdx++ % MISS_WRONG.length];
    verdict.className = 'miss-verdict is-wrong';
    btn.classList.remove('shake');
    void btn.offsetWidth;
    btn.classList.add('shake');
  });
}

/* ─────────── the clips ───────────
   Every clip on the page autoplays itself: nothing is fetched until it
   scrolls into view, then it loads, loops and plays muted, and pauses
   again on the way out. Muted is not a style choice — no browser will
   autoplay a clip with sound. The controls are there to unmute.

   The before/after pair needs one extra thing. The two recordings are
   different lengths (27s of Notion against 37.5s of Mintlify), so left
   alone they drift and you end up comparing the start of one against
   the middle of the other. Each one's playbackRate is scaled so a full
   pass takes the same time either way, and they get nudged back into
   step as they run. Set SYNC_PAIR to false to let them run at their
   own natural speed. */
const SYNC_PAIR = true;

function wireClips() {
  const clips = $$('video.clip');
  if (!clips.length) return;

  const play = (v) => {
    if (!v.src) { v.src = v.dataset.src; v.preload = 'auto'; v.load(); }
    const p = v.play();
    if (p) p.catch(() => {});          // browser said no; the controls still work
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) play(e.target);
      else if (e.target.src) e.target.pause();
    });
  }, { threshold: .3 });

  clips.forEach(v => { v.muted = true; v.playbackRate = 1; obs.observe(v); });

  /* ── keep the before/after pair in lockstep ── */
  const pair = $$('.ba video.clip');
  if (!SYNC_PAIR || pair.length < 2) return;

  let ready = 0;
  pair.forEach(v => v.addEventListener('loadedmetadata', () => {
    if (++ready < pair.length) return;

    const cycle = Math.min(...pair.map(x => x.duration));
    pair.forEach(x => { x.playbackRate = x.duration / cycle; x.currentTime = 0; });

    /* started together; this stops them creeping apart over a long scroll */
    setInterval(() => {
      if (pair.some(x => x.paused || !x.duration)) return;
      const ref = pair[0].currentTime / pair[0].duration;
      pair.slice(1).forEach(x => {
        if (Math.abs(x.currentTime / x.duration - ref) > .1) x.currentTime = ref * x.duration;
      });
    }, 4000);
  }, { once: true }));
}

/* The welcome-video stills may not be in the folder yet — don't show a broken image. */
function wireStills() {
  /* the miss grid shows a dashed slot until each photo lands */
  $$('.miss-shot img').forEach(img => {
    const mark = () => img.closest('figure').classList.add('empty');
    if (img.complete && img.naturalWidth === 0) mark();
    img.addEventListener('error', mark);
  });

  /* the aside shot simply isn't there until the screenshot lands */
  $$('.aside-shot img').forEach(img => {
    const hide = () => img.closest('figure').hidden = true;
    if (img.complete && img.naturalWidth === 0) hide();
    img.addEventListener('error', hide);
  });

  $$('#stills img').forEach(img => {
    const mark = () => img.closest('figure').classList.add('empty');
    if (img.complete && img.naturalWidth === 0) mark();
    img.addEventListener('error', mark);
  });
}

/* ─────────── week 1: one query at a time, as you scroll ─────────── */
function wireQueries() {
  const qs = $$('.wk-field .q');
  if (!qs.length) return;

  let pending = false;
  const check = () => {
    pending = false;
    const line = window.innerHeight * 0.82;
    let left = false;
    for (const el of qs) {
      if (el.classList.contains('in')) continue;
      if (el.getBoundingClientRect().top < line) el.classList.add('in');
      else left = true;
    }
    if (!left) window.removeEventListener('scroll', onScroll);
  };
  const onScroll = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(check);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  check();
}

/* ─────────── "wondering how I got into Spott?" ─────────── */
function wireReveal() {
  const btn  = $('#reveal-btn');
  const body = $('#reveal-body');
  if (!btn || !body) return;
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    body.hidden = open;
    $('#reveal').classList.toggle('is-open', !open);
    if (!open) requestAnimationFrame(() => body.classList.add('in'));
  });
}

/* ─────────── weeks 3 → now, blurring past ─────────── */
const BLUR_SEQ = ['3', '4', '5', 'blink', 'now'];
function wireBlur() {
  const sec  = $('#blur');
  const word = $('#blur-word');
  const num  = $('#blur-num');
  const pre  = $('#blur-pre');
  const post = $('#blur-post');
  if (!sec) return;

  let last = -1;
  const onScroll = () => {
    const r = sec.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    if (span <= 0) return;
    const p = Math.min(1, Math.max(0, -r.top / span));

    /* the numbers rattle past quickly, then it holds on "now" */
    const i = Math.min(BLUR_SEQ.length - 1, Math.floor(Math.pow(p, .8) * BLUR_SEQ.length));
    if (i === last) return;
    last = i;

    const v = BLUR_SEQ[i];
    sec.classList.toggle('is-blink', v === 'blink');
    sec.classList.toggle('is-now',   v === 'now');

    if (v === 'blink') {
      word.textContent = '';
      num.textContent  = 'and I blinked';
      pre.textContent  = '';
      post.textContent = '';
    } else if (v === 'now') {
      word.textContent = '';
      num.textContent  = 'today';
      pre.textContent  = 'and suddenly it was';
      post.textContent = "…and it's the end.";
    } else {
      word.textContent = 'Week';
      num.textContent  = v;
      pre.textContent  = '';
      post.textContent = '';
    }
    num.classList.remove('tick'); void num.offsetWidth; num.classList.add('tick');
  };

window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ══════════════════════════════════════════════════
   3. BOOT
   Declared last so everything above it exists.
   ══════════════════════════════════════════════════ */

if (CONFIG.gateEnabled) {
  renderWhen();

  /* ?code=<code> walks straight in, for checking it on a phone. A code
     in a URL lands in history and referrers, so that link is hers. */
  const qs = new URLSearchParams(location.search);
  if (qs.has('code')) {
    isGoodCode(qs.get('code')).then(ok => { if (ok) enterSite(); });
  }
} else {
  gate.remove();
  revealSite(false);        // no gesture to autoplay off, so just offer the button
}

})();
