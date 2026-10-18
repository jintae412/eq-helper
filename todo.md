# EQ Helper — Real-world checks & tuning

Things only a real iPhone, a real room, and a real band can verify. Work top to bottom; each
section says what to do, what "pass" looks like, and what to report back if it doesn't.

Before every session: open the app **from the home screen** (not Safari), make sure it's the
latest version (close and reopen it once or twice after a deploy), and keep the phone **at the
board** unless a step says otherwise.

---

## 0. Leftover from phase 0

- [ ] **Record → share sheet.** Listen tab → Start listening → type a label → Record → speak for
  5 s → Stop & save.
  - Pass: the iOS share sheet opens and you can AirDrop the file or Save to Files; the file plays back.
  - Report if: nothing happens, an error shows, or the file is silent/garbled.

---

## 1. Phase 3: mix balance (needs music through the PA, or a speaker)

- [ ] **Advice starts.** Listen → Full mix → Music → Responsiveness **Fast** → Start listening while
  music plays.
  - Pass: within ~10 s the status goes "first advice in about N s" → "Checking the mix…" → cards
    or "No balance issues right now."
  - Report if: **stuck on "first advice in…"** while music is clearly playing (the quiet-moment
    threshold is too strict for the iPhone mic). Tell me roughly how loud the room was.
- [ ] **Cards make sense.** Do the cards' frequencies match what you hear? Try the suggested fix
  and see if it helps.
  - Report: any card that was clearly wrong (title, frequency, and what it actually sounded like).
- [ ] **Low-end note.** If a card under 160 Hz shows, walk to the middle of the room and compare.
  - Report: whether the board and the middle of the room agreed.
- [ ] **Rooms.** Setup → Room → New room → name it → back to Listen. On a card, tap "Save to room
  as a known issue."
  - Pass: a "Before the service: known issues" card appears at the top of Mix balance, and it's
    still there after closing and reopening the app.
- [ ] **Reference.** When the mix sounds good, tap "This sounds good: save as music reference."
  Change the mix on purpose (e.g. turn the bass way up).
  - Pass: the panel says "Comparing to the music reference…" and a card about the change appears.
- [ ] **Speech mode.** Switch to Speech during a talk (or talk into a mic yourself).
  - Pass: the average restarts; any cards only mention the speaker's mic.
- [ ] **Steadiness.** Leave it on Normal for a full song.
  - Report if: cards flicker on and off, or feel too slow to be useful.

---

## 2. Phase 4: guided check (needs one band member at a time)

- [ ] **Capture fills.** Listen → Guided check → Start guided check → follow the prompt (all
  faders down except that person's) → Start listening to them.
  - Pass: the progress bar fills while they sing/play and the report appears.
  - Report if: **the bar stalls** even though they're clearly audible (soloed sources may need a
    lower quiet-moment threshold than full mix).
- [ ] **Reports make sense.** For each person: does the HPF / resonance advice match what you
  hear? Try one fix.
  - Report: anything clearly wrong, and anything obviously wrong that it *missed*.
- [ ] **Find it exactly.** On a card with that button: turn the channel down a little, boost the
  band +10 dB, sweep slowly.
  - Pass: "Loudest point right now" follows your knob and lands where it sounds worst.
- [ ] **Saved summary.** Finish the check, then open Guided check again.
  - Pass: each person shows "Last check (date): …" and it survives closing/reopening the app.
- [ ] **Ring-out (wedges only, optional).** Read the safety screen, tick the box, Start
  ring-out, raise one vocal mic's monitor send **slowly**.
  - Pass: it catches the first ring within about a second, shows the frequency + fix, and the red
    feedback banner does *not* appear during ring-out.
  - Report if: it misses rings, or flags things that weren't ringing.

---

## 3. Phase 5: compressor advice

- [ ] **Setup.** Setup → Channel compressor matches your mixer (digital: Full controls; analog:
  One COMP knob or None).
- [ ] **Guided check on a singer.** Ask them to sing a verse soft and a chorus loud.
  - Pass: a compressor card (or "Dynamics: fine") with steps that fit your mixer.
  - Report: the swing number it showed, and whether that singer actually needed compression.
    (Room echo can make the phone **under-read** the swing.)
- [ ] **Before/after.** Set the compressor as suggested → Redo that person.
  - Pass: "Swing was X dB, now Y dB ✓" with Y clearly lower.
- [ ] **Speech mode card.** During a talk, Listen → Full mix → Speech.
  - Pass: after ~10–15 s a "swings about N dB" card or nothing (if they're steady).

---

## 4. Recordings for tuning (phase 2b)

Record with the app's **Record** button (Listen tab), not Voice Memos. It records exactly
what the analysis sees. Put the label in the box before recording; it becomes the file name.

| # | What | Label to type | Length | Notes |
|---|---|---|---|---|
| 1 | Real feedback, deliberately, at **low volume** during setup | `feedback-vocal-wedge` | 10 s | Note roughly what frequency it was if the app showed one |
| 2 | Keys holding a pad chord | `keys-pad` | 10–15 s | Most likely false alarm |
| 3 | Singer holding a long note | `vocal-held-note` | 10 s | Second most likely false alarm |
| 4 | Each person soloed (faders down except theirs), singing/playing normally | `solo-<name>-<instrument>` | 15–20 s each | Say out loud at the start if it sounds off ("boxy", "boomy") |
| 5 | Full mix during a song | `mix-<song>` | 1–3 min | Say out loud what you hear as it happens ("acoustic is boomy now") |
| 6 | A sermon / talk | `speech-<speaker>` | 1–2 min | |
| 7 | Empty room with nothing playing | `room-silence` | 15 s | Sets the quiet-moment threshold |

- [ ] Recorded 1–7 (at least 1, 2, 3, and 7 matter most)
- [ ] Copied the WAVs into `fixtures/` in this repo (or sent them over)
- [ ] Wrote a line per file in `fixtures/NOTES.md`: label, what you heard, anything the app got wrong

---

## 5. Tuning (phase 2b, done together once recordings exist)

Each step replaces a guessed number with one measured from the recordings. Code locations are
marked with `ponytail:` comments.

1. [ ] **Fixture harness.** Decode WAVs in Node and run them through an FFT that matches the
   browser's `AnalyserNode` (Blackman window, dB scale), so tests can replay real audio.
2. [ ] **Feedback detector** (`src/analysis/feedback.ts`): must flag recording 1, must not flag
   2 and 3. Tune `minProminenceDb`, `minFrames`, `harmonicRangeDb`, `maxHarmonicRatio`. Add
   growth-rate to confidence.
3. [ ] **Quiet-moment threshold** (`GATE_DB` in `src/analysis/balance.ts`): set between
   recording 7 (silence) and the quietest soloed recording from 4. Consider a separate, lower
   threshold for guided capture.
4. [ ] **Balance findings** (`src/analysis/balance.ts`): replay recording 5; cards should match
   what was said out loud. Tune `BUMP_DB`, `HOLE_DB`, and the dark/bright tilt bounds.
5. [ ] **Solo analysis** (`src/analysis/sourceCheck.ts`): replay recordings 4; tune
   `SOLO_BUMP_DB` and `HPF_EXCESS_DB`.
6. [ ] **Compressor swing thresholds** (`COMPRESSOR_STARTS` in `src/advice/knowledgeBase.ts`):
   compare measured swing in 4 and 6 against which sources actually needed compression.
7. [ ] Each tuned value gets a regression test against its recording, then the `ponytail:`
   comment is removed or updated.

---

## 6. Report back

After a session, send:
- which boxes passed,
- for anything that didn't: what you did, what the app showed, what it sounded like,
- the recordings + `fixtures/NOTES.md` if you made any.
