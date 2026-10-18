import { describe, expect, it } from 'vitest';
import { BAND_CENTERS } from './balance';
import { analyzeSolo } from './sourceCheck';
import { PeakFollower } from './sweep';

// A plausible vocal: rolls off 12 dB/octave below 150 Hz and 6 dB/octave above 3 kHz.
const vocal = (changes: Record<number, number> = {}) =>
  BAND_CENTERS.map((f) => -30 - 12 * Math.max(0, Math.log2(150 / f)) - 6 * Math.max(0, Math.log2(f / 3000)) + (changes[f] ?? 0));

describe('analyzeSolo', () => {
  it('finds a resonance that sticks out of the source\'s own shape', () => {
    const { bumps, needsHpf } = analyzeSolo(vocal({ 400: 5, 500: 8, 630: 5 }), 100);
    expect(needsHpf).toBe(false);
    expect(bumps[0]).toMatchObject({ freqHz: 500, region: 'mid' });
  });

  it('does not mistake a steep low roll-off (e.g. HPF on) for a bump', () => {
    const hpfOn = BAND_CENTERS.map((f) => -30 - 24 * Math.max(0, Math.log2(150 / f)));
    expect(analyzeSolo(hpfOn, 100).bumps).toEqual([]);
  });

  it('ignores small natural lumps', () => {
    expect(analyzeSolo(vocal({ 1000: 4 }), 100).bumps).toEqual([]);
  });

  it('asks for the HPF when there is rumble under the voice, without double-advising it as a bump', () => {
    const rumbly = vocal({ 80: 30 });
    const a = analyzeSolo(rumbly, 120);
    expect(a.needsHpf).toBe(true);
    expect(a.bumps.some((b) => b.freqHz < 120)).toBe(false);
  });

  it('skips the HPF check for sources that need their lows', () => {
    expect(analyzeSolo(vocal({ 80: 30 })).lowVsBodyDb).toBeNull();
  });
});

describe('PeakFollower', () => {
  const BIN_HZ = 48_000 / 16_384;
  const spectrumWithPeak = (hz: number) => {
    const db = new Float32Array(8192).fill(-90);
    const i = Math.round(hz / BIN_HZ);
    for (let k = -2; k <= 2; k++) db[i + k] = -40;
    return db;
  };

  it('tracks the loudest point in range and moves with the sweep', () => {
    const p = new PeakFollower(200, 1000, 1); // no smoothing for the test
    expect(Math.abs(p.update(spectrumWithPeak(310), BIN_HZ) - 310)).toBeLessThan(310 * 0.03);
    expect(Math.abs(p.update(spectrumWithPeak(700), BIN_HZ) - 700)).toBeLessThan(700 * 0.03);
  });

  it('ignores peaks outside the range', () => {
    const p = new PeakFollower(200, 400, 1);
    const db = spectrumWithPeak(3000);
    db[Math.round(300 / BIN_HZ)] = -70;
    expect(Math.abs(p.update(db, BIN_HZ) - 300)).toBeLessThan(10);
  });
});
