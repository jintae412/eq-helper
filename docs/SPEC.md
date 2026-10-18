# EQ Helper — Spec

A free, offline tool that listens through a phone/laptop mic during soundcheck and live
worship services and tells the person at the mixer what to EQ, where, by how much, and why.

## Users & setting

- One sound person at a mixer, mostly church/worship. Speaker (often a headset mic) plus a
  small band: vocals, acoustic, sometimes keys / electric / bass / drums (cajón, e-kit, or real kit).
- Rooms vary and are unpredictable. Bands usually bring their own mixer.
- Little or no internet at the venue.
- Users can handle Hz and dB values, but advice must map onto *their* mixer's actual knobs.
- Friends are not technical. Must be free to build, host, and install.

## Platform decision

**PWA hosted on GitHub Pages.** Vite + React + TypeScript, Vitest, `vite-plugin-pwa`.

| Considered | Rejected because |
|---|---|
| Native iOS (free account) | Builds expire every 7 days; needs Xcode per device |
| Native iOS (TestFlight) | $99/yr |
| Native macOS (unsigned) | No iPhone; Gatekeeper friction |

Costs of this choice:
- No Apple Foundation Models (native-only). The lookup table is the sole source of advice.
- Browser mic constraints (`autoGainControl: false` etc.) may be ignored. **Phase 0 verifies.**
  If AGC can't be disabled, absolute-level advice is untrustworthy; relative analysis
  (feedback, peaks vs neighbours, drift from a reference) still works.

Audio never leaves the device. No analytics, no backend.

## Architecture

```
ui/          React screens: FullMix, GuidedCheck, Ask, Setup
audio/       the ONLY browser-coupled code: mic capture, AnalyserNode, WAV recorder
analysis/    PURE: spectrum → findings (feedback, tonal balance, per-channel profile)
advice/      PURE: knowledge base (typed data), findings → EQ moves → mixer instructions
storage/     localStorage: rooms, bands, mixer profiles
```

`analysis/` and `advice/` take plain arrays/data and return plain data — no DOM, no Web
Audio. Tested with synthetic spectra and with recorded soundchecks (`fixtures/`).

## Data model

- **MixerProfile** — what EQ controls a given board has, per channel and per output.
  Presets: 3-band analog (fixed), 4-band with sweepable mid, full parametric (digital).
  Plus: HPF yes/no + frequency, graphic EQ on mains/monitors, parametric EQ on outputs.
  Users save named ones ("Our Yamaha MG10", "Church X32").
- **RoomProfile** — the venue: label, known resonances (`[{freqHz, note}]`, promoted from
  findings via "Save to room"), optional reference spectrum ("this sounds good" snapshot),
  monitor type (wedges / IEM / none).
- **BandSetup** — who's playing: `[{label, type, mic?}]`; mic is optional
  (handheld dynamic, headset, condenser, DI).
- **Session** (in memory) — Room + Band + MixerProfile (chosen per session, since bands bring
  their own) + session-scoped dismissals ("that wasn't feedback").

## Modes

1. **Full mix** (essential; works with zero setup time)
   - Feedback detection → full-screen red takeover with diagnostic + fix steps adapted to gear.
   - Tonal balance → top issue card + two smaller cards. Compares to the room's reference
     snapshot if one exists, otherwise a generic curve. Lower confidence when a real kit is
     in the band.
   - Music / Speech toggle (sermon = headset mic, different target, highest feedback risk).
2. **Guided check** — "solo the vocal, sing a verse" → per-channel advice. The only mode
   that may suggest boost-and-sweep (narrow boost, sweep to find the bad frequency, then cut)
   because doing that live risks feedback and the congregation hears it.
3. **Ask** — pick source chip + symptom chip (plus search over synonyms) → lookup table
   answer translated to the session's mixer profile.

## Advice rules

- Every recommendation: what source, frequency (Hz, with a range), cut/boost amount,
  Q where the mixer supports it, non-EQ alternatives (HPF, mic position), and *why*.
- Prefer cuts over boosts; prefer cutting competitors over boosting the thing that's buried.
- When the mixer can't reach the frequency (e.g. 300 Hz mud on a fixed 3-band board), say so
  and fall back to HPF / mic placement / main graphic EQ.
- Feedback: app hears a frequency, not a channel. Advice = likely culprit by frequency range
  and mic type → diagnostic ("lower its monitor send; stopped? it's the monitor") → fix on
  whatever EQ exists (output PEQ → graphic EQ slider → channel EQ).
- Knowledge base entries must be reviewed by someone with live mixing experience before v1.

## Feedback detection (summary)

A peak is feedback if it is narrow (≥12 dB above its ±1/6-octave neighbourhood), persists
≥~0.8 s, holds pitch within 1/24 octave, isn't decaying, and has no 2×/3× harmonic partners
(musical notes do). User can dismiss false alarms per session. Thresholds will be tuned on
recordings. See `src/analysis/feedback.ts`.

## Phases

| # | Scope | Exit criteria |
|---|---|---|
| 0 | PWA shell, mic → live spectrum, `getSettings()` readout, WAV recorder, offline install | Runs installed + offline on a real iPhone; we know whether AGC is really off; fixtures recorded |
| 1 | Ask mode: knowledge base, mixer profiles, translator, setup screens | Useful with no audio at all |
| 2 | Feedback detection in full-mix mode + gear-aware advice | Catches recorded feedback, ignores recorded pads/held notes |
| 3 | Tonal balance + room reference snapshots + Music/Speech | |
| 4 | Guided per-channel check | |
| 5 | Compressor advice on soloed channels | |

## Fixtures to record (phase 0 Record button, not Voice Memos)

1. A real feedback event (deliberate, low volume, during setup)
2. Keys pad held ~10 s
3. Singer holding a long note
4. Each channel soloed
5. A few minutes of full mix with spoken notes ("acoustic is boomy right now")
