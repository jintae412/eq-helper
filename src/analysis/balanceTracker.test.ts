import { describe, expect, it } from 'vitest';
import type { BalanceFinding } from './balance';
import { BalanceTracker } from './balanceTracker';

const mud = (freqHz = 250, extra: Partial<BalanceFinding> = {}): BalanceFinding => ({
  direction: 'bump', region: 'low-mid', freqHz, deviationDb: 5, lowConfidence: false,
  kitAffected: false, knownRoomIssue: false, score: 5, ...extra,
});

describe('BalanceTracker', () => {
  it('needs N checks in a row before showing a card', () => {
    const t = new BalanceTracker();
    t.update([mud()], 0, 2);
    expect(t.snapshot().current).toEqual([]);
    t.update([mud(315)], 5, 2); // drifted, same region → same issue
    expect(t.snapshot().current.map((c) => c.finding.freqHz)).toEqual([315]);
  });

  it('a one-off blip never shows', () => {
    const t = new BalanceTracker();
    t.update([mud()], 0, 2);
    t.update([], 5, 2);
    t.update([mud()], 10, 2);
    expect(t.snapshot().current).toEqual([]);
  });

  it('clears after N clean checks into the session log, and counts recurrences', () => {
    const t = new BalanceTracker();
    t.update([mud()], 0, 1);
    t.update([], 5, 1);
    let snap = t.snapshot();
    expect(snap.current).toEqual([]);
    expect(snap.history).toMatchObject([{ key: 'bump:low-mid', count: 1 }]);

    t.update([mud()], 10, 1);
    snap = t.snapshot();
    expect(snap.current).toHaveLength(1);
    expect(snap.history).toEqual([]); // not duplicated while it's showing
    t.update([], 15, 1);
    expect(t.snapshot().history[0].count).toBe(2);
  });

  it('known room issues show immediately', () => {
    const t = new BalanceTracker();
    t.update([mud(250, { knownRoomIssue: true })], 0, 3);
    expect(t.snapshot().current).toHaveLength(1);
  });
});
