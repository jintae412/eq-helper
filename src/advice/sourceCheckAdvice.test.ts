import { describe, expect, it } from 'vitest';
import type { BalanceFinding } from '../analysis/balance';
import { ringOutFix } from './feedbackAdvice';
import { createFromPreset } from './mixer';
import { describeSolo, summaryLine } from './sourceCheckAdvice';

const bump = (freqHz: number, region: BalanceFinding['region'], deviationDb = 6): BalanceFinding => ({
  direction: 'bump', region, freqHz, deviationDb, lowConfidence: freqHz < 160, kitAffected: false, knownRoomIssue: false, score: deviationDb,
});

const sweep = createFromPreset('sweep-mid', 'Yamaha', 'm');
const threeBand = createFromPreset('3-band', 'Basic', 'b');

describe('describeSolo', () => {
  it('maps a bump to the source\'s own knowledge base entry, aimed at the measured frequency', () => {
    const [a] = describeSolo({ bumps: [bump(500, 'mid')], lowVsBodyDb: -15, needsHpf: false }, 'female-vocal', sweep);
    expect(a.title).toBe('Boxy');
    expect(a.steps).toEqual(['Set MID frequency to 500 Hz, then turn MID down 3 dB.']);
    expect(a.sweep).toEqual({ loHz: 400, hiHz: 800 });
  });

  it('puts the HPF first when there is rumble', () => {
    const items = describeSolo({ bumps: [bump(250, 'low-mid')], lowVsBodyDb: 0, needsHpf: true }, 'acoustic-guitar', sweep);
    expect(items[0].title).toBe('Too much low end');
    expect(items[0].steps).toEqual(['Turn on the high-pass filter (HPF, 80 Hz).']);
    expect(items[1].title).toBe('Muddy');
  });

  it('offers no sweep on a fixed-band mixer, and leads with non-EQ fixes when unreachable', () => {
    const [a] = describeSolo({ bumps: [bump(1000, 'upper-mid')], lowVsBodyDb: null, needsHpf: false }, 'male-vocal', threeBand);
    expect(a.sweep).toBeUndefined();
    expect(a.steps.at(-1)).toContain('no EQ knob near 1 kHz');
  });

  it('falls back to a generic cut for bumps the knowledge base does not cover', () => {
    const [a] = describeSolo({ bumps: [bump(2000, 'presence')], lowVsBodyDb: null, needsHpf: false }, 'bass', sweep);
    expect(a.title).toBe('Resonance');
    expect(summaryLine(a)).toBe('Resonance (+6 dB around 2 kHz): Set MID frequency to 2 kHz, then turn MID down 3 dB.');
  });
});

it('ringOutFix targets the monitors', () => {
  expect(ringOutFix(2500, { monitors: 'wedges', geqOnMains: false, geqOnMonitors: true, outputPeq: false }))
    .toBe('On the monitor graphic EQ, pull the 2.5 kHz slider down 3–6 dB.');
});
