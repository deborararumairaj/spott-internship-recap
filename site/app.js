/* ══════════════════════════════════════════════════
   Debora the intern — Spott internship recap
   ══════════════════════════════════════════════════ */

const CONFIG = {
  /* ┌──────────────────────────────────────────────────────┐
     │  false = no countdown, no passcode, site just opens. │
     │  Flip to true to put the gate back for launch day.   │
     └──────────────────────────────────────────────────────┘ */
  gateEnabled: false,

  /* The one moment, same for everyone.
     Fri 18 Sep 2026, 17:00 Brussels (CEST = UTC+2) → 15:00 UTC.
     Change this one line to move the unlock.                     */
  unlockAt: '2026-09-18T15:00:00Z',

  /* Front-door passcode. Matching is forgiving: case, spaces
     and punctuation are all ignored.                             */
  passcode: 'debora the intern',

  /* PBKDF2 rounds for the personal codes. Must match tools/make-vault.mjs. */
  kdfIterations: 1000000,
};

/* ─────────── tiny helpers ─────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const softMatch = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const normCode  = s => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

/* ══════════════════════════════════════════════════
   1. THE GATE
   ══════════════════════════════════════════════════ */

const gate      = $('#gate');
const panelDown = $('#gate-countdown');
const panelPass = $('#gate-passcode');
const unlockTs  = new Date(CONFIG.unlockAt).getTime();

/* Playful "please wait" lines. Half of these are real Claude Code
   spinner words, which is the joke. */
const SPINNERS = [
  ['Tinkering…',        '(still thinking)'],
  ['Shenaniganing…',    '(17s · ↓ 550 tokens)'],
  ['Synthesizing…',     '(1m 34s · still thinking)'],
  ['Crunching…',        '(1h 18m 33s and counting)'],
  ['Building builds…',  '(in the background)'],
  ['Shipping…',         '(80% of it, anyway)'],
  ['Deploying…',        '(mid-flight)'],
  ['Percolating…',      '(do not refresh)'],
  ['Iterating…',        '(on the thing you are waiting for)'],
]

const PLEADS = [
  "Why the countdown? Because I am still finishing it. In the backend. Right now, probably.",
  "We are building the plane while flying it. You, of all people, know exactly what that means.",
  "Startup world is 80/20. You are currently waiting on the 20.",
  "I could have shipped it half-done. I did. That's what this screen is.",
  "This isn't loading. It's being written. The difference is me, typing.",
  "Somewhere in this file is an encrypted message with your name on it. It also isn't finished.",
  "You are early. That is a compliment and an inconvenience.",
  "Please wait. It's tinkering. It genuinely cannot be rushed.",
]

let spinIdx = 0, pleadIdx = 0;
function rotateFlavour() {
  const word = $('#spinner-word'), meta = $('#spinner-meta'), plead = $('#gate-plead');
  if (!word || !meta || !plead) return;          // gate is gone; nothing to rotate

  const [w, m] = SPINNERS[spinIdx++ % SPINNERS.length];
  word.textContent = w;
  meta.textContent = m;

  plead.style.opacity = '0';
  setTimeout(() => {
    if (!plead.isConnected) return;
    plead.textContent = PLEADS[pleadIdx++ % PLEADS.length];
    plead.style.opacity = '';
  }, 320);
}

function renderWhen() {
  const d = new Date(unlockTs);
  const opts = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
  let local;
  try { local = d.toLocaleString(undefined, opts); } catch { local = d.toString(); }
  $('#gate-when').textContent = `that's ${local}, your time`;
}

let gateTimer, flavourTimer;
function tickGate() {
  const left = unlockTs - Date.now();
  if (left <= 0) { clearInterval(gateTimer); showPasscode(); return; }
  const s = Math.floor(left / 1000);
  $('#cd-h').textContent = pad(Math.floor(s / 3600));   // total hours, no days column
  $('#cd-m').textContent = pad(Math.floor(s / 60) % 60);
  $('#cd-s').textContent = pad(s % 60);
}

function showPasscode() {
  panelDown.hidden = true;
  panelPass.hidden = false;
  setTimeout(() => $('#pass-input').focus(), 420);
}

const WRONG = [
  "that's not it. try again.",
  "nope. it's three words.",
  "close, probably. but no.",
  "incorrect, and slightly hurtful.",
  "still no. ask whoever sent you this.",
];
let wrongIdx = 0;

$('#pass-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = $('#pass-input');
  if (softMatch(input.value) === softMatch(CONFIG.passcode)) return enterSite();
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
  loadVault();
}

function enterSite() {
  clearInterval(gateTimer);
  clearInterval(flavourTimer);
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
  note: 'I was thrown into the deep end.',
  qs: [
    ['google',  'what is a repository'],
    ['google',  'what is an ATS'],
    ['claude',  'explain what this company actually sells, like i am five'],
    ['google',  'what is a recruitment agency'],
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
  note: 'Two weeks in, I had opinions — and put both Spott and Claude to work.',
  beats: [
    {
      img: 'assets/img/valuation.jpg',
      alt: 'Spott dashboard showing Total Revenue booked: €2,470,634,719.86',
      bub: 'blue',
      b: 'Single-handedly took our valuation to €2 billion',
      p: "Who needs to wait for Series B? You're welcome.",
    },
    {
      img: 'assets/img/seat-upgraded.jpg',
      alt: 'Email: Your seat was upgraded — you now have more Claude usage',
      bub: 'pink',
      b: 'You can call me Deblaude now',
      p: 'Claude had become an integral part of my workflow. Who would have thought?',
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
  wireReveal();
  wireBlur();
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
const BLUR_SEQ = ['3', '4', '5', '6', '7', 'blink', 'now'];
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
      num.textContent  = 'now';
      pre.textContent  = 'and suddenly it was';
      post.textContent = "…and that's today.";
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
   3. THE VAULT  —  one encrypted message per person
   ──────────────────────────────────────────────────
   vault.json holds nothing but salt + ciphertext. No names,
   no hints, no list of who's in it. The only way a message
   comes out is if someone types the code that decrypts it.
   ══════════════════════════════════════════════════ */

let VAULT = null;
async function loadVault() {
  try {
    const r = await fetch('data/vault.json', { cache: 'no-store' });
    if (r.ok) VAULT = await r.json();
  } catch { /* the form will say so */ }
}

const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

async function deriveKey(code, saltB64, iterations) {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64(saltB64), iterations, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
}

async function tryUnlock(rawCode) {
  const code = normCode(rawCode);
  if (!code) return null;
  if (!VAULT || !VAULT.records?.length) throw new Error('novault');

  const key = await deriveKey(code, VAULT.salt, VAULT.iterations || CONFIG.kdfIterations);
  const dec = new TextDecoder();

  for (const rec of VAULT.records) {
    try {
      const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b64(rec.iv) }, key, b64(rec.ct)
      );
      return JSON.parse(dec.decode(plain));      // auth tag passed → this is the one
    } catch { /* not this record, keep going */ }
  }
  return null;
}

const form   = $('#code-form');
const status = $('#code-status');
const btn    = $('#code-btn');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const raw = $('#code-input').value;
  if (!normCode(raw)) return;

  btn.disabled = true;
  status.classList.remove('err');
  status.textContent = 'opening…';

  let found = null, failed = false;
  try { found = await tryUnlock(raw); }
  catch { failed = true; }

  btn.disabled = false;

  if (failed) {
    status.classList.add('err');
    status.textContent = "the messages haven't been loaded yet — give it a second and try again.";
    return;
  }
  if (!found) {
    status.classList.add('err');
    status.textContent = "that code isn't on the list yet. text me and I'll write you one — I mean that.";
    $('#letter').hidden = true;
    return;
  }

  status.textContent = '';
  showLetter(found);
});

function showLetter({ name, message }) {
  const card = $('#letter');
  $('#letter-name').textContent = name || 'you';
  const body = $('#letter-body');
  body.innerHTML = '';
  card.hidden = false;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });

  /* type it out, paragraph by paragraph */
  const paras = String(message).split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    body.innerHTML = paras.map(p => `<p></p>`).join('');
    $$('p', body).forEach((el, i) => el.textContent = paras[i]);
    return;
  }

  let pi = 0;
  (function nextPara() {
    if (pi >= paras.length) return;
    const el = document.createElement('p');
    body.appendChild(el);
    const text = paras[pi++];
    let ci = 0;
    (function char() {
      el.textContent = text.slice(0, ++ci);
      if (ci < text.length) setTimeout(char, 16);
      else setTimeout(nextPara, 240);
    })();
  })();
}


/* ══════════════════════════════════════════════════
   4. BOOT
   Declared last so everything above it exists.
   ══════════════════════════════════════════════════ */

if (CONFIG.gateEnabled) {
  renderWhen();
  rotateFlavour();
  flavourTimer = setInterval(rotateFlavour, 4200);
  tickGate();
  gateTimer = setInterval(tickGate, 1000);

  /* Preview hatch before launch: ?preview=1 skips the countdown but NOT the
     passcode — only useful to someone who already knows the three words. */
  if (new URLSearchParams(location.search).has('preview')) {
    clearInterval(gateTimer);
    showPasscode();
  }
} else {
  gate.remove();
  revealSite(false);        // no gesture to autoplay off, so just offer the button
}
