# EQ Helper

**Live EQ advice from your phone's mic, written for the person at the mixer.**

EQ Helper listens to the room during soundcheck and services and tells you *what* to change,
*where*, *by how much*, and *why*, translated into the actual knobs on your board. It's built
for small churches and worship teams: one volunteer at the mixer, a speaker on a headset, and a
small band.

- **Free**, no account, no ads.
- **Works offline** once installed. Most venues have bad Wi-Fi, so that matters.
- **Private.** Audio is analyzed on your phone and never leaves it. No analytics, no server.

**Open it:** <https://jintae412.github.io/eq-helper/>

---

## Contents

1. [Install](#install)
2. [Quick start (5 minutes)](#quick-start-5-minutes)
3. [The four tabs](#the-four-tabs)
   - [Listen](#listen): full-mix advice, feedback alerts, guided soundcheck, ring-out
   - [Ask](#ask): "the vocal sounds muddy, what do I do?"
   - [Reference](#reference): frequency charts for every instrument
   - [Setup](#setup): your mixer, band and room
4. [Typical Sunday workflow](#typical-sunday-workflow)
5. [Reading the advice](#reading-the-advice)
6. [EQ crash course](#eq-crash-course)
7. [Tips for good results](#tips-for-good-results)
8. [Troubleshooting](#troubleshooting)
9. [Limitations](#limitations)
10. [Feedback and bug reports](#feedback-and-bug-reports)
11. [For developers](#for-developers)

---

## Install

EQ Helper is a web app you add to your home screen. After that it opens like a normal app and
works without internet.

**iPhone (Safari):**

1. Open <https://jintae412.github.io/eq-helper/> in **Safari** (not Chrome; iOS only lets
   Safari install web apps).
2. Tap the **Share** button at the bottom of the screen.
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Open **EQ Helper** from your home screen. Allow microphone access when asked.

**Mac:** in Safari, choose **File → Add to Dock**. In Chrome, click the install icon at the
right end of the address bar.

**Updates:** the app updates itself. Open it once on Wi-Fi after an update is announced, then
close and reopen it. Your setup is kept.

---

## Quick start (5 minutes)

1. **Setup → Mixer & speakers.** Pick the preset closest to your board (see
   [Setup](#setup) if you're not sure), then fix any frequencies so they match what's printed
   on the knobs. This is the step that makes advice match *your* hardware.
2. **Setup → Band** *(optional, but worth it)*. Add each person and what they play/sing. Advice
   then says "check Sarah's channel" instead of "check a vocal."
3. **Listen → Start listening.** Put the phone at the board, screen up, mic uncovered.
4. Leave it on **Full mix** during the service. Use **Guided check** at soundcheck.
5. Anything sounds off and you don't know why? Go to **Ask**.

You can skip straight to step 5: the Ask and Reference tabs work with no setup at all, they
just give generic knob names until you set up your mixer.

---

## The four tabs

### Listen

The main screen. Tap **Start listening** and leave it running. The live spectrum at the top
shows what the mic hears (low notes on the left, high on the right). Listening keeps running
when you switch to other tabs, so feedback alerts still work while you're reading Ask.

There are two modes, picked with the toggle under the spectrum.

#### Full mix (during the service)

Advice about the overall sound while everyone's playing.

- **Music / Speech toggle.** Use **Music** for worship sets and **Speech** for the sermon,
  announcements and prayer. Speech has a different target sound, and in Speech mode the app
  also tracks the speaker's level swing and suggests compression if they're jumping between
  quiet and loud.
- **Responsiveness.** How long the app listens before it gives advice:
  - **Steady (30 s):** fewest false alarms. Good once the mix is basically right.
  - **Normal (15 s):** the default.
  - **Fast (8 s):** reacts quickly, but jumps at short moments. Good while you're actively fixing something.
- **Issue cards.** Up to three at a time, the most important first. Each card says what it
  hears (e.g. "Low-mid buildup (muddy), +6 dB around 250 Hz"), which channel to check first
  based on your band, and what to do on the main EQ if you have one. Tap **Why** for the
  explanation.
- **"Earlier this session"** keeps a log of issues that have gone away, so you can see patterns.
- **Low-confidence notes.** Phone mics hear very little below ~160 Hz and the bass at the
  board can be very different from the middle of the room. When a card says so, walk to the
  middle of the room and listen before changing anything.

**Rooms and references** (pick a room in Setup first):

- **This sounds good: save as reference.** When the mix sounds right, tap this. From then on
  the app compares the mix to *that* snapshot instead of a generic curve. Save one for Music and
  one for Speech. Keep the phone in the same spot each time; references only compare well from
  the same place.
- **Save to room as a known issue.** If the same boom or ring shows up every week, save it.
  Next time, a "Before the service" card at the top tells you to cut it before anyone plays.

#### Feedback alerts (always on)

When the app hears feedback (a sustained squeal, howl or ring), a **red banner** appears at the
top of every tab:

1. **Do the first step right away.** It names the mic most likely ringing, based on the
   frequency and your band setup.
2. If you have wedges, it tells you how to find the path: briefly lower that mic's monitor
   send. If the ringing stops it's the monitors; if not, it's the mains.
3. It then gives a permanent fix on whatever EQ you have (output EQ, graphic EQ slider, or the
   channel EQ).

Tap **Got it** once you've handled it, or **Not feedback** if it was a held note or a pad; it
won't alert on that frequency again this session. Feedback that keeps coming back is listed under **Feedback this session**
with a permanent fix.

#### Guided check (soundcheck)

Checks one person at a time and gives each a short report.

1. Set up your band in Setup first, or pick a single source from the list.
2. Choose how long to listen to each person (the slider).
3. Tap **Start guided check**. For each person:
   - **Pull every fader down except theirs.** The SOLO/PFL button only goes to your
     headphones, so the phone can't hear it.
   - Have them sing, play or talk at **service volume**. Pauses don't count; it waits for sound.
   - Read the report: things like "too much low end, turn on the HPF" or "boxy, cut 500 Hz",
     plus compressor advice if their level swings a lot.
4. When there's a sweepable knob that covers the problem, you'll get **boost-and-sweep**
   instructions: boost about +10 dB, slowly sweep the frequency until it sounds worst, then turn
   that boost into a 3–6 dB cut. This is the classic way to find an exact problem frequency.
   It's only offered here, not during the service, because a big boost can start feedback.
5. The summary is saved to each band member, so next week you can see last week's results.

#### Ring out the monitors (optional, wedges only)

Finds the frequencies where each vocal mic feeds back through the wedges *before* the service,
so you can cut them in advance. Read the safety card first: start the monitor volume **low**,
raise it **slowly**, pull back the moment it rings, and **keep everyone out of the way of the
wedges**. The app finds up to four rings per mic and tells you exactly which slider or band to
cut for each.

#### Record a test clip

Saves a short WAV recording (it opens the share sheet so you can AirDrop it or save it to
Files). This is mainly for sending examples to the developer when advice seems wrong.

### Ask

For when you can hear a problem but don't know how to fix it. No microphone needed.

1. **Pick who sounds off.** Your band members appear first (e.g. "Sarah · Female vocal"),
   then generic sources: male/female vocal, speaker (headset or handheld), acoustic, electric,
   bass, keys, cajón, kick, snare, toms, overheads, electronic kit, or the whole mix.
2. **Pick how it sounds.** Only the problems that apply to that source are shown.
   Not sure what "boxy" or "nasal" means? Open **What do these words mean?** under the
   buttons for a plain-language description of each one.
3. **Or describe it** in the search box: "sounds murky", "too much pick noise", "S sounds
   hurt". The app matches everyday words to the right problem.

Each answer card has:

- **A description** of what that problem sounds like, so you can confirm it's the right one.
- **Do this:** exact steps on your mixer ("Set MID frequency to 300 Hz, then turn MID down 4 dB").
- **Where it usually lives:** a frequency range to try if the starting point doesn't help.
- **Or try:** fixes that aren't EQ at all: mic placement, the HPF, asking a player to change
  something. These are often better than EQ. If your mixer has no knob in the right place,
  these are shown first.
- **Why:** what's going on, so you learn it for next time.

**Problems covered** (70 entries in total):

| Source | Problems |
|---|---|
| Male / female vocal | Muddy, boomy, boxy, nasal, harsh, harsh "S" sounds, thin, dull, buried, pops on P/B |
| Speaker (headset) | Muddy/boomy, harsh/thin, harsh "S" sounds, dull/hard to understand, pops |
| Speaker (handheld) | Muddy/boomy, harsh, thin, harsh "S" sounds, dull/hard to understand, pops |
| Acoustic guitar | Boomy, muddy, boxy, quacky (piezo), string noise, thin, dull, buried |
| Electric guitar | Muddy/boomy, harsh, fizzy, nasal/honky, thin, buried |
| Bass | Boomy, muddy, no definition/buried, thin, string/fret clank |
| Keys | Muddy/boomy, overpowering, harsh, boxy, thin, dull |
| Cajón | Boomy, boxy, no punch, dull (no slap) |
| Kick drum | Boxy/muddy, no punch, boomy, too clicky |
| Snare | Ringing, boxy/muddy, thin, dull (no crack), harsh (hi-hat bleed) |
| Toms | Ringing, boxy/muddy, boomy, dull/no punch |
| Overheads / cymbals | Harsh/overpowering, muddy/boomy, dull |
| Electronic kit | No punch, harsh, boomy/muddy, thin |
| Whole mix | Muddy, boomy, harsh, boxy/nasal, thin, dull |

Squealing or howling isn't on this list on purpose: that's feedback, and the Listen tab
handles it live.

### Reference

A cheat sheet for every source: **where its sound lives, and when to boost or cut there.**

1. Pick a source (vocal, acoustic, kick, whole mix…).
2. The **chart** shows each frequency range on a 20 Hz–20 kHz scale (low on the left, high on
   the right), so you can see at a glance where "body", "mud", "presence" and "air" sit for
   that instrument.
3. Below the chart, each range lists **Boost when** (what's missing) and **Cut when** (what's
   too much). For example, male vocal 2–5 kHz "Presence / clarity": boost when words are hard
   to understand, cut when it's harsh or shouty.

Open **EQ basics in 30 seconds** at the top of the tab if you're new to this. The
[EQ crash course](#eq-crash-course) below covers the same ground in more detail.

### Setup

Everything here is saved on your phone and survives closing the app.

#### Mixer & speakers

You can save several mixers (e.g. "Our Yamaha", "Youth room Behringer") and switch between
them, which is handy when bands bring their own board.

1. **Pick a preset** for a new mixer:

   | Preset | Looks like | Typical boards |
   |---|---|---|
   | 3-band (no sweep) | LOW, MID, HIGH knobs, each at a fixed frequency | Small analog mixers, cheap mixers |
   | 3-band with sweepable MID | A MID gain knob *plus* a MID frequency knob | Most small-to-mid analog mixers |
   | 4-band, two sweepable MIDs | LOW-MID and HI-MID, each with its own frequency knob | Larger analog consoles |
   | Digital (fully parametric) | Frequency, gain and Q (width) for every band, on a screen | Behringer X32/XR, Yamaha TF, Allen & Heath QU/SQ, Soundcraft Ui, etc. |

2. **Match it to your board.** Edit each knob's frequency (or frequency range) to what's
   printed on the board. Add or remove knobs as needed. If your board's frequencies aren't
   printed, check the manual; a wrong number here means wrong advice.
3. **High-pass filter:** none, an on/off button (often labelled "80 Hz", "LOW CUT" or a ⟋
   symbol), or an adjustable knob.
4. **Channel compressor:** none, a one-knob "COMP", or full controls. Compressor advice is
   only given if you have one.
5. **Speakers & monitors:** wedges, in-ears or none; whether your mains and monitors have a
   graphic EQ; whether a digital board has EQ on its outputs. This decides how feedback and
   whole-mix advice is phrased.

#### Band

Add each person: a name, what they play or sing, and optionally the mic type (handheld,
headset, clip-on, condenser, DI). Names show up in advice and feedback alerts. The mic type
helps feedback alerts guess which mic is ringing (headsets and condensers ring higher than
handhelds). You can save several bands.

#### Room

Optional. Create a room per venue. A room stores **known issues** (frequencies that always
cause trouble there, which you can type in or save from a Listen card) and your **"sounds good"
references** for Music and Speech. Leave it unset and the app compares the mix to a generic
target instead.

#### Help

Install instructions, a short how-to, and a pre-filled form for reporting problems.

---

## Typical Sunday workflow

**Once, at home:** set up your mixer and band. Takes 5 minutes, saves you guessing every week.

**At the venue, before anyone plays:**

1. Pick the right mixer, band and room in Setup.
2. If the room has known issues, the **Before the service** card on Listen tells you what to
   cut on the mains.
3. Set a high-pass filter on every channel except bass and kick (the app's guided check will
   remind you).

**Soundcheck:**

1. **Listen → Guided check.** Go through everyone one at a time. Apply the fixes as you go.
2. **Ring out monitors** if you use wedges and have a few spare minutes.
3. Have the band play a song together. When it sounds good, tap **save as music reference**.
4. Have the speaker say a few sentences at preaching volume, switch to **Speech**, and save a
   speech reference too.

**During the service:**

1. **Listen → Full mix**, **Music**, Responsiveness **Normal**. Keep the phone at the board.
2. Switch to **Speech** for the sermon and announcements.
3. React to the red feedback banner immediately; everything else can wait for a gap between
   songs.
4. Something sounds wrong that the cards don't mention? **Ask** tab.

---

## Reading the advice

| You see | It means |
|---|---|
| **Hz / kHz** | Pitch. 100 Hz is a low bass note, 1 kHz is around the middle of a voice, 10 kHz is cymbal shimmer. 1 kHz = 1000 Hz. |
| **dB** | How much louder or quieter. 3 dB is a clear but gentle change; 6 dB is a lot. |
| **Cut / boost** | Turn that frequency down / up. Knobs at 12 o'clock (0 dB) do nothing. |
| **HPF** (high-pass filter, low cut) | Removes everything below a frequency. The single most useful button on a mixer. |
| **Q** | How wide a cut or boost is (digital boards only). Low Q (0.7) = broad and gentle; high Q (6–10) = narrow, for one specific ringing tone. |
| **"the closest this mixer can do"** | Your board has no knob exactly there, so the app used the nearest one. It'll work, but not as precisely. |
| **"no EQ knob near X"** | Your board can't reach that frequency. Use the **Or try** fixes instead. |
| **Main graphic EQ slider** | The sliders on a graphic EQ for the whole PA (often a separate rack unit), as opposed to a channel's EQ. |
| **Low confidence** | The phone can't hear this range well (deep bass) or a drum kit is skewing it. Walk the room and use your ears. |

Every frequency is a **starting point**. Voices, instruments, mics and rooms all differ, so
the app gives a range; if the suggested spot doesn't help, sweep a little either side.

---

## EQ crash course

If you're new to mixing, these rules cover 90% of it:

1. **Fix it at the source first.** Mic placement, a fresh set of strings, or asking the
   keyboard player to lighten their left hand often beats any EQ.
2. **High-pass filter almost everything.** Vocals, guitars, keys and overheads have nothing
   useful in the deep bass, only rumble and mud. Leave it off bass and kick.
3. **Cut before you boost.** Removing the bad part usually sounds better than boosting the
   good part, and boosting a mic increases the chance of feedback.
4. **Make room instead of turning up.** If the vocal is buried, cut a little 2–4 kHz on the
   guitars and keys rather than boosting the vocal.
5. **Small moves.** 2–3 dB is plenty most of the time. If you're past 6 dB, something else is
   probably wrong.
6. **Cut narrow, boost wide.** Problems are often a narrow tone; nice-sounding boosts are broad.
7. **Listen from the seats.** The board position is rarely where the congregation sits,
   especially for the low end.

Rough map of where things live (the Reference tab has one per instrument):

| Range | What lives there | Too much sounds | Too little sounds |
|---|---|---|---|
| 20–80 Hz | Sub bass, kick thump | Rumbly, boomy room | Weak, no pulse |
| 80–250 Hz | Bass notes, body, warmth | Boomy | Thin, tinny |
| 250–500 Hz | Low mids | Muddy | Hollow |
| 500 Hz–1 kHz | Mids | Boxy | Scooped, distant |
| 1–2 kHz | Upper mids | Nasal, honky | Lacking definition |
| 2–5 kHz | Presence, word clarity | Harsh, piercing | Buried, hard to understand |
| 5–8 kHz | Sibilance, attack | Hissy "S" sounds, scratchy | Dull |
| 8–16 kHz | Air, shimmer | Brittle, fizzy | Dull, muffled |

---

## Tips for good results

- **Keep the phone at the board,** screen up, mic uncovered, in the same spot every week.
  That's what makes references comparable.
- **Don't cover the mic** with a case flap or your hand. On iPhone the main mic is on the
  bottom edge.
- **Install it** rather than using a Safari tab. Installed, it works offline and the screen
  layout is right.
- **Turn on Do Not Disturb** during services, so notifications don't interrupt listening.
- **Plug the phone in** for long services. Listening continuously uses battery.
- **Trust your ears over the app.** It's a second opinion from a small mic in one spot. If
  something sounds right and the app disagrees, it sounds right.

---

## Troubleshooting

| Problem | Try |
|---|---|
| "Start listening" does nothing, or shows a mic error | iPhone: **Settings → Safari → Microphone** (or the app's settings) → Allow. Then close and reopen the app. Only one app can use the mic at a time; close voice memos, video calls, etc. |
| Stuck on "first advice in about N s" | It only counts moments with sound. Make sure music is actually playing through the PA, and the phone isn't in a pocket or case. Try Responsiveness **Fast**. |
| Feedback banner shows for a held note or pad | Tap **Not feedback**. It won't alert on that frequency again this session. |
| Advice names knobs my board doesn't have | Setup → Mixer: pick the right preset and edit the knob frequencies to match your board. |
| Advice says "no EQ knob near…" | Your board can't reach it. Use the **Or try** fixes, or the main graphic EQ if you have one (Setup → Speakers & monitors). |
| Guided check says it can't hear anything | Is that person's fader up? Remember SOLO/PFL only goes to headphones, so pull the other faders down instead. |
| Low-end advice seems wrong | Phone mics are weak below ~160 Hz. Walk to the middle of the room and listen before acting. |
| App didn't update | Open it on Wi-Fi, close it completely (swipe it away), and reopen. Sometimes it takes two tries. |
| Lost my setup | Data lives in the browser's storage. Deleting the home-screen app, or clearing Safari website data, erases it. There's no cloud backup. |

The **Mic settings the browser applied** section on Listen (visible while listening) is for
debugging: `autoGainControl`, `echoCancellation` and `noiseSuppression` should all be `false`.
If they're `true`, the browser is processing the mic and level-based advice is less reliable.

---

## Limitations

- **It hears a frequency, not a channel.** The app guesses which channel is responsible from
  the frequency and your band setup. Usually that's right, but check before cutting.
- **One mic, one spot.** It hears what the board position hears. The back of the room may differ.
- **Phone mics don't hear deep bass well.** Advice below ~160 Hz is marked low confidence.
- **Drum kits skew the full mix.** Cymbals and kick dominate a phone mic; advice is marked
  when a real kit is in the band.
- **Rules of thumb, not magic.** The knowledge base is standard live-sound practice for small
  rooms. It's being reviewed by experienced mixers (see [`docs/kb-review.md`](docs/kb-review.md)).
- **No cloud sync.** Setup lives on the device you entered it on.

---

## Feedback and bug reports

The easiest way: tell the person who shared the app with you. Say what you were doing, what
the app showed, and what it actually sounded like.

Or open a GitHub issue: **Setup → Help → Report a problem or idea → Open a new issue on
GitHub**. It pre-fills the questions and the app version. Issues are public, so don't include
personal info. A recording (Listen → Record a test clip) of the problem helps a lot.

---

## For developers

### Stack

Vite + React 18 + TypeScript, installed as a PWA with `vite-plugin-pwa`, hosted on GitHub
Pages. Tests with Vitest. No backend. See [`docs/SPEC.md`](docs/SPEC.md) for the why and
[`plan.md`](plan.md) for phases and conventions.

### Run it locally

Requires Node 22.12+ or 24 (see `.nvmrc`).

```bash
nvm use
```

```bash
npm ci
```

```bash
npm run dev
```

The app is served at `http://localhost:5173/eq-helper/`. Mic access works on `localhost`
without HTTPS. To test on an iPhone you need HTTPS, so the simplest route is pushing to `main`
and using the deployed site.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm test` | All unit tests (Vitest) |
| `npm run build` | Typecheck (`tsc`) and production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run kb:review` | Regenerate [`docs/kb-review.md`](docs/kb-review.md) from the knowledge base |

### Project layout

```
src/
  audio/      the only browser-audio code: mic capture, WAV recorder
  analysis/   pure functions: spectrum → findings (feedback, balance, solo checks, dynamics)
  advice/     pure functions: knowledge base, reference charts, findings → steps for your mixer
  storage/    localStorage with versioned schema + migrations
  ui/         React screens (Listen, Ask, Reference, Setup) and their pieces
docs/         spec and the expert review sheet
public/       icons and the recorder audio worklet
```

`analysis/` and `advice/` never touch the DOM or Web Audio, so everything that makes a
decision is unit-tested with plain data.

### Editing the advice

- **Ask answers** live in [`src/advice/knowledgeBase.ts`](src/advice/knowledgeBase.ts) (`KB`).
  Each entry has sources, symptoms, search synonyms, EQ moves (with the range the problem
  usually lives in), non-EQ fixes, and a "why". Tests enforce sane gains/Q, moves inside their
  ranges, and at most one entry per source + symptom.
- **Symptom descriptions** (the "What do these words mean?" glossary) are
  `SYMPTOM_DESCRIPTIONS` in the same file.
- **Reference charts** live in [`src/advice/reference.ts`](src/advice/reference.ts).
- The guided check reuses KB entries: a bump in a source's sound is matched to the **first** KB
  entry for that source whose cut range contains it, so entry order matters.
- After any change, run `npm run kb:review` and commit the regenerated
  `docs/kb-review.md`. A test fails if it's out of date. That file is what gets sent to
  experienced mixers for review.

### Deploying

Pushing to `main` runs the tests and build in GitHub Actions
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) and, if they pass, deploys to
GitHub Pages. A failing test blocks the deploy. Bump `version` in `package.json` for releases;
it's shown in Setup → Help and included in bug reports.

## License

[MIT](LICENSE)
