# Knowledge base sources and calibration

The EQ and compressor advice started as standard small-room live-sound practice. It was then
calibrated (October 2026) against four guides. The guides themselves aren't in the repo; this
file records what was taken from them and where the app deliberately differs, so a reviewer
can check the reasoning.

| Guide | Kind | Weight given |
|---|---|---|
| John Ko, *Sound Mixing: EQ Guide* (Standards and Best Practices) | Live worship mixing, per input | High: same setting as the app |
| John Ko, *Sound Mixing: Compressor Guide* | Live and recording compression | High for live advice |
| ProAudioDVDs, *EQ Chart & Cheat Sheet* | Instrument note ranges + named frequency zones | Medium: studio-oriented |
| ProAudioDVDs, *Compression Chart & Cheat Sheet* | Ratio ranges per instrument | Low for ratios (studio), useful for notes |

## What changed

### EQ (knowledge base and Reference charts)

| Source | Change | From |
|---|---|---|
| Vocals | Nasal range widened down to 500 Hz (was 800 Hz–1.5 kHz) | JK: "500 Hz – nasally" |
| Vocals | Sibilance range 5–10 kHz (was 5–8 kHz) | PA: sibilance 7–10 kHz |
| Vocals | Clarity range 1–5 kHz; thin range down to 120 Hz; air range from 5 kHz | JK: clarity 1–5k, breathy 5–10k; PA: fullness 120 Hz |
| Speech | Nasal entry now covers speakers too; "check the gain" fix for unclear speech | JK: speech harmonics 1k/500/250/125; "raise gain till loud and clear" |
| Acoustic | Boxy starts at 900 Hz (range 400 Hz–1.2 kHz), with a boost-sweep-cut hint | JK: "usually 900 Hz/1 kHz" |
| Acoustic | Dull boost at 12 kHz; buried boost 2–5 kHz | JK: sparkle 12k; PA: bite 2–4k |
| Acoustic | HPF lowered to 80 Hz (was 90), plus "solo guitar: lower or off" | JK: "disable HPF"; PA: low E is 82 Hz |
| Electric | Thin boost at 250 Hz; buried boost at 2.5 kHz (range 1–4 kHz); new **Dull** entry at 12 kHz | JK: warm 250–300, clarity 3k, air 12k; PA: bite 2–4k |
| Electric | HPF also explained as removing amp hum; "distortion" zone can be boosted for grit | PA: AC hum 40–50 Hz; JK: distortion 5–8k |
| Bass | No-definition adds a 2.5 kHz lift (helps fixed 3-band boards too); thin range 40–120 Hz; mud range to 500 Hz | JK: clarity 3k, low end 40–80; PA: strings 2.5k, boxiness 500 |
| Keys | Muddy starts at 250 Hz with a boost-sweep-cut hint; harsh range to 7.5 kHz; dull boost at 10 kHz | JK: "usually 250 Hz"; PA: shrillness 5–7.5k, sheen 10k |
| Kick | Boxy range 250–600 Hz with a sweep hint | JK: lower 250, sweep 500+; PA: boxiness 500 |
| Snare | Thin range from 120 Hz; boxy from 300 Hz; crack boost at 3.5 kHz; 45° mic placement | JK: warmth 250, crack 3–4k, 45°; PA: fatness 130, boxiness 300 |
| Toms | Boxy range from 250 Hz; dull range from 2 kHz; new **Thin** entry (120–240 Hz) | JK: lower 250; PA: fullness 120–240, snap 2k, stick 5k |
| Overheads | Harsh range to 6 kHz; dull boost at 12 kHz; phantom power check | JK hi-hat: piercing 3–4k, boost 12k, phantom; PA: overtones 2–6k |
| Reference tab | New **Notes played** bar per pitched source | PA: instrument/voice fundamental ranges |

### Compressor starting points

| Source | Change | From |
|---|---|---|
| Vocals | Attack 20–40 ms (was 10–20), release 150–300 ms, soft knee | JK: attack 25–50 ms, release 100 ms–1 s, soft knee |
| Speech | Attack 10–20 ms, soft knee | JK: 2:1 for smoothing mics |
| Acoustic | Attack 25–50 ms, release 150–300 ms, soft knee | JK: slow attack/release; PA: 2:1–4:1, gentle |
| Bass | Attack ~25 ms, release 200–500 ms, hard knee, slap note | JK: 4:1, 25 ms, ~500 ms, hard; PA: slap 4:1–10:1 |
| Electric | **New**: 3:1, ~25 ms, ~500 ms, only for clean parts | JK: raging electric 25 ms; PA: distorted "no need" |
| Keys | Slower attack (30–50 ms) | PA: piano, slow attack to bite through |
| Kick, snare | Release 25–100 ms, hard knee | JK: 25 ms / 25 ms, hard |
| Overheads | Own entry: ~25 ms attack, 1–2 s release | JK: cymbals fast attack, slow release, 2:1 |

The app shows the knee only for compressors with full controls.

## Where the app deliberately differs

- **High compression ratios.** The ProAudioDVDs sheet suggests 4:1–10:1 on kick, snare, toms,
  electric and piano. Those are studio "sound design" settings. In a small live room with
  volunteers, heavy compression mostly raises feedback risk and pumping, so the app stays at
  2:1–4:1 and caps the target at 6 dB of gain reduction.
- **Threshold numbers.** The JK compressor guide gives thresholds in dB/dBu. Every console's
  scale differs and the phone can't read it, so the app keeps "lower the threshold until the
  gain-reduction meter shows X dB."
- **HPF off on acoustic.** JK says to disable it. That suits a solo guitar, so the app says so,
  but with a bass player an HPF just under the low E still reduces mud and feedback, so that
  stays the default.
- **Boosting lows on kick and toms (40–80 Hz).** JK suggests it. Small rooms and small PA
  speakers turn that into boom, so the app only boosts kick thump at 60–80 Hz when it lacks
  punch, and cuts boom on toms.
- **Boosting highs on vocals in general.** Kept gentle and broad, and the app prefers cutting
  competing instruments, because boosting presence on a vocal mic increases feedback risk.
- **Hi-hat as its own source.** JK has a hi-hat row. Small rooms rarely mic the hat
  separately, so its advice is folded into Overheads / cymbals.
- **Not used:** recording-only advice (limiters for digital overload, side-chain), horns,
  saxophone, harmonica and mandolin (not sources in the app).
