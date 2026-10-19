import { expect, it } from 'vitest';
import { logPercent, NOTE_RANGES, REFERENCE } from './reference';

it.each(Object.entries(REFERENCE))('%s rows are in order with sane ranges and real text', (_, rows) => {
  expect(rows.length).toBeGreaterThan(2);
  rows.forEach((r, i) => {
    expect(r.hz[0]).toBeGreaterThanOrEqual(20);
    expect(r.hz[1]).toBeLessThanOrEqual(20000);
    expect(r.hz[0]).toBeLessThan(r.hz[1]);
    if (i > 0) expect(r.hz[0]).toBeGreaterThanOrEqual(rows[i - 1].hz[0]);
    for (const s of [r.name, r.boost, r.cut]) expect(s.length).toBeGreaterThan(2);
  });
});

it('maps the audible range onto 0–100 on a log axis', () => {
  expect(logPercent(20)).toBe(0);
  expect(logPercent(20000)).toBe(100);
  expect(logPercent(632)).toBeCloseTo(50, 0);
  expect(logPercent(5)).toBe(0);
});

it.each(Object.entries(NOTE_RANGES))('%s note range is audible and ordered', (_, r) => {
  expect(r![0]).toBeGreaterThanOrEqual(20);
  expect(r![0]).toBeLessThan(r![1]);
  expect(r![1]).toBeLessThanOrEqual(5000);
});
