import { describe, expect, it } from 'vitest';
import { FeedbackDetector, type Spectrum } from './feedback';

const BIN_HZ = 48_000 / 16_384;
const N = 8192;

// Deterministic noise floor around -90..-84 dB with peaks (and a -6dB skirt) added.
function frame(peaks: [freqHz: number, db: number][], seed: number): Spectrum {
  let x = seed;
  const db = Float32Array.from({ length: N }, () => {
    x = (x * 1664525 + 1013904223) % 2 ** 32;
    return -90 + (x / 2 ** 32) * 6;
  });
  for (const [f, level] of peaks) {
    const i = Math.round(f / BIN_HZ);
    db[i] = level;
    db[i - 1] = db[i + 1] = level - 6;
  }
  return { db, binHz: BIN_HZ };
}

const run = (d: FeedbackDetector, frames: number, peaks: (i: number) => [number, number][]) => {
  let out = d.update(frame(peaks(0), 1));
  for (let i = 1; i < frames; i++) out = d.update(frame(peaks(i), i + 1));
  return out;
};

describe('FeedbackDetector', () => {
  it('flags a sustained pure tone after minFrames', () => {
    const d = new FeedbackDetector();
    expect(run(d, 7, () => [[2500, -30]])).toEqual([]);
    const out = d.update(frame([[2500, -30]], 99));
    expect(out).toHaveLength(1);
    expect(Math.abs(out[0].freqHz - 2500)).toBeLessThan(BIN_HZ);
  });

  it('ignores a held keys note with harmonics', () => {
    expect(run(new FeedbackDetector(), 12, () => [[220, -35], [440, -40], [660, -45]])).toEqual([]);
  });

  it('ignores a decaying note (strum / piano)', () => {
    expect(run(new FeedbackDetector(), 12, (i) => [[1000, -30 - i]])).toEqual([]);
  });

  it('respects a user dismissal', () => {
    const d = new FeedbackDetector();
    d.ignore(2500);
    expect(run(d, 12, () => [[2500, -30]])).toEqual([]);
  });

  it('survives silent (-Infinity) bins', () => {
    const d = new FeedbackDetector();
    const silent = (): Spectrum => ({ db: new Float32Array(N).fill(-Infinity), binHz: BIN_HZ });
    for (let i = 0; i < 12; i++) expect(d.update(silent())).toEqual([]);
  });
});
