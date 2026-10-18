import { describe, expect, it } from 'vitest';
import { CLEAR_AFTER_MS, FeedbackSession } from './feedbackSession';

describe('FeedbackSession', () => {
  it('raises one alert per ringing episode and only reports changes', () => {
    const s = new FeedbackSession();
    expect(s.update([{ freqHz: 2500 }], 0)).toBe(true);
    expect(s.update([{ freqHz: 2510 }], 100)).toBe(false); // same ring, tiny drift
    expect(s.snapshot().visible).toHaveLength(1);
  });

  it('keeps the alert through brief gaps, then auto-clears', () => {
    const s = new FeedbackSession();
    s.update([{ freqHz: 2500 }], 0);
    expect(s.update([], CLEAR_AFTER_MS)).toBe(false);
    expect(s.update([], CLEAR_AFTER_MS + 1)).toBe(true);
    expect(s.snapshot().active).toEqual([]);
  });

  it('"Got it" hides it until it clears and comes back, and the log counts episodes', () => {
    const s = new FeedbackSession();
    s.update([{ freqHz: 2500 }], 0);
    const id = s.snapshot().visible[0].id;
    expect(s.acknowledge(id)).toBe(true);
    expect(s.snapshot().visible).toEqual([]);
    expect(s.snapshot().active).toHaveLength(1); // still marked on the spectrum

    s.update([], 10_000); // cleared
    s.update([{ freqHz: 2500 }], 20_000); // rings again
    const snap = s.snapshot();
    expect(snap.visible).toHaveLength(1);
    expect(snap.log).toEqual([{ freqHz: 2500, count: 2, lastAt: 20_000 }]);
  });

  it('"Not feedback" removes the alert and its log entry', () => {
    const s = new FeedbackSession();
    s.update([{ freqHz: 2500 }, { freqHz: 800 }], 0);
    const id = s.snapshot().visible.find((a) => a.freqHz === 2500)!.id;
    expect(s.dismiss(id)?.freqHz).toBe(2500);
    expect(s.snapshot().log.map((e) => e.freqHz)).toEqual([800]);
  });
});
