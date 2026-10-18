export interface Spectrum {
  db: Float32Array; // AnalyserNode.getFloatFrequencyData output
  binHz: number; // sampleRate / fftSize
}

export interface Peak {
  freqHz: number;
  db: number;
  prominenceDb: number;
}

export interface FeedbackDetection {
  freqHz: number;
  db: number;
  durationFrames: number;
  confidence: number; // 0..1
}

export const DEFAULT_CONFIG = {
  minProminenceDb: 12,
  floorDb: -85,
  minFreqHz: 80,
  maxFreqHz: 12_000,
  neighborhoodOctaves: 1 / 6,
  matchOctaves: 1 / 24, // max pitch drift for "same peak"
  ignoreOctaves: 1 / 12, // width of a user "not feedback" dismissal
  minFrames: 8, // ~0.8s at 10 frames/s
  maxMissedFrames: 2,
  maxHarmonicRatio: 0.3, // >30% of frames had harmonic partners → musical note
  harmonicRangeDb: 20, // partners >20dB quieter are distortion, not an instrument
  maxDecayDb: 1.5,
};
export type FeedbackConfig = typeof DEFAULT_CONFIG;

const SILENT_DB = -160; // AnalyserNode reports -Infinity for silent bins
const octaves = (a: number, b: number) => Math.abs(Math.log2(a / b));

export function findPeaks(s: Spectrum, cfg: FeedbackConfig = DEFAULT_CONFIG): Peak[] {
  const { db, binHz } = s;
  const n = db.length;
  const prefix = new Float64Array(n + 1); // prefix sums → O(1) neighborhood averages
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + Math.max(db[i], SILENT_DB);

  const ratio = 2 ** cfg.neighborhoodOctaves;
  const first = Math.max(1, Math.ceil(cfg.minFreqHz / binHz));
  const last = Math.min(n - 2, Math.floor(cfg.maxFreqHz / binHz));
  const peaks: Peak[] = [];

  for (let i = first; i <= last; i++) {
    const v = db[i];
    if (v < cfg.floorDb || v < db[i - 1] || v <= db[i + 1]) continue; // local max only
    const lo = Math.floor(i / ratio);
    const hi = Math.min(n, Math.ceil(i * ratio) + 1);
    const skirtLo = Math.max(lo, i - 2); // exclude the peak's own skirt
    const skirtHi = Math.min(hi, i + 3);
    const count = skirtLo - lo + (hi - skirtHi);
    if (count <= 0) continue;
    const avg = (prefix[skirtLo] - prefix[lo] + prefix[hi] - prefix[skirtHi]) / count;
    if (v - avg >= cfg.minProminenceDb) peaks.push({ freqHz: i * binHz, db: v, prominenceDb: v - avg });
  }
  return peaks;
}

// ponytail: 2x/3x harmonic heuristic only; tune thresholds against recorded soundchecks
function hasHarmonicPartner(p: Peak, peaks: Peak[], cfg: FeedbackConfig): boolean {
  const targets = [2, 3].flatMap((k) => [p.freqHz * k, p.freqHz / k]);
  return peaks.some(
    (q) => q !== p && q.db >= p.db - cfg.harmonicRangeDb && targets.some((t) => octaves(q.freqHz, t) < cfg.matchOctaves),
  );
}

interface Track {
  freqHz: number; // anchored at first sighting so slow drift (vibrato) breaks the track
  firstDb: number;
  lastDb: number;
  frames: number;
  harmonicFrames: number;
  missed: number;
}

export class FeedbackDetector {
  private tracks: Track[] = [];
  private ignored: number[] = [];

  constructor(private readonly cfg: FeedbackConfig = DEFAULT_CONFIG) {}

  /** User tapped "that wasn't feedback". Session-scoped. */
  ignore(freqHz: number): void {
    this.ignored.push(freqHz);
    this.tracks = this.tracks.filter((t) => octaves(t.freqHz, freqHz) >= this.cfg.ignoreOctaves);
  }

  update(s: Spectrum): FeedbackDetection[] {
    const { cfg } = this;
    const peaks = findPeaks(s, cfg).filter((p) => !this.ignored.some((f) => octaves(f, p.freqHz) < cfg.ignoreOctaves));
    const seen = new Set<Track>();

    for (const p of peaks) {
      const harmonic = hasHarmonicPartner(p, peaks, cfg);
      const t = this.tracks.find((t) => !seen.has(t) && octaves(t.freqHz, p.freqHz) < cfg.matchOctaves);
      if (t) {
        t.lastDb = p.db;
        t.frames++;
        t.missed = 0;
        if (harmonic) t.harmonicFrames++;
        seen.add(t);
      } else {
        const nt: Track = { freqHz: p.freqHz, firstDb: p.db, lastDb: p.db, frames: 1, harmonicFrames: harmonic ? 1 : 0, missed: 0 };
        this.tracks.push(nt);
        seen.add(nt);
      }
    }

    for (const t of this.tracks) if (!seen.has(t)) t.missed++;
    this.tracks = this.tracks.filter((t) => t.missed <= cfg.maxMissedFrames);

    return this.tracks
      .filter(
        (t) =>
          t.missed === 0 &&
          t.frames >= cfg.minFrames &&
          t.harmonicFrames / t.frames <= cfg.maxHarmonicRatio &&
          t.lastDb >= t.firstDb - cfg.maxDecayDb,
      )
      .map((t) => ({
        freqHz: t.freqHz,
        db: t.lastDb,
        durationFrames: t.frames,
        // ponytail: duration-only confidence; add growth rate once we have real recordings
        confidence: Math.min(1, t.frames / (cfg.minFrames * 2)),
      }));
  }
}
