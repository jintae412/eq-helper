import { GATE_DB } from './balance';

const SILENT_DB = -160;
const LO_HZ = 60;
const HI_HZ = 14_000;

/** Overall level of one spectrum frame (60 Hz–14 kHz), in dB. */
export function frameLevelDb(db: Float32Array, binHz: number): number {
  const lo = Math.max(1, Math.ceil(LO_HZ / binHz));
  const hi = Math.min(db.length - 1, Math.floor(HI_HZ / binHz));
  let sum = 0;
  for (let i = lo; i <= hi; i++) sum += 10 ** (Math.max(db[i], SILENT_DB) / 10);
  return sum > 0 ? 10 * Math.log10(sum) : SILENT_DB;
}

/** How far the level swings while performing: loud passages (95th pct) minus soft ones (10th pct). */
export function dynamicRangeDb(levelsDb: number[]): number {
  const sorted = [...levelsDb].sort((a, b) => a - b);
  const at = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
  return at(0.95) - at(0.1);
}

/** Need a few seconds of sound before a swing number means anything. */
export const MIN_LEVEL_SAMPLES = 30;

/** Rolling window of active (non-silent) frame levels. Pauses are skipped, not counted as "soft". */
export class LevelWindow {
  private levels: number[] = [];

  constructor(private maxSamples: number) {}

  setMaxSamples(n: number): void {
    this.maxSamples = n;
    this.levels = this.levels.slice(-n);
  }

  push(levelDb: number): void {
    if (levelDb < GATE_DB) return;
    this.levels.push(levelDb);
    if (this.levels.length > this.maxSamples) this.levels.shift();
  }

  swingDb(): number | null {
    return this.levels.length >= MIN_LEVEL_SAMPLES ? dynamicRangeDb(this.levels) : null;
  }

  clear(): void {
    this.levels = [];
  }
}
