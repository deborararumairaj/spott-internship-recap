# Spott Internship Recap — Brief / Questionnaire

Answer inline under each question. Anything you skip, I'll use the **[default]** in brackets.
If you're happy with all the defaults, just tell me "defaults are fine" and I'll build the first draft.

---

## 0. THE BLOCKERS (answer these first — I can't build a sensible draft without them)

**0.1 — The countdown: what is it counting down TO?**
(a) A fixed moment — the site unlocks at e.g. Fri 19 Sep, 17:00 Brussels time, same for everybody
(b) 3 hours from whenever *that person* first opens the link (personal timer, different per visitor)
**[default: (a) fixed moment]**
→ Your answer + the exact date/time/timezone:

**0.2 — Order of the gates.** I read your brief as: land on page → countdown ticking → when it hits zero, passcode box appears → type "Debora the intern" → audio starts + site revealed. Correct?
→

**0.3 — Can someone with the passcode skip the countdown?** (i.e. is the passcode box always there, or hidden until zero?)
**[default: hidden until zero — the countdown is the event]**
→

**0.4 — Where does this live?** Options: I publish it as a Claude Artifact (instant live link, works today, no setup) / Vercel / Netlify / GitHub Pages / you'll tell me later.
**[default: Claude Artifact for the draft so you can click a link in minutes, then move it wherever]**
→

**0.5 — Deadline.** When does this need to be live?
→

**0.6 — "Spot" or "Spott"?** And is your line "a **sports** intern" or "a **Spott** intern"? (You wrote "sports" — I suspect autocorrect.)
→ Exact opening sentence, word for word:

**0.7 — Internship dates.** Start date, end date, and is it exactly 6 weeks?
→

**0.8 — The honest answer on security.** Anything in a website's code can be read by someone who opens "View Source". So:
- The passcode "Debora the intern" is a *vibe gate*, not a lock. Fine? **[default: fine]**
- The personal messages are different — if you don't want Kevin reading Sebastian's message, I can **encrypt each message with that person's own code**, so the page literally cannot show a message without the right code. Slightly more work, genuinely private. **[default: yes, encrypt them]**
→

---

## 1. Assets & the Slack problem

**1.1 — Slack DMs with Kevin.** See `SLACK-HOWTO.md` in this folder — three ways to get it to me, best first. Which are you doing?
→

**1.2 — Audio.** What's the file (name/format/length)? Should it loop for the whole page, or play once? Do you want a visible player + mute button?
**[default: plays once on unlock, small floating mute button top-right, loops off]**
→

**1.3 — The "edited myself in" photo.** Do you already have the photoshopped image, or do you have (a) a team/office photo and (b) a cutout of you, and you want *me* to do the deliberately-bad paste-in with a hard white outline?
→

**1.4 — Past internship decks/videos.** Are those purely style reference for me, or do you want any of them embedded in the site?
→

**1.5 — Screenshots.** As you drop them in `/Screenshots`, name them so I know where they go, e.g. `week2-claude-pro-upgrade.png`, `week4-onboarding-doc.png`. Confirm you'll do that, or I'll just look at them and guess.
→

---

## 2. Look & feel

**2.1 — Colours & fonts.** Dropping them in `/Brand` and `/Fonts`. Is this **Spott's brand** or **your personal brand**?
→

**2.2 — Light or dark?** **[default: dark, it makes the scrolly section feel like a cinema]**
→

**2.3 — Pick 3 vibe words.** e.g. playful / chaotic / clean / y2k / scrapbook / terminal-nerd / glossy-startup / handwritten
→

**2.4 — Emoji: heavy or restrained?** **[default: restrained — a few, placed for punchlines]**
→

**2.5 — Browser tab title + the preview card when someone pastes the link in Slack** (image + one line of text).
**[default: title "Debora the intern", preview = your photo + the opening line]**
→

---

## 3. The intro / "But first, how did I even get here?"

**3.1 — How *did* you get here?** The real version, 2–3 sentences. (Cold email? LinkedIn? Someone introduced you? You replied to a post?) The joke only lands if there's a true beat under it.
→

**3.2 — The "always edit yourself in" caption.** Do you want to write it, or should I draft 3 options and you pick?
**[default: I draft 3, you pick]**
→

---

## 4. The week-by-week scrolly

**4.1 — Confirm the mechanic:** left side = big sticky "WEEK 1" that stays put; right side = questions appear one at a time as you scroll; when week 1's questions run out, the left label flips to "WEEK 2". Right?
→

**4.2 — How should the questions look?**
(a) Plain text lines, fading in — cleanest, ages well
(b) Styled like real chat/search bubbles with little Claude / ChatGPT / Google-ish marks
(c) One search bar at the top-right that "types" each question with a cursor blink, then it drops into the stack below
**[default: (c) — it's the most fun and it reads as a montage]**
→

**4.3 — How many questions per week?** **[default: 6–9, with the last one of each week being the punchline]**
→

**4.4 — Weeks 3–6 questions:** will you write them, or should I draft from your Slack + your work list and you edit?
**[default: I draft, you edit — much faster]**
→

**4.5 — Is there also a short real paragraph per week** (what actually happened), under the week number? Or purely questions, and the substance comes later in the "what I actually did" section?
**[default: one short line per week + the questions; the meaty section comes after]**
→

**4.6 — The arc.** Should the questions visibly get smarter — week 1 "what is a repository", week 6 "what's the cleanest way to structure this sequence" — so the growth is the joke?
**[default: yes, and there's a running counter of questions asked that ticks up as you scroll]**
→

**4.7 — Screenshots inside the weeks.** Week 2's Claude Pro upgrade — inline image with a caption? Any others?
→

**4.8 — Week 6 / "up until now"** — you said weeks 3–6 run to today. Is week 6 finished, or is it in progress right now?
→

---

## 5. What I actually did

**5.1 — Spellings I need confirmed:** "Mentalify" (the tool you moved the docs *into* — is that Mentorly? Mentimeter? something else?), and everyone's names.
→

**5.2 — The people.** Kevin, Sebastian, Nathan, "CS" — full names? Roles? And are you OK naming colleagues on a page that gets shared around? **[default: first names + role only]**
→

**5.3 — Numbers.** Any receipts? How many docs rewritten, how many videos, how many animations recorded, X followers, etc. Numbers make this section land.
→

**5.4 — Anything missing from this list?**
Notion → Mentalify migration · rewrote all content · restructured the docs · screen-recorded the site animations · 40-min onboarding video with Sebastian · welcome video with CS · email sequencing · backfill for Nathan · filming · started the X account
→

**5.5 — Links.** X account, live onboarding docs, anything else you want clickable — and are they public?
→

**5.6 — Format:** a receipts grid ("6 weeks · 14 docs · 1 X account") followed by short cards, or a flowing narrative?
**[default: stat strip + cards]**
→

---

## 6. The personal codes at the bottom

**6.1 — How many people?** Roughly how many "I know you well" vs "I barely know you"?
→

**6.2 — What is a person's code?** Their first name (easiest to tell someone verbally) or a unique word you give them?
**[default: first name, case-insensitive]**
→

**6.3 — The prompt text.** You said "Enter your code here to discover..." — discover what? Exact wording?
→

**6.4 — The messages themselves.** Will you write each one, or give me bullets per person and I draft in your voice?
**[default: you give me bullets, I draft, you edit]**
→

**6.5 — Length and tone?** **[default: 3–5 sentences, warm, one specific memory, one genuine thank-you]**
→

**6.6 — The generic message** for people you don't know well — do you want one warm catch-all, or 2–3 variants (e.g. "someone from Spott I didn't work with closely" vs "a stranger who got the link")?
→

**6.7 — Wrong/unknown code:** funny rejection, or a soft "you're not on the list yet — text me and I'll make you one"?
**[default: the soft one, it's kinder and it's an invitation]**
→

**6.8 — Reveal style.** Message appears on a card, typed out letter by letter? Screenshot-friendly so people can share it?
**[default: yes to both]**
→

---

## 7. The ending

**7.1 — Is there anything after the personal messages?** A sign-off, what's next for you, contact links, a "hire me"?
→

**7.2 — What's the one thing you want someone to feel or do when they close the tab?**
→

---

## 8. Small stuff

**8.1 — Mobile.** Most people will open this on their phone from a Slack link. I'll build it phone-first. Any objection?
→

**8.2 — Passcode matching:** should "debora the intern" (lowercase) and "Debora The Intern " (stray space) both work? **[default: yes, forgiving]**
→

**8.3 — Hint on the lock screen?** e.g. "three words. you know who." **[default: no hint, you'll tell people the passcode directly]**
→

**8.4 — Wrong passcode message** — funny line? **[default: "that's not it. try again." with a small shake]**
→
