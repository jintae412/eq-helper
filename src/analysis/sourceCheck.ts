import { BAND_CENTERS, findIssues, MIN_ANALYSIS_HZ, type BalanceFinding } from './balance';

export interface SoloAnalysis {
  bumps: BalanceFinding[]; // worst first
  /** Average level below the cutoff minus the source's "body" level above it; null when not checked. */
  lowVsBodyDb: number | null;
  needsHpf: boolean;
}

// A single instrument is naturally lumpier than a full mix, so demand a bigger bump.
const SOLO_BUMP_DB = 5;
// ponytail: guess; a clean vocal sits >10 dB below its body under 100 Hz. Tune with soloed fixtures.
const HPF_EXCESS_DB = -6;

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Analyze one soloed source's averaged 1/3-octave bands. */
export function analyzeSolo(bandsDb: number[], hpfCutoffHz?: number): SoloAnalysis {
  const bumps = findIssues(bandsDb, { hasKit: false, knownResonancesHz: [] })
    .filter((f) => f.direction === 'bump' && f.deviationDb >= SOLO_BUMP_DB);

  if (!hpfCutoffHz) return { bumps, lowVsBodyDb: null, needsHpf: false };
  const low = BAND_CENTERS.flatMap((f, i) => (f >= MIN_ANALYSIS_HZ && f < hpfCutoffHz ? [bandsDb[i]] : []));
  const body = BAND_CENTERS.flatMap((f, i) => (f >= hpfCutoffHz * 2 && f <= hpfCutoffHz * 8 ? [bandsDb[i]] : []));
  if (low.length === 0 || body.length === 0) return { bumps, lowVsBodyDb: null, needsHpf: false };
  const lowVsBodyDb = mean(low) - mean(body);
  // A big low bump would be advised twice (bump + HPF); the HPF advice covers it.
  const needsHpf = lowVsBodyDb > HPF_EXCESS_DB;
  return { bumps: needsHpf ? bumps.filter((b) => b.freqHz >= hpfCutoffHz) : bumps, lowVsBodyDb, needsHpf };
}
