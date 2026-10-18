# EQ Helper — Development Plan

What we're building and why lives in [docs/SPEC.md](docs/SPEC.md). This file is **how and in
what order**: workflow, phases, task checklists, exit criteria, and known debt.

---

## 1. Development workflow

### Branching & review
- Solo project: commit straight to `main`, no feature branches or PRs.
- Every push to `main` runs tests + typecheck + build first; a failure blocks the deploy, so
  a broken build never reaches friends. Still run `npm test` locally before pushing.
- Commits: imperative subject (`Add mixer translator`), body explains *why* when it isn't obvious.

### CI/CD (`.github/workflows/deploy.yml`)
- `test` job: on every push and PR → `npm ci`, `npm test`, `npm run build` (includes `tsc`).
- `deploy` job: only on push to `main`, after `test` passes → GitHub Pages.

### Testing strategy
| Layer | How it's tested |
|---|---|
| `analysis/`, `advice/`, `storage/` (pure) | Vitest unit tests with synthetic data. Required for any branch/loop logic. |
| Knowledge base | Invariant tests: every move inside its range, sane gain/Q, unique ids, unique (source, symptom) pairs, non-empty "why" |
| Detection thresholds | Regression tests against recorded WAV fixtures (`fixtures/`), from phase 2 on |
| `audio/`, UI | Manual checklist on a real iPhone (installed from home screen) + Mac Safari each phase |

### Per-phase manual checklist (real iPhone, home-screen install)
1. Launches, and launches again in airplane mode (offline).
2. Mic starts on tap; settings readout still shows `echoCancellation: false`.
3. New feature works with real audio / real use.
4. Data survives closing and reopening the app.

### Conventions
- Pure code never imports browser APIs. Browser-coupled code stays in `src/audio/` and `src/ui/`.
- Deliberate shortcuts get a `ponytail:` comment naming the limit and the upgrade path.
- Saved data is versioned; schema changes ship with a migration and a test for it.
- Audio never leaves the device. No analytics, no network calls besides loading the app.

---

## 2. Phases

Status key: ✅ done · 🚧 in progress · ⬜ not started

### ✅ Phase 0 — Platform test
Goal: prove a free PWA can do the job on an iPhone.

- [x] Vite + React + TS PWA, offline via service worker
- [x] GitHub Pages deploy workflow
- [x] Mic capture with browser processing off; applied-settings readout
- [x] Live spectrum view
- [x] Feedback detector (pure) + tests, live markers + "That wasn't feedback"
- [x] WAV recorder via AudioWorklet + share/download
- [x] Verified on iPhone: home-screen install, offline launch, `echoCancellation: false`, AGC off (tone-step test)
- [ ] Verify Record → share sheet on iPhone
- [ ] Collect fixtures (see SPEC: feedback event, keys pad, held vocal note, soloed channels, full mix)

### ✅ Phase 1 — Ask mode (no audio needed)
Goal: pick a source + symptom (or search), get advice translated to *your* mixer.

- [x] Mixer profiles: generic presets (3-band, sweepable mid, dual sweepable mid, digital parametric), fully editable
- [x] Translator: ideal EQ move → instruction for this mixer (exact / closest / unreachable), HPF moves
- [x] Knowledge base v1 (~40 entries) with invariant tests
- [x] Answer builder: Do this / Or try / Why / usual range; "Or try" first when unreachable
- [x] Versioned localStorage with validation, per-item recovery, raw-data backup on failure
- [x] Bottom tabs: Listen / Ask / Setup (Listen stays mounted so the mic keeps running)
- [x] Setup: mixer profile editor, band setups (sources with optional mic type)
- [x] CI runs tests on PRs
- [x] Manual iPhone checklist after deploy
- **Exit:** useful with zero audio; manual checklist passes
- **Later gate (before sharing widely):** experienced mixer reviews every knowledge base entry

### ✅ Phase 2 — Feedback in full-mix mode
Goal: catch real feedback fast, tell them exactly what to do with *their* gear.

- [x] Schema v2: rig outputs on the mixer profile (monitor type, graphic EQ on mains / monitors, parametric EQ on outputs); v1→v2 migration + test. Lives on the mixer profile because bands bring their own gear; move to rooms if venue PAs turn out common.
- [x] Gear-aware feedback steps: likely culprit (frequency range + band mic types, e.g. "Pastor Mike (headset)") → diagnostic → fix on available EQ (output PEQ → GEQ slider → channel EQ)
- [x] Non-blocking red banner on **every** tab: frequency, culprit, first step (more on tap); "Got it" hides until it recurs, "Not feedback" ignores for the session; auto-clears ~3 s after ringing stops
- [x] Session-only feedback log on Listen: recurring frequencies get a "fix before next service" suggestion
- [x] No sensitivity setting: one tuned value
- [x] Manual iPhone checklist (a steady tone into the mic, e.g. a 2.5 kHz test tone from another phone, triggers the banner on any tab)
- **Exit:** synthetic tests pass; manual iPhone checklist passes

### ⬜ Phase 2b — Detector tuning (needs recordings)
Deferred until fixtures exist (feedback event, keys pad, held vocal note).

- [ ] Fixture harness: decode WAV in Node → FFT matching `AnalyserNode` (Blackman window, dB) → run detector
- [ ] Tune thresholds (`harmonicRangeDb`, prominence, frames) until it catches recorded feedback and ignores recorded pads/held notes
- [ ] Confidence that uses growth rate, not just duration
- **Exit:** passes fixture regression; tested live at one soundcheck

### ✅ Phase 3 — Tonal balance + rooms (built; iPhone check pending)
- [x] 1/3-octave band power (63 Hz–12.5 kHz), rolling average with a silence gate
- [x] Generic mode: deviation of each band from the mix's *own* trend (robust to phone mic + room); dips only flagged in the clarity range; wide-tolerance dark/bright tilt check
- [x] Reference mode: shape vs the room's saved reference (level-normalized), ±3 dB, both directions
- [x] Nothing below 80 Hz; 80–160 Hz findings marked low-confidence with a visible explanation (phone mic roll-off, board ≠ room)
- [x] Real kit in band → drop brightness findings above 5 kHz, low-confidence low end, with a note (cajón / e-kit don't count)
- [x] Responsiveness: Steady / Normal / Fast (window 30/15/8 s, confirmations 3/2/1); saved per device
- [x] Stability: card appears after N confirmations, clears after N clean checks, then moves to an "Earlier this session" log
- [x] Cards: top issue + two secondary; channel fixes on likely suspects from the band first, main EQ fallback
- [x] Music / Speech toggle; separate reference per mode per room
- [x] Room profiles (schema v3): name, known resonances ("Save to room"), references; pre-service "known issues" card; known issues confirm faster and are badged
- [x] "This sounds good — save as reference" with a keep-the-phone-at-the-board reminder
- [ ] Manual iPhone check (real mic, real music): watch for the status sticking on "first advice in…" (silence gate too strict)
- **Exit:** synthetic tests pass; manual iPhone check; later: advice on recorded full-mix fixtures matches the spoken notes in them

### ✅ Phase 4 — Guided per-channel check (built; iPhone check pending)
- [x] Mode toggle inside the Listen tab: Full mix / Guided check (no extra tab); full-mix balance pauses while guided
- [x] Walks the active band's sources in order (Skip / Redo); no band → pick a source type for a one-off
- [x] Prompt: "pull every fader down except X" (PFL/solo goes to headphones, not the PA, so the phone can't hear it)
- [x] Capture length slider (8–30 s, default 15, saved); quiet moments don't count; "can't hear anything" hint
- [x] Per-source analysis: bumps vs the source's own shape → that source's knowledge base entry whose range contains the bump (fallback: generic narrow cut); excess energy below the source's useful range → HPF advice; same low-end confidence rules as phase 3
- [x] "Find it exactly": boost-and-sweep only here, with a turn-it-down-first warning; the app follows the loudest point while sweeping (sweepable/parametric boards only)
- [x] Summary saved per person on the band setup with a date (schema v4); "Last check" shown next time
- [x] Optional, skippable ring-out (wedges / not sure only): safety confirmation → per vocal mic, raise the monitor send until it rings → frequency + monitor fix → repeat up to 4 rings; feedback banner hidden during ring-out only
- [ ] Manual iPhone check (real band at soundcheck)
- **Exit:** synthetic tests pass; manual iPhone check; later: soloed-channel fixtures produce sensible per-source advice

### ⬜ Phase 5 — Compressor advice
- [ ] Mixer profile: per-channel compressor capability (schema bump + migration)
- [ ] Dynamics on soloed channels (crest factor, level variance) → threshold / ratio / attack / release suggestions with "why"
- **Exit:** reviewed by the experienced mixer

### ⬜ Phase 6 — Ready for friends
- [ ] Knowledge base review complete
- [ ] PNG icons (180 px apple-touch-icon, 192/512 manifest)
- [ ] "How to install" page with screenshots (Safari → Share → Add to Home Screen)
- [ ] Accessibility pass (contrast, tap targets, VoiceOver labels)
- [ ] Small friends beta, collect feedback

---

## 3. Known debt / backlog
- `npm audit`: critical/moderate advisories in Vitest's tinypool/mocker (dev-only, not shipped).
  Fix: upgrade local Node to 22 LTS → Vitest 5 + Vite 7.
- iOS home-screen icon is SVG only (phase 6).
- Recorder buffers in memory (~11 MB/min); stream to IndexedDB if long recordings are needed.
- Feedback harmonic check is a 2×/3× heuristic; thresholds are guesses until fixtures exist.
- Full-mix Ask answers assume a main graphic EQ until phase 2 adds output gear to profiles.
- Shared vocal entries show both male/female hints (e.g. HPF note); split if it confuses people.

- Balance trend uses a median of ±4 neighbors (found in phase 4: a mean hid half of a broad resonance; skipping shoulders flagged steep roll-offs). Re-check against fixtures.
- Solo capture reuses the full-mix silence gate (−45 dBFS); a quiet soloed source might never fill the capture. Tune with soloed fixtures.

## 4. Open questions
- Which exact mixers/monitor setups do bands use? (Generic presets cover it for now.)
- Auto-detect speech vs music, or keep the manual toggle? (Manual for v1.)
