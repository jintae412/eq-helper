import { describe, expect, it } from 'vitest';
import { BAND_CENTERS, BandAverager, findIssues, tiltDbPerOctave, toThirdOctaves } from './balance';

const BIN_HZ = 48_000 / 16_384;
const flat = (db = -30) => BAND_CENTERS.map(() => db);
const withBands = (base: number[], changes: Record<number, number>) =>
  base.map((db, i) => db + (changes[BAND_CENTERS[i]] ?? 0));
const opts = { hasKit: false, knownResonancesHz: [] as number[] };

describe('toThirdOctaves', () => {
  it('turns pink-like bins (−3 dB/octave per bin) into flat bands', () => {
    const db = Float32Array.from({ length: 8192 }, (_, i) => (i === 0 ? -Infinity : -40 - 10 * Math.log10(i * BIN_HZ)));
    const bands = toThirdOctaves(db, BIN_HZ);
    const spread = Math.max(...bands.slice(2)) - Math.min(...bands.slice(2));
    expect(spread).toBeLessThan(1.5);
  });
});

describe('BandAverager', () => {
  it('ignores quiet frames and keeps a rolling window', () => {
    const a = new BandAverager(2);
    expect(a.push(flat(-120))).toBe(false); // room is quiet
    a.push(flat(-30));
    a.push(flat(-20));
    a.push(flat(-20));
    expect(a.fill).toBe(1);
    expect(a.average()![5]).toBeCloseTo(-20);
  });
});

describe('findIssues (generic, vs the mix\'s own shape)', () => {
  it('finds a low-mid bump and reports its worst band', () => {
    const [f] = findIssues(withBands(flat(), { 200: 4, 250: 6, 315: 4 }), opts);
    expect(f).toMatchObject({ direction: 'bump', region: 'low-mid', freqHz: 250, lowConfidence: false });
  });

  it('flags a clarity hole but ignores dips elsewhere', () => {
    const found = findIssues(withBands(flat(), { 2500: -7, 630: -7 }), opts);
    expect(found.map((f) => [f.direction, f.freqHz])).toEqual([['dip', 2500]]);
  });

  it('never reports below 80 Hz and marks 80–160 Hz low-confidence', () => {
    expect(findIssues(withBands(flat(), { 63: 10 }), opts).filter((f) => f.freqHz === 63)).toEqual([]);
    expect(findIssues(withBands(flat(), { 125: 8 }), opts)[0]).toMatchObject({ freqHz: 125, lowConfidence: true });
  });

  it('with a real kit: drops cymbal brightness, flags low end as kit-affected', () => {
    const kit = { ...opts, hasKit: true };
    expect(findIssues(withBands(flat(), { 8000: 8 }), kit)).toEqual([]);
    expect(findIssues(withBands(flat(), { 125: 8 }), kit)[0].kitAffected).toBe(true);
  });

  it('badges known room resonances and ranks them higher', () => {
    const found = findIssues(withBands(flat(), { 250: 6, 3150: 6 }), { ...opts, knownResonancesHz: [250] });
    expect(found[0]).toMatchObject({ freqHz: 250, knownRoomIssue: true });
  });

  it('does not badge a dip at a known resonance', () => {
    const found = findIssues(withBands(flat(), { 250: 4 }), { ...opts, reference: withBands(flat(), { 250: 10 }), knownResonancesHz: [250] });
    expect(found[0]).toMatchObject({ direction: 'dip', freqHz: 250, knownRoomIssue: false });
  });

  it('measures a broad resonance at close to its real size', () => {
    // Roughly what a +9 dB, Q 1.4 peaking boost does to 1/3-octave bands.
    const [f] = findIssues(withBands(flat(), { 315: 3, 400: 6, 500: 9, 630: 6, 800: 3 }), opts);
    expect(f.freqHz).toBe(500);
    expect(f.deviationDb).toBeGreaterThan(7);
  });

  it('calls out a very dark mix', () => {
    const dark = BAND_CENTERS.map((f) => -30 - 9 * Math.log2(f / 1000));
    expect(tiltDbPerOctave(dark)).toBeCloseTo(-9);
    expect(findIssues(dark, opts).some((f) => f.direction === 'dark')).toBe(true);
  });
});

describe('findIssues (vs reference)', () => {
  it('compares shape only, in both directions, ignoring loudness', () => {
    const reference = flat(-30);
    const now = withBands(flat(-20), { 250: 4, 8000: -4 }); // 10 dB louder overall
    const found = findIssues(now, { ...opts, reference });
    expect(found.map((f) => [f.direction, f.freqHz]).sort()).toEqual([['bump', 250], ['dip', 8000]]);
  });
});
