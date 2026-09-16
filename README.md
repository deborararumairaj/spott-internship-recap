# Debora the intern

A recap of seven weeks at Spott. Countdown → passcode → scrollytelling → one
encrypted personal message per person.

Plain static HTML/CSS/JS. No build step, no framework, no dependencies.
`site/` is what gets served.

---

## The three things you'll actually want to change

### 0. The gate is currently OFF

`site/app.js`, very first line of `CONFIG`:

```js
gateEnabled: false,   // site opens straight up, no countdown, no passcode
```

Flip it to `true` on launch day and the countdown + passcode come back exactly
as they were.

### 1. When it unlocks

`site/app.js`, first block:

```js
unlockAt: '2026-09-18T15:00:00Z',   // Fri 18 Sep 2026, 17:00 Brussels
```

Brussels is UTC+2 in September, so **subtract 2 hours** to get the UTC value.
Everyone on earth sees the same countdown hit zero at the same instant.

### 2. The front-door passcode

Same block: `passcode: 'debora the intern'`.
Matching ignores case, spaces and punctuation — `DeboraTheIntern` works too.

### 3. The personal messages

```bash
cd site
cp people.example.json people.json     # people.json is gitignored. Keep it that way.
# …write the real messages…
node tools/make-vault.mjs              # prints everyone's code at the end
```

`people.json` is an array:

```json
[
  { "name": "Kevin", "message": "First paragraph.\n\nSecond paragraph." },
  { "name": "Sebastian", "code": "SEB7", "message": "…" }
]
```

- Leave `code` out and it's generated: first three letters of the first name,
  plus a digit. `Kevin → KEV8`.
- Blank lines split paragraphs; the site types them out one at a time.
- Re-run `make-vault.mjs` after any edit, then commit `site/data/vault.json`.
- `node tools/make-vault.mjs --codes` just prints the list without rebuilding.

---

## How private the messages actually are

`site/data/vault.json` is the only thing published. It contains one salt and a
list of `{iv, ct}` blobs — **no names, no roles, no ordering that means
anything**. Someone reading View Source learns how many messages exist and
nothing else.

Each message is AES-256-GCM encrypted under a key derived from that person's
code alone (PBKDF2-SHA256, 1,000,000 rounds). Typing a code derives the key in
the browser and tries it against every blob; the GCM auth tag identifies the
match. Kevin's code cannot open Sebastian's message. There is no server and no
list of codes anywhere in the deployed site.

**The honest caveat:** a four-character code is ~176,000 possibilities. The
million-round KDF makes each guess deliberately slow, which stops anyone poking
at it casually — but someone determined, with the right hardware and real
motivation, could grind through that space offline. Against "a curious colleague
opens dev tools" this is solid. Against a motivated attacker with a GPU it is
not. Longer codes (a word each) close that gap completely; set them by hand in
the `code` field if you ever want that.

---

## Running it locally

```bash
cd site
python3 -m http.server 4321
```

Then <http://127.0.0.1:4321>.

`?preview=1` skips the countdown but still asks for the passcode — useful for
checking the site before launch day without letting anyone else in early.

---

## Deploying

Vercel, zero config. `vercel.json` at the repo root points the output directory
at `site/` and sets `noindex` headers so this doesn't turn up in search.

Import the repo at [vercel.com/new](https://vercel.com/new) — Framework Preset
"Other", leave everything else alone. Every push to `main` redeploys.

---

## Still to drop in

| What | Where | Notes |
|---|---|---|
| Intro audio | `site/assets/audio/intro.m4a` | Plays on unlock. Add `intro.mp3` too for older browsers. The page works fine without it — the sound button just offers to play. |
| Real messages | `site/people.json` | See above. |
| More people | `site/people.json` | New recruits, anyone not on the Spott site. |

---

## Layout

```
site/
  index.html          structure + all the copy
  styles.css          brand tokens at the top, sections in page order
  app.js              gate, week data, scroll reveals, decryption
  data/vault.json     encrypted messages (committed, safe)
  people.json         plaintext messages (NEVER committed)
  tools/make-vault.mjs
  assets/img|video|audio
```

The week-by-week questions live in the `WEEKS` array in `app.js` — plain data,
edit freely. `'punch'` as a third item styles that row as the week's punchline.
