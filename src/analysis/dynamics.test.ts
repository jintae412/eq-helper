import { describe, expect, it } from 'vitest';
import { dynamicRangeDb, frameLevelDb, LevelWindow, MIN_LEVEL_SAMPLES } from './dynamics';

describe('dynamics', () => {
  it('measures loud-minus-soft, ignoring the extremes', () => {
    const phrases = [...Array(45).fill(-30), ...Array(45).fill(-12), -60, 0]; // one cough, one thump
    expect(dynamicRangeDb(phrases)).toBeCloseTo(18);
  });

  it('a steady source has a small swing', () => {
    expect(dynamicRangeDb(Array.from({ length: 50 }, (_, i) => -20 + (i % 3)))).toBeLessThanOrEqual(2);
  });

  it('frameLevelDb adds up bin power', () => {
    const db = new Float32Array(8192).fill(-Infinity);
    db[100] = -20;
    db[200] = -20;
    expect(frameLevelDb(db, 48_000 / 16_384)).toBeCloseTo(-17, 0); // two equal bins = +3 dB
  });

  it('LevelWindow skips pauses and waits for enough sound', () => {
    const w = new LevelWindow(100);
    for (let i = 0; i < MIN_LEVEL_SAMPLES - 1; i++) w.push(-20);
    w.push(-120); // silence between lines doesn't count
    expect(w.swingDb()).toBeNull();
    w.push(-20);
    expect(w.swingDb()).toBe(0);
  });
});
