// Tonal balance of the whole mix: 1/3-octave bands, averaged over seconds, compared either to
// the mix's own overall shape (generic) or to a saved "this sounded good" reference.

export const BAND_CENTERS = [63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800,
  1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500];

const EDGE = 2 ** (1 / 6);
const SILENT_DB = -160;
const toLinear = (db: number) => 10 ** (Math.max(db, SILENT_DB) / 10);
const toDb = (p: number) => (p > 0 ? 10 * Math.log10(p) : SILENT_DB);

/** Band power (sum of bin powers) per 1/3 octave. Pink noise comes out flat. */
export function toThirdOctaves(db: Float32Array, binHz: number): number[] {
  return BAND_CENTERS.map((fc) => {
    const lo = Math.max(1, Math.ceil(fc / EDGE / binHz));
    const hi = Math.min(db.length - 1, Math.floor((fc * EDGE) / binHz));
    let sum = 0;
    for (let i = lo; i <= hi; i++) sum += toLinear(db[i]);
    return toDb(sum);
  });
}

export type BalanceSpeed = 'steady' | 'normal' | 'fast';

export const BALANCE_SPEEDS: Record<BalanceSpeed, { label: string; windowS: number; evalS: number; confirmations: number }> = {
  steady: { label: 'Steady', windowS: 30, evalS: 5, confirmations: 3 },
  normal: { label: 'Normal', windowS: 15, evalS: 5, confirmations: 2 },
  fast: { label: 'Fast', windowS: 8, evalS: 3, confirmations: 1 },
};

export const FRAMES_PER_SECOND = 2;

// ponytail: fixed gate in dBFS; tune against recordings (phone at the board during music vs. empty room)
export const GATE_DB = -45;

/** Rolling average of band power; skips quiet frames so pauses don't drag the average around. */
export class BandAverager {
  private frames: number[][] = [];

  constructor(private maxFrames: number) {}

  setMaxFrames(n: number): void {
    this.maxFrames = n;
    this.frames = this.frames.slice(-n);
  }

  push(bandsDb: number[]): boolean {
    const linear = bandsDb.map(toLinear);
    if (toDb(linear.reduce((a, b) => a + b, 0)) < GATE_DB) return false;
    this.frames.push(linear);
    if (this.frames.length > this.maxFrames) this.frames.shift();
    return true;
  }

  /** 0..1: how full the window is. */
  get fill(): number {
    return Math.min(1, this.frames.length / this.maxFrames);
  }

  average(): number[] | null {
    if (this.frames.length === 0) return null;
    return BAND_CENTERS.map((_, b) => toDb(this.frames.reduce((sum, f) => sum + f[b], 0) / this.frames.length));
  }

  clear(): void {
    this.frames = [];
  }
}

// ── Findings ────────────────────────────────────────────────────────────────

export type Region = 'low' | 'low-mid' | 'mid' | 'upper-mid' | 'presence' | 'high' | 'overall';
export type Direction = 'bump' | 'dip' | 'dark' | 'bright';

export interface BalanceFinding {
  direction: Direction;
  region: Region;
  freqHz: number; // band center of the worst point (0 for tilt findings)
  deviationDb: number; // signed; dB/octave for tilt findings
  lowConfidence: boolean;
  kitAffected: boolean;
  knownRoomIssue: boolean;
  score: number;
}

export interface FindOptions {
  reference?: number[];
  hasKit: boolean;
  knownResonancesHz: number[];
}

export const MIN_ANALYSIS_HZ = 80;
export const LOW_CONFIDENCE_BELOW_HZ = 160;
const BUMP_DB = 4;
const HOLE_DB = 5;
const REF_TOLERANCE_DB = 3;
const TREND_REACH = 4; // ±4/3 octave of neighbors
// ponytail: tilt bounds are guesses for 1/3-octave band power at the board; tune with fixtures
const DARK_SLOPE = -7;
const BRIGHT_SLOPE = 1;
const KNOWN_OCTAVES = 1 / 6;

export function regionOf(freqHz: number): Region {
  if (freqHz < 160) return 'low';
  if (freqHz < 500) return 'low-mid';
  if (freqHz < 1000) return 'mid';
  if (freqHz < 1600) return 'upper-mid';
  if (freqHz <= 5000) return 'presence';
  return 'high';
}

/**
 * Each band minus the MEDIAN of its ±4 neighbors (±4/3 octave): +6 = bump, −6 = hole.
 * Median, not mean: a broad resonance lifts its own shoulders, and an average would hide about
 * half of it; a median shrugs off those shoulders yet stays put on a smooth roll-off.
 */
export function deviationsFromTrend(bandsDb: number[], reach = TREND_REACH): number[] {
  return bandsDb.map((db, i) => {
    const neighbors = bandsDb.filter((_, j) => j !== i && Math.abs(j - i) <= reach).sort((a, b) => a - b);
    const mid = neighbors.length / 2;
    const median = neighbors.length % 2 ? neighbors[Math.floor(mid)] : (neighbors[mid - 1] + neighbors[mid]) / 2;
    return db - median;
  });
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Shape difference vs reference, ignoring overall loudness. */
export function deviationsFromReference(bandsDb: number[], reference: number[], fromIndex: number): number[] {
  const b = bandsDb.slice(fromIndex);
  const r = reference.slice(fromIndex);
  const mb = mean(b);
  const mr = mean(r);
  return [...Array(fromIndex).fill(0), ...b.map((x, i) => x - mb - (r[i] - mr))];
}

/** Least-squares slope in dB per octave over [loHz, hiHz]. */
export function tiltDbPerOctave(bandsDb: number[], loHz = 250, hiHz = 8000): number {
  const pts = BAND_CENTERS.map((f, i) => [Math.log2(f), bandsDb[i]] as const).filter(([x]) => x >= Math.log2(loHz) && x <= Math.log2(hiHz));
  const mx = mean(pts.map(([x]) => x));
  const my = mean(pts.map(([, y]) => y));
  const num = pts.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0);
  const den = pts.reduce((s, [x]) => s + (x - mx) ** 2, 0);
  return num / den;
}

export function findIssues(bandsDb: number[], opts: FindOptions): BalanceFinding[] {
  const first = BAND_CENTERS.findIndex((f) => f >= MIN_ANALYSIS_HZ);
  const useRef = opts.reference !== undefined && opts.reference.length === BAND_CENTERS.length;
  const dev = useRef ? deviationsFromReference(bandsDb, opts.reference!, first) : deviationsFromTrend(bandsDb);

  const flagged = (i: number): Direction | null => {
    const d = dev[i];
    if (useRef) return d >= REF_TOLERANCE_DB ? 'bump' : d <= -REF_TOLERANCE_DB ? 'dip' : null;
    if (d >= BUMP_DB) return 'bump';
    // Without a reference, only clarity holes are worth acting on.
    return d <= -HOLE_DB && regionOf(BAND_CENTERS[i]) === 'presence' ? 'dip' : null;
  };

  // Group consecutive flagged bands of the same direction; report the worst band of each group.
  const groups: { direction: Direction; worst: number }[] = [];
  for (let i = first; i < BAND_CENTERS.length; i++) {
    const d = flagged(i);
    if (!d) continue;
    const last = groups.at(-1);
    if (last && last.direction === d && flagged(i - 1) === d) {
      if (Math.abs(dev[i]) > Math.abs(dev[last.worst])) last.worst = i;
    } else {
      groups.push({ direction: d, worst: i });
    }
  }

  const findings: BalanceFinding[] = [];
  for (const g of groups) {
    const freqHz = BAND_CENTERS[g.worst];
    const region = regionOf(freqHz);
    if (opts.hasKit && region === 'high' && g.direction === 'bump') continue; // cymbals, not the mix
    const lowConfidence = freqHz < LOW_CONFIDENCE_BELOW_HZ;
    const kitAffected = opts.hasKit && region === 'low';
    // A known resonance is a buildup; a dip at the same frequency is a different problem.
    const knownRoomIssue = g.direction === 'bump' && opts.knownResonancesHz.some((k) => Math.abs(Math.log2(k / freqHz)) <= KNOWN_OCTAVES);
    const score = Math.abs(dev[g.worst]) * (lowConfidence ? 0.5 : 1) * (knownRoomIssue ? 1.5 : 1);
    findings.push({ direction: g.direction, region, freqHz, deviationDb: dev[g.worst], lowConfidence, kitAffected, knownRoomIssue, score });
  }

  if (!useRef) {
    const slope = tiltDbPerOctave(bandsDb);
    if (slope < DARK_SLOPE) {
      findings.push(tilt('dark', slope, (DARK_SLOPE - slope) * 2));
    } else if (slope > BRIGHT_SLOPE && !opts.hasKit) {
      findings.push(tilt('bright', slope, (slope - BRIGHT_SLOPE) * 2));
    }
  }
  return findings.sort((a, b) => b.score - a.score);
}

const tilt = (direction: 'dark' | 'bright', slope: number, score: number): BalanceFinding => ({
  direction, region: 'overall', freqHz: 0, deviationDb: slope, lowConfidence: false, kitAffected: false, knownRoomIssue: false, score,
});
