# How EQ Helper decides what to tell you

This document explains, in plain language, **how the app listens, what it counts as a
problem, and how it turns that into advice.** It's written so that:

- **anyone** can understand why the app said what it said, and
- **experienced mixers** can check the rules, disagree with them, and send corrections.

Each section starts with **In plain words** (no jargon), followed by **The exact rules** (the
real numbers the app uses) and **Where it lives** (the code file, for whoever makes the change).
If you only want the idea, read the plain-words parts.

Related documents:
- [kb-review.md](kb-review.md): every piece of EQ and compressor advice, one row each, for review.
- [kb-sources.md](kb-sources.md): which published guides the advice was checked against.
- [README](../README.md): how to use the app.

---

## Contents

1. [What the app can and can't know](#1-what-the-app-can-and-cant-know)
2. [The rules every piece of advice follows](#2-the-rules-every-piece-of-advice-follows)
3. [How the phone listens](#3-how-the-phone-listens)
4. [Feedback alerts](#4-feedback-alerts)
5. [Mix balance (Full mix)](#5-mix-balance-full-mix)
6. [Guided check (one person at a time)](#6-guided-check-one-person-at-a-time)
7. [Ring-out](#7-ring-out)
8. [Ask tab](#8-ask-tab)
9. [Turning advice into your mixer's knobs](#9-turning-advice-into-your-mixers-knobs)
10. [Compressor advice](#10-compressor-advice)
11. [Known weak spots](#11-known-weak-spots)
12. [How to suggest a correction](#12-how-to-suggest-a-correction)

**Quick vocabulary:** *Hz* is pitch (low numbers are bass, high are treble; 1 kHz = 1,000 Hz).
*dB* is how much louder or quieter. An *octave* is a doubling of frequency (100 → 200 Hz), so
"1/6 octave" means "very close by." A *spectrum* is the picture of how loud each pitch is.

---

## 1. What the app can and can't know

**In plain words:** the app hears the room through one phone microphone at the mixing desk. It
does not see the mixer, does not know which fader is which, and can't hear each channel on its
own. Everything it says is an educated guess from *what the room sounds like* plus *what you
told it in Setup* (your mixer's knobs, who's in the band, what speakers you have).

That leads to some honest limits, which the advice is designed around:

| Limit | What the app does about it |
|---|---|
| It hears a **pitch**, not a **channel**. | It names the *likely* culprit from the pitch and your band list, and says "check" rather than "this is it." |
| Phone mics are **weak below about 160 Hz**, and bass at the desk can differ a lot from the seats. | Anything below 160 Hz is marked **low confidence**, counted as half as important, and comes with "walk to the middle of the room first." |
| A real **drum kit** dominates a phone mic (cymbals, kick). | High-frequency "too bright" findings are ignored when a kit is in the band, and low-end findings get a "kit may exaggerate this" note. |
| The phone can't read your console's **level scale**. | Compressor advice never gives a threshold number. It says "lower it until the meter shows X dB." |
| The browser may **process the mic** (auto-gain, noise suppression). | The app asks the browser to turn these off and shows what was applied (Listen → Mic settings). Comparisons *within* a session still work if it can't. |

---

## 2. The rules every piece of advice follows

**In plain words:** these are the house rules. If you see advice that breaks one, that's a bug.

1. **Say what, where, how much, and why.** Every suggestion names the source, the frequency (with
   a range to search in), the amount, and a reason a volunteer can follow.
2. **Cut before you boost.** Boosting a microphone makes feedback more likely, and removing the
   problem usually sounds better anyway.
3. **Fix the competitor, not the victim.** If the vocal is buried, the first suggestion is to cut
   the guitars and keys where the vocal needs room, not to boost the vocal.
4. **Non-EQ fixes count.** Mic position, a high-pass filter, or asking a player to change
   something are offered alongside EQ, and offered *first* when the mixer has no knob that can
   help.
5. **Small moves.** Cuts are usually 2–4 dB, boosts 2–3 dB. Nothing in the advice library
   boosts more than 6 dB or cuts more than 12 dB (tests enforce this).
6. **Ranges, not magic numbers.** Each frequency is a *starting point*, with the range where that
   problem usually lives ("Usually 200–400 Hz: if it doesn't help, try nearby").
7. **Match the real hardware.** Advice is translated to the knobs you said you have. If the
   mixer can't do it, the app says so instead of pretending.
8. **Risky techniques only when it's safe.** The "boost a lot and sweep to find it" technique is
   only suggested during soundcheck, never during a service.

---

## 3. How the phone listens

**In plain words:** about ten times a second, the app takes a snapshot of how loud every pitch
is. For feedback it looks at these snapshots in fine detail. For "is the mix balanced?" it groups
pitches into 24 wider bands (like the sliders on a graphic EQ) and averages them over several
seconds, so one loud note doesn't throw it off. Silence is skipped, so pauses between songs don't
count as "the mix got quiet."

**The exact rules:**

| Setting | Value | Why |
|---|---|---|
| Snapshots per second | 10 (every 100 ms) | Fast enough to catch feedback within a second. |
| Detail per snapshot | 16,384-point FFT (about 3 Hz resolution at 48 kHz) | Fine enough to tell feedback apart from nearby notes. |
| Balance bands | 24 third-octave bands, 63 Hz – 12.5 kHz | Same spacing as a 31-band graphic EQ. |
| Balance frames | 2 per second | Smooths over individual notes. |
| Silence gate | Frames quieter than −45 dB (full scale) overall are ignored | So pauses don't drag averages around. |

**Where it lives:** `src/audio/capture.ts`, `src/ui/useListening.ts`, `src/analysis/balance.ts`.

---

## 4. Feedback alerts

### How it decides "that's feedback"

**In plain words:** feedback is a single pitch that **sticks out sharply**, **holds steady**,
**keeps going (or grows)**, and **has no musical partners**. A held vocal note or a keyboard pad
can stick out too, but real notes come with overtones at double and triple the pitch; feedback
is a pure tone. So the app only alerts when *all* of these are true:

1. **It sticks out.** At least 12 dB louder than the pitches just around it.
2. **It lasts.** Present for about 0.8 seconds, allowing a couple of missed snapshots.
3. **It holds its pitch.** It doesn't wander (vibrato on a sung note breaks it).
4. **It isn't fading.** A note that's dying away is music; feedback stays or grows.
5. **It's alone.** It mostly doesn't have partners at 2× or 3× its pitch (or ½, ⅓).

**The exact rules:**

| Check | Value |
|---|---|
| Frequency range watched | 80 Hz – 12 kHz |
| Minimum level | −85 dB (anything quieter is ignored) |
| "Sticks out" | ≥ 12 dB above the average of everything within ±1/6 octave (the peak's own edges excluded) |
| "Same pitch" | Stays within 1/24 octave (about a quarter of a semitone) of where it started |
| "Lasts" | ≥ 8 snapshots (~0.8 s); up to 2 missed snapshots in a row tolerated |
| "Not fading" | Latest level no more than 1.5 dB below its first level |
| "Alone" | Harmonic partners (at 2×, 3×, ½, ⅓, within 20 dB of its level) seen in no more than 30% of snapshots |

**Where it lives:** `src/analysis/feedback.ts` (`DEFAULT_CONFIG`).

### How alerts behave

**In plain words:** one ring = one alert. It disappears 3 seconds after the ringing stops. If
you tap **Not feedback**, the app ignores that pitch until you tap **Stop listening** (which
starts a fresh session). A pitch that rings again later is counted, so repeat offenders stand out in "Feedback this session," and from
the second time on the app suggests a permanent fix.

| Rule | Value |
|---|---|
| Two rings are "the same" | Within 1/12 octave |
| Alert clears after | 3 s without ringing |
| "Not feedback" ignores | ±1/12 octave, until you stop listening |
| Stop listening | Clears all alerts, dismissals, the feedback log and the balance history |
| Permanent fix shown | After the same pitch rings 2 or more separate times |

**Where it lives:** `src/analysis/feedbackSession.ts`.

### What it tells you to do

**In plain words:** first, stop the noise (pull down the most likely mic). Then find out whether
it's going round through the **monitors** or the **main speakers** (if you have wedges). Then cut
that pitch on whatever EQ you have, preferring the speaker output over the channel, because a cut
on the output only affects the path that's ringing.

**Which mic is "most likely"**, based on pitch:

| Pitch | Usual suspects |
|---|---|
| Below 300 Hz | Acoustic guitar (body resonance), kick or cajón mic |
| 300 Hz – 1 kHz | A vocal mic or acoustic guitar |
| 1 – 4 kHz | A vocal mic (the most common feedback range) |
| Above 4 kHz | Headset, clip-on (lavalier), condenser mics, overheads |

If your band list has 1–3 people who fit, they're named ("Sarah (headset)"). More than 3 isn't a
useful hint, so it falls back to the general description.

**Order of steps:**

1. Pull down the fader of the likely mic.
2. *(Wedges or "not sure" only)* Briefly lower that mic's monitor send. Stops → monitors. Keeps going → mains.
3. On the output that's ringing: output parametric EQ → cut 3–6 dB, narrow (Q 8–10); or graphic EQ →
   nearest slider down 3–6 dB.
4. Otherwise: cut that pitch on the mic's channel EQ, and check the mic isn't pointed at a speaker.

**Permanent fix** (for repeat offenders): 3–4 dB narrow cut on the output EQ, or 3 dB on the
nearest graphic EQ slider, or a small channel EQ cut / move the mic or speaker.

**Where it lives:** `src/advice/feedbackAdvice.ts`.

---

## 5. Mix balance (Full mix)

### What it's comparing against

**In plain words:** the app needs something to compare the mix to. There are two options:

- **Your own "sounds good" snapshot** (if you saved one for this room). The app then reports
  anything that's drifted from it. This is the most reliable mode.
- **The mix's own overall shape** (no snapshot). The app looks for spots that stick out from the
  pitches around them, like a single slider pushed up on a graphic EQ. This only catches lumps and
  holes, not "the whole thing is a bit bass-heavy," because every room and band is different.

Music and Speech each keep their own snapshot, since a sermon and a worship set should sound
different. Switching between them restarts the listening.

**The exact rules:**

| | Without a snapshot | With a snapshot |
|---|---|---|
| Compared against | For each band, the **median** of the 8 bands around it (±4 bands, ±1⅓ octave) | Your snapshot, after matching overall loudness (shape only) |
| "Too much" (bump) | ≥ 4 dB above that | ≥ 3 dB above the snapshot |
| "Too little" (dip) | ≥ 5 dB below, **only in the clarity range (1.6–5 kHz)** | ≥ 3 dB below the snapshot, any range |
| Whole-mix tilt | Checked: see below | Not checked (the snapshot already covers it) |
| Lowest band analyzed | 80 Hz | 80 Hz |

The median is used instead of a plain average because a broad lump lifts its own neighbours, and
an average would hide about half of it.

**Whole-mix too dark / too bright** (no snapshot only): the app fits a straight line through the
band levels from 250 Hz to 8 kHz. If highs fall off faster than **7 dB per octave** it says
"dark"; if they rise faster than **1 dB per octave** it says "bright" (not reported when a real
drum kit is playing, because cymbals would always trigger it). These two limits are educated
guesses; see [Known weak spots](#11-known-weak-spots).

**Where it lives:** `src/analysis/balance.ts`.

### Naming the problem

Neighbouring flagged bands that go the same way are treated as **one** problem, reported at its
worst point. The problem is named by where that point falls:

| Region | Range | Too much is called | Too little is called |
|---|---|---|---|
| Low | below 160 Hz | Boomy low end | Thin low end |
| Low-mid | 160–500 Hz | Low-mid buildup (muddy) | Lacking warmth |
| Mid | 500 Hz – 1 kHz | Boxy midrange | Hollow / scooped mids |
| Upper-mid | 1–1.6 kHz | Honky / nasal | Recessed mids |
| Presence | 1.6–5 kHz | Harsh upper mids | Clarity hole (words may be lost) |
| High | above 5 kHz | Too bright / sizzly | Dull top end |

### Which problem goes first

**In plain words:** bigger problems first. Low-end problems count half (the phone isn't sure
about them). Problems you saved as "known issues" for this room count 50% more and appear straight
away. At most three cards show at once.

| Rule | Value |
|---|---|
| Importance | Size of the deviation in dB × 0.5 if below 160 Hz × 1.5 if a known room issue |
| Kit playing | Bumps above 5 kHz ignored; low findings get a "kit may exaggerate this" note |
| Cards shown | Top 3 |
| "Known room issue" match | Within 1/6 octave of a saved one (bumps only) |

### Avoiding flicker

**In plain words:** a problem has to show up in a few checks in a row before a card appears, and
be gone for a few checks before the card goes away. The **Responsiveness** setting controls how
long that takes.

| Responsiveness | Listens over | Checks every | Must appear in a row | First advice after about |
|---|---|---|---|---|
| Steady | 30 s | 5 s | 3 checks | 18 s of sound + 3 checks |
| Normal (default) | 15 s | 5 s | 2 checks | 9 s of sound + 2 checks |
| Fast | 8 s | 3 s | 1 check | 5 s of sound |

The first check waits until the listening window is 60% full of actual sound. A "sounds good"
snapshot can only be saved once it's 80% full. Known room issues skip the waiting and show at once.

**Where it lives:** `src/analysis/balanceTracker.ts`, `src/ui/useListening.ts`.

### What it tells you to do

**In plain words:** each problem type has a short list of **usual suspects**, in order of how
often they cause it. If those instruments are in your band, the app looks up its advice for that
instrument and that problem (the same advice as the Ask tab), aimed at the exact pitch it heard,
and tells you to check up to two of them. Then it offers a whole-mix fix on your main EQ, if you
have one.

| Problem | Usual suspects (in order) |
|---|---|
| Boomy low end | Bass, kick, cajón, acoustic guitar, keys, headset speaker |
| Low-mid buildup (muddy) | Acoustic, keys, male vocal, female vocal, electric, headset speaker, handheld speaker |
| Boxy midrange | Male vocal, female vocal, cajón, kick, toms |
| Honky / nasal | Male vocal, female vocal, acoustic (piezo quack) |
| Harsh upper mids | Male vocal, female vocal, electric, keys, overheads, headset speaker |
| Too bright / sizzly | Acoustic (string noise), electric (fizz), male and female vocal (sibilance), e-kit |
| Thin low end | Kick, cajón |
| Lacking warmth | Male vocal, female vocal |
| Clarity hole | Male vocal, female vocal, acoustic |
| Dull top end | Male vocal, female vocal |
| Hollow mids, recessed mids, whole-mix dark/bright | No specific suspects; main EQ advice only |

In **Speech** mode only the speaker's mic is a suspect; in **Music** mode the speaker's mic is
left out.

**Whole-mix fix** (only if you have EQ on the main output):

| Your gear | Lump (too much) | Hole (too little) | Dark / bright overall |
|---|---|---|---|
| Parametric output EQ | Cut at that pitch by ¾ of the measured amount (2–6 dB), Q 1.4 | Boost by ½ the measured amount (2–3 dB) | High shelf at 8 kHz, ±2 dB |
| Graphic EQ on mains | Nearest slider, same amounts | Nearest slider, same amounts | 6.3–12.5 kHz sliders ±2 dB |
| Neither | (channel advice only) | (channel advice only) | HIGH knob on vocal and guitar channels |

Holes are corrected more gently than lumps on purpose: filling a hole is a boost, and boosts risk
feedback.

**Where it lives:** `src/advice/balanceAdvice.ts`.

---

## 6. Guided check (one person at a time)

**In plain words:** with every other fader down, the app listens to one person for a set time
(15 seconds by default, adjustable 8–30, pauses not counted) and builds a picture of their sound
on its own. It then looks for three things: **lumps** that stick out, **too much low end** (rumble
a high-pass filter would remove), and **how much their level swings** (for compressor advice).
It reports at most three items per person.

Because one instrument on its own is naturally lumpier than a whole band, a lump has to be bigger
here before it's reported.

**The exact rules:**

| Check | Rule |
|---|---|
| Lump | Same "stick out from the 8 bands around it" method as the full mix, but ≥ **5 dB** |
| Too much low end | Average level between 80 Hz and the source's cutoff, compared with its "body" (2× to 8× the cutoff). If the low end is less than 6 dB below the body, suggest the HPF. |
| HPF cutoff per source | Male vocal 100 Hz · Female vocal 120 · Headset speaker 150 · Handheld speaker 120 · Acoustic 80 (just under the low E) · Electric 100 · Overheads 300 · Bass, kick, keys, drums: never |
| Overlap | If the HPF is suggested, lumps below its cutoff aren't reported separately |
| Max items | 3 |
| "Can't hear anything" hint | After 8 s of silence |

**Turning a lump into advice:** the app takes the first piece of advice for that instrument whose
*cut* range contains the lump's pitch, and aims it at the exact pitch it heard. (So a male vocal
lump at 300 Hz becomes "Muddy," cut at 300 Hz.) If nothing in the library covers it, it says
"Resonance" and suggests a gentle 3 dB narrow cut (Q 2) at that pitch.

**Boost-and-sweep:** if your mixer has a sweepable or parametric knob covering the problem's
usual range, the app also explains the classic hunting method: turn the fader down a bit, boost
about +10 dB, slowly sweep until it sounds worst, then turn that into a 3–6 dB cut. A live readout
shows the loudest point in that range (smoothed over about a second). This is only offered here,
because a big boost during a service can start feedback.

**After a fix:** you can re-check the same person. A swing that's dropped by 3 dB or more counts
as an improvement (✓). Results are saved to each band member so next week shows last week's notes.

**Where it lives:** `src/analysis/sourceCheck.ts`, `src/advice/sourceCheckAdvice.ts`,
`src/analysis/sweep.ts`, `src/ui/GuidedCheck.tsx`.

---

## 7. Ring-out

**In plain words:** you slowly turn up one vocal mic's monitor until it just starts to ring. The
app uses the same feedback detector as the alerts to catch the exact pitch, tells you to back off
and cut that pitch, then you go again to find the next one. It stops after four rings per mic,
because by then you've removed the worst ones and further cuts start to hurt the sound.

| Rule | Value |
|---|---|
| Offered when | Monitors are set to wedges or "not sure" |
| Rings per mic | Up to 4 |
| Same ring | Within 1/12 octave of one already found |
| Fix | Monitor output EQ: 3–6 dB narrow cut (Q 8–10); or monitor graphic EQ slider 3–6 dB; or a small channel cut (which also affects the mains) |
| Finish | Leave the monitor send about 3 dB below where it last rang |

The red feedback banner is hidden during ring-out, since ringing is the point.

**Where it lives:** `src/ui/GuidedCheck.tsx`, `ringOutFix` in `src/advice/feedbackAdvice.ts`.

---

## 8. Ask tab

**In plain words:** no listening involved. You pick who sounds off and how; the app looks up the
matching entry in its advice library (72 entries) and translates it to your mixer. The search box
matches everyday words ("murky," "pick noise") to the right entry.

| Rule | Value |
|---|---|
| Buttons | Exactly one entry per instrument + problem (tests enforce no duplicates) |
| Search | Matches problem names and each entry's list of everyday words; a word inside your phrase, or your phrase (3+ letters) inside a word. Up to 5 results. |
| Each answer | Description of the problem, steps for your mixer, the usual range, non-EQ fixes, and why |

The full library, with every frequency, amount and explanation, is in
[kb-review.md](kb-review.md).

**Where it lives:** `src/advice/knowledgeBase.ts`, `src/advice/ask.ts`.

---

## 9. Turning advice into your mixer's knobs

**In plain words:** the advice library speaks in "cut 300 Hz by 4 dB." Your mixer might have a
fixed MID knob at 2.5 kHz, a sweepable MID, or a full digital EQ. This step picks the best knob
you actually have, and says so honestly when it's a compromise or impossible.

**The exact rules:**

| Your knob | Rule |
|---|---|
| **Fixed** knob (e.g. MID at 2.5 kHz) | Used if within **1 octave** of the target. If more than 1/6 octave away, the step adds "the closest this mixer can do." |
| **Sweepable** knob | Used if the target is inside its range. Set the frequency, then the gain. |
| **Parametric** (digital) | Used if the target is inside its range. Frequency, gain and Q (width), Q limited to what the band allows. |
| Several knobs could work | The closest one wins (exact beats approximate). |
| Amount | Never more than the knob's printed maximum. |
| Nothing reaches | "This mixer has no EQ knob near X," and the non-EQ fixes move to the top. |
| **High-pass filter** | Set to the target, limited to the filter's range. A fixed button is "turn on." |
| HPF can't go low enough | If its lowest setting is more than **half an octave above** what was asked (e.g. an 80 Hz button for a bass that wanted 35 Hz), the step says **leave it off**, because it would cut the instrument's own notes. |
| No HPF at all | A broad 6 dB low cut on the nearest low knob instead, unless that knob sits more than half an octave too high. |
| **Whole mix** | Always on the main graphic EQ: the nearest of the standard 31 slider frequencies. |

**Where it lives:** `src/advice/mixer.ts` (`translate`, `describeInstruction`).

---

## 10. Compressor advice

### When it's suggested

**In plain words:** the app measures how far someone's level swings between their quiet parts
and their loud parts. Each instrument has a normal amount of swing; compression is only suggested
when they go clearly past it. Some instruments (toms, cajón, e-kit, overheads) usually sound best
uncompressed in a small room, so they only get a light suggestion if the swing is extreme.

The app can only measure this when it's hearing **one source**: in the guided check, or in Speech
mode (one speaker). With a full band, one mic can't tell who got louder.

**The exact rules:**

| Rule | Value |
|---|---|
| Level measured | Total loudness from 60 Hz to 14 kHz, 10 times a second; silent moments skipped |
| Swing | Loud parts (95th percentile) minus soft parts (10th percentile), so one shout or one breath doesn't count |
| Needs | At least 30 measurements (about 3 s of sound) |
| Stronger ratio | Used when the swing is more than 6 dB past the source's limit (vocals: 4:1 instead of 3:1) |
| Target | Never more than 6 dB of gain reduction |

Per-source limits, ratios, attack and release times are in the compressor table of
[kb-review.md](kb-review.md), and their origins in [kb-sources.md](kb-sources.md).

### What it tells you to do

| Your compressor | Steps |
|---|---|
| Full controls | Ratio; attack and release (and knee, if it has one); lower the threshold until the meter shows the target on the loudest parts and little on the soft parts; make up the lost level. |
| One COMP knob | 10 o'clock (light) or 12 o'clock (medium, for 4:1 and up); the light should flicker, not stay on. |
| None | Mic technique (voices) or even playing (instruments), and riding the fader. |

Every compressor card says it's for experienced mixers. Vocal and speech mics with wedges also
get a warning that heavy compression makes feedback more likely.

**Where it lives:** `src/analysis/dynamics.ts`, `src/advice/compressorAdvice.ts`,
`COMPRESSOR_STARTS` in `src/advice/knowledgeBase.ts`.

---

## 11. Known weak spots

These are the places most likely to be wrong. They're educated guesses that haven't yet been
tuned against real recordings from real rooms, and they're the most valuable things to check.

| What | Current guess | Risk if wrong | Where |
|---|---|---|---|
| Silence gate | −45 dB full scale | Too strict: stuck on "first advice in…" in quiet rooms. Too loose: room noise counted as music. | `GATE_DB`, `balance.ts` |
| Feedback "alone" test | Only checks 2× and 3× partners | A very pure held note (flute, sine pad) could be flagged; a distorted feedback tone could be missed. | `feedback.ts` |
| Feedback thresholds | 12 dB sticking out, 0.8 s | Too sensitive: false alarms. Too strict: alerts come late. | `feedback.ts` |
| Dark / bright limits | −7 and +1 dB per octave | Whole-mix tilt warnings too often or never. | `DARK_SLOPE`, `BRIGHT_SLOPE`, `balance.ts` |
| Too-much-low-end test | Low end within 6 dB of body | HPF suggested when not needed (or missed). | `HPF_EXCESS_DB`, `sourceCheck.ts` |
| Feedback suspect ranges | The table in section 4 | The wrong mic gets pulled down first. | `feedbackAdvice.ts` |
| Mix suspect lists | The table in section 5 | The wrong channel is checked first. | `COPY`, `balanceAdvice.ts` |
| Every frequency and amount | Rules of thumb, calibrated against published guides | Advice that doesn't fit small worship rooms. | `knowledgeBase.ts`, `reference.ts` |

---

## 12. How to suggest a correction

You don't need to know code. Any of these is useful:

- **"This rule is wrong":** quote the section and rule from this document, say what you'd
  change it to, and why (ideally from experience: "in small rooms, X usually...").
- **"The app said something wrong":** say what you were doing, what the app showed, and what it
  actually sounded like. A short recording (Listen → Record a test clip) helps most.
- **"An entry in the library is wrong":** tick or annotate its row in
  [kb-review.md](kb-review.md) and send it back.

Send it to the person who shared the app with you, or open an issue from Setup → Help → Report a
problem or idea.

**For whoever makes the change:** each section above names the file. Rules for advice text live in
`src/advice/`, detection numbers in `src/analysis/`. After changing the advice library or charts,
run `npm run kb:review` to regenerate the review sheet (a test fails if you forget), and update
[kb-sources.md](kb-sources.md) if the change came from a published source. If you change a number
in this document's tables, change it here too, so this stays a true description of the app.
