/* ══════════════════════════════════════════════════
   Debora the intern — Spott internship recap
   ══════════════════════════════════════════════════ */

const CONFIG = {
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
  ['Tinkering…',      '(still thinking)'],
  ['Shenaniganing…',  '(17s · ↓ 550 tokens)'],
  ['Synthesizing…',   '(1m 34s · still thinking)'],
  ['Crunching…',      '(1h 18m 33s)'],
  ['Building builds…','(in the background)'],
  ['Percolating…',    '(do not refresh)'],
  ['Marinating…',     '(it needs the time)'],
  ['Compiling…',      '(vibes, mostly)'],
];

const PLEADS = [
  "I know you're really curious to know about my internship. Please wait — it's building builds in the background.",
  "Please wait. It's tinkering. It genuinely cannot be rushed.",
  "You are early. That is a compliment and an inconvenience.",
  "This is not loading. This is waiting. There is a difference and the difference is on purpose.",
  "Seven weeks took seven weeks. You can do this.",
  "No, the passcode won't help you yet. The box isn't even there.",
  "Somewhere in this file there is an encrypted message with your name on it. Sit tight.",
];

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
  $('#cd-d').textContent = pad(Math.floor(s / 86400));
  $('#cd-h').textContent = pad(Math.floor(s / 3600) % 24);
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
function enterSite() {
  clearInterval(gateTimer);
  clearInterval(flavourTimer);
  gate.classList.add('is-gone');
  document.body.classList.remove('is-locked');
  $('#site').hidden = false;

  const audio  = $('#intro-audio');
  const toggle = $('#sound-toggle');
  audio.play().then(() => {
    toggle.hidden = false;                       // only offer the control if it actually played
  }).catch(() => {
    toggle.hidden = false;
    toggle.classList.add('is-muted');
    $('.st-label', toggle).textContent = 'play audio';
  });

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      toggle.classList.remove('is-muted');
      $('.st-label', toggle).textContent = 'sound on';
    } else {
      audio.pause();
      toggle.classList.add('is-muted');
      $('.st-label', toggle).textContent = 'sound off';
    }
  });
  audio.addEventListener('ended', () => {
    toggle.classList.add('is-muted');
    $('.st-label', toggle).textContent = 'replay';
    audio.currentTime = 0;
  });

  setTimeout(() => { gate.remove(); }, 900);
  buildWeeks();
  observeAll();
  loadVault();
}

/* boot the gate */
renderWhen();
rotateFlavour();
flavourTimer = setInterval(rotateFlavour, 4200);
tickGate();
gateTimer = setInterval(tickGate, 1000);

/* Preview hatch for Debora before launch: ?preview=1 skips the countdown
   but NOT the passcode — so it's only useful to someone who already
   knows the three words. */
if (new URLSearchParams(location.search).has('preview')) {
  clearInterval(gateTimer);
  showPasscode();
}

/* ══════════════════════════════════════════════════
   2. THE WEEKS
   ══════════════════════════════════════════════════ */

const WEEKS = [
  {
    n: 1,
    title: 'Absolutely no idea what is happening',
    note: 'I had a laptop, a Slack account, and a job title with a letter combination in it that I had to look up.',
    qs: [
      ['google',  'what is a repository'],
      ['chatgpt', 'how do i set up a github'],
      ['google',  'what is an ATS'],
      ['google',  'what is a recruitment agency'],
      ['google',  'what even is recruitment, like fundamentally'],
      ['claude',  'what does Kevin mean by <em>"put it in ordinal"</em>'],
      ['google',  'tech bro words i can use to sound like i know things'],
      ['chatgpt', 'what is a JSON file'],
      ['claude',  'is it normal to understand nothing on day three', 'punch'],
    ],
  },
  {
    n: 2,
    title: 'I figure out Claude',
    note: 'Everything got faster. Alarmingly faster. I started on the onboarding docs and then did not really stop.',
    qs: [
      ['claude',  'read this Notion page and tell me what is actually wrong with it'],
      ['google',  'what is Mintlify'],
      ['claude',  'how do i write onboarding docs that someone will actually read'],
      ['google',  'md vs mdx difference'],
      ['claude',  'why is my sidebar not showing up'],
      ['claude',  'why is my sidebar <em>STILL</em> not showing up'],
      ['chatgpt', 'how do i screen record only one window on mac'],
      ['me',      'hey Kevin. so. about my Claude usage limit.', 'punch'],
    ],
    shot: { img: 'assets/img/seat-upgraded.jpg', cap: 'By the end of week 2 they had to upgrade my seat. I consider this a KPI.' },
  },
  {
    n: 3,
    title: 'MCP, API keys, and other sounds',
    note: 'Kevin used the words "MCP" and "API keys" in a single sentence and I wrote both of them down phonetically.',
    qs: [
      ['google',  'what is MCP'],
      ['claude',  'what is an API key and why does everyone say it like that'],
      ['claude',  'restructure these docs so a new hire can find anything in two clicks'],
      ['claude',  'how do i get 40 minutes of interview down to six clips'],
      ['google',  'how to frame a talking head shot'],
      ['claude',  'write me five X posts that do not sound like a robot wrote them'],
      ['kevin',   'X posts do feel really ai generated atm — do want to give approval first', 'punch'],
    ],
    shot: { img: 'assets/img/kevin-mcp.jpg', cap: 'He was right. It did 10x. It also cost me an entire afternoon.' },
  },
  {
    n: 4,
    title: 'Back, and faster',
    note: 'I came back to a product that had moved, a docs site that was somehow mine, and a to-do list I had written for myself in a state of pure optimism.',
    qs: [
      ['claude',  'i have been away a week and a half, catch me up'],
      ['claude',  'what changed in the product while i was gone'],
      ['claude',  'how should a CS onboarding email sequence actually flow'],
      ['google',  'how many onboarding emails is too many onboarding emails'],
      ['claude',  'rewrite this so it sounds like a person and not a sequence'],
      ['claude',  'help me check thirty links without opening thirty tabs'],
      ['kevin',   'absolute machineee!! you did it for all accounts already?', 'punch'],
    ],
    shot: { img: 'assets/img/kevin-machine.jpg', cap: 'Printing this out. Laminating it. Putting it in my wallet.' },
  },
  {
    n: 5,
    title: 'Filming week',
    note: 'Cameras. Framing. A 40-minute sit-down with Sebastian. A welcome video with CS. Nathan was out, so for a while I was also Nathan.',
    qs: [
      ['google',  'best lighting for an office interview with no lighting equipment'],
      ['me',      'can you come and quickly check the framing for me?'],
      ['claude',  'how do i cut a 40 minute recording without losing the good bits'],
      ['claude',  'what do i do when someone says "just talk naturally" and i immediately forget how to talk'],
      ['me',      'WE GOT THE SHOT!!! im so happy'],
      ['kevin',   'the videos are fireee 🔥 damn', 'punch'],
    ],
    shot: { img: 'assets/img/kevin-videos-fire.jpg', cap: 'I peaked here and I am at peace with that.' },
  },
  {
    n: 6,
    title: 'The handover',
    note: 'Writing it all down so that it outlives me — which is, I am reliably told, the entire point of onboarding documentation.',
    qs: [
      ['claude',  'what is the cleanest way to structure a handover'],
      ['claude',  'what did i actually accomplish here, be honest with me'],
      ['claude',  'help me build a website to recap my internship'],
      ['google',  'how to deploy to vercel'],
      ['claude',  'how do i encrypt a message so that only one specific person can open it'],
      ['claude',  'is it weird to be sad about leaving a job i had for seven weeks', 'punch'],
    ],
  },
];

const INTERMISSION_AFTER = 3;

function buildWeeks() {
  const root = $('#weeks-root');
  const frag = document.createDocumentFragment();

  WEEKS.forEach(w => {
    const sec = document.createElement('div');
    sec.className = `wrap wrap-wide week week-${w.n}`;
    sec.innerHTML = `
      <div class="week-left">
        <p class="week-num">Week ${w.n}</p>
        <h3 class="week-title">${w.title}</h3>
        <p class="week-note">${w.note}</p>
      </div>
      <div class="q-stack">
        ${w.qs.map(([src, text, mod]) => `
          <div class="q${mod === 'punch' ? ' q-punch' : ''}">
            <span class="q-src" data-src="${src}">${src === 'me' ? 'me' : src}</span>
            <span class="q-txt">${text}</span>
          </div>`).join('')}
        ${w.shot ? `
          <figure class="q-shot">
            <img src="${w.shot.img}" alt="" loading="lazy">
            <figcaption>${w.shot.cap}</figcaption>
          </figure>` : ''}
      </div>`;
    frag.appendChild(sec);

    if (w.n === INTERMISSION_AFTER) {
      const int = document.createElement('div');
      int.className = 'wrap wrap-wide';
      int.innerHTML = `
        <div class="intermission">
          <h3>Intermission — a week and a half, off.</h3>
          <p>Somewhere in the middle of all of this I took a week and a half off. I would like to report that I switched off completely and thought about none of it. I would like to report that.</p>
        </div>`;
      frag.appendChild(int);
    }
  });

  root.appendChild(frag);
}

/* ─────────── the typing search pill ─────────── */
let typeToken = 0, lastType = 0;
function setPill(text) {
  const el = $('#pill-text');
  const plain = text.replace(/<[^>]+>/g, '');
  const me = ++typeToken;
  const now = performance.now();
  const instant = now - lastType < 260;          // fast scrolling? don't queue up a typing traffic jam
  lastType = now;

  if (instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = plain;
    return;
  }
  el.textContent = '';
  let i = 0;
  (function step() {
    if (me !== typeToken) return;
    el.textContent = plain.slice(0, ++i);
    if (i < plain.length) setTimeout(step, 14);
  })();
}

/* ─────────── reveal on scroll ─────────── */
let asked = 0;
function observeAll() {
  const qObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.target.classList.contains('in')) return;
      e.target.classList.add('in');
      if (e.target.classList.contains('q')) {
        asked++;
        $('#qcount').textContent = asked;
        setPill($('.q-txt', e.target).innerHTML);
      }
      qObs.unobserve(e.target);
    });
  }, { rootMargin: '-45% 0px -20% 0px' });

  $$('.q, .q-shot').forEach(el => qObs.observe(el));

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
