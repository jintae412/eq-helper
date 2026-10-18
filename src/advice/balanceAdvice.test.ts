import { describe, expect, it } from 'vitest';
import type { BalanceFinding, Direction, Region } from '../analysis/balance';
import type { BandSetup } from './band';
import { describeFinding, KIT_NOTE, LOW_END_NOTE, preCut } from './balanceAdvice';
import { createFromPreset, type MixerProfile } from './mixer';

const finding = (direction: Direction, region: Region, freqHz: number, deviationDb: number, extra: Partial<BalanceFinding> = {}): BalanceFinding => ({
  direction, region, freqHz, deviationDb, lowConfidence: false, kitAffected: false, knownRoomIssue: false, score: 1, ...extra,
});

const sweepWithGeq: MixerProfile = {
  ...createFromPreset('sweep-mid', 'Yamaha', 'm'),
  outputs: { monitors: 'wedges', geqOnMains: true, geqOnMonitors: false, outputPeq: false },
};

const band: BandSetup = {
  id: 'b', name: 'Sunday', sources: [
    { id: '1', label: 'Pastor Mike', type: 'speech-headset', mic: 'headset' },
    { id: '2', label: 'Dan', type: 'acoustic-guitar' },
    { id: '3', label: 'Sarah', type: 'female-vocal' },
  ],
};

describe('describeFinding', () => {
  it('channel fixes on suspects from the band first, main EQ as fallback', () => {
    const a = describeFinding(finding('bump', 'low-mid', 250, 6), sweepWithGeq, 'music', band);
    expect(a.title).toBe('Low-mid buildup (muddy)');
    expect(a.detail).toBe('+6 dB around 250 Hz');
    expect(a.steps[0]).toMatch(/^Check Dan: Set MID frequency to 250 Hz/);
    expect(a.steps[1]).toBe('Check Sarah: Turn on the high-pass filter (HPF, 80 Hz). Set MID frequency to 250 Hz, then turn MID down 4 dB.');
    expect(a.steps[2]).toBe('Or, for the whole mix: On the main graphic EQ, pull the 250 Hz slider down 5 dB.');
  });

  it('speech mode only blames the speaker', () => {
    const a = describeFinding(finding('bump', 'low-mid', 250, 6), sweepWithGeq, 'speech', band);
    expect(a.steps[0]).toMatch(/^Check Pastor Mike:/);
    expect(a.steps).toHaveLength(2);
  });

  it('names typical culprits when there is no band setup', () => {
    const a = describeFinding(finding('bump', 'presence', 3150, 5), sweepWithGeq, 'music');
    expect(a.steps[0]).toBe('Usually caused by: male vocal, female vocal, electric guitar. Check those channels first.');
  });

  it('explains low confidence and kit influence', () => {
    const a = describeFinding(finding('bump', 'low', 125, 6, { lowConfidence: true, kitAffected: true }), sweepWithGeq, 'music', band);
    expect(a.notes).toEqual([LOW_END_NOTE, KIT_NOTE]);
  });

  it('handles a mixer with no main EQ', () => {
    const bare = createFromPreset('3-band', 'x', 'y');
    const a = describeFinding(finding('dark', 'overall', 0, -9), bare, 'music');
    expect(a.title).toBe('Whole mix sounds dark');
    expect(a.steps).toEqual(['Turn the HIGH knob up a little on the vocal and guitar channels.']);
  });
});

it('preCut uses the best main EQ available', () => {
  expect(preCut(125, sweepWithGeq.outputs)).toBe('Pull the 125 Hz main graphic EQ slider down 3 dB.');
});
