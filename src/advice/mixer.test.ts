import { describe, expect, it } from 'vitest';
import { createFromPreset, describeInstruction, nearestGeqSlider, translate, type MixerProfile } from './mixer';

const threeBand = createFromPreset('3-band', 'test', 'a');
const sweep = createFromPreset('sweep-mid', 'test', 'b');
const digital = createFromPreset('digital', 'test', 'c');

describe('translate', () => {
  it('maps a 3 kHz cut onto the fixed 2.5 kHz MID', () => {
    expect(translate({ kind: 'eq', freqHz: 3000, gainDb: -4, q: 2 }, threeBand)).toMatchObject({
      kind: 'adjust', control: 'fixed', band: 'MID', freqHz: 2500, approximate: true,
    });
  });

  it('reports 300 Hz mud as unreachable on a fixed 3-band board', () => {
    expect(translate({ kind: 'eq', freqHz: 300, gainDb: -4, q: 1.4 }, threeBand).kind).toBe('unreachable');
  });

  it('uses the sweepable mid at the exact frequency, without Q', () => {
    expect(translate({ kind: 'eq', freqHz: 300, gainDb: -4, q: 1.4 }, sweep)).toEqual({
      kind: 'adjust', control: 'sweep', band: 'MID', freqHz: 300, gainDb: -4, q: undefined, approximate: false,
    });
  });

  it('clamps gain and Q to what a parametric band allows', () => {
    expect(translate({ kind: 'eq', freqHz: 500, gainDb: -30, q: 40 }, digital)).toMatchObject({ gainDb: -15, q: 10 });
  });

  it('clamps HPF frequency to the board range and flags fixed buttons', () => {
    expect(translate({ kind: 'hpf', freqHz: 120 }, threeBand)).toEqual({ kind: 'hpf', freqHz: 80, fixed: true });
    expect(translate({ kind: 'hpf', freqHz: 120 }, digital)).toEqual({ kind: 'hpf', freqHz: 120, fixed: false });
  });

  it('falls back to a low cut when there is no HPF', () => {
    const noHpf: MixerProfile = { ...threeBand, hpf: undefined };
    expect(translate({ kind: 'hpf', freqHz: 100 }, noHpf)).toMatchObject({ kind: 'adjust', band: 'LOW', gainDb: -6 });
  });
});

describe('describeInstruction', () => {
  it('phrases each control type for a human', () => {
    expect(describeInstruction({ kind: 'adjust', control: 'sweep', band: 'MID', freqHz: 300, gainDb: -4, approximate: false }))
      .toBe('Set MID frequency to 300 Hz, then turn MID down 4 dB.');
    expect(describeInstruction({ kind: 'adjust', control: 'parametric', band: 'Band 2', freqHz: 2500, gainDb: -3, q: 2, approximate: false }))
      .toBe('Band 2: 2.5 kHz, −3 dB, Q 2.');
  });
});

it('finds the nearest 31-band graphic EQ slider', () => {
  expect(nearestGeqSlider(300)).toBe(315);
  expect(nearestGeqSlider(2600)).toBe(2500);
});
