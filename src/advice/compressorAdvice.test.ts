import { describe, expect, it } from 'vitest';
import { ADVANCED_NOTE, beforeAfter, compressorAdvice, FEEDBACK_NOTE } from './compressorAdvice';
import { COMPRESSOR_STARTS } from './knowledgeBase';
import { createFromPreset, type MixerProfile } from './mixer';

const digital = createFromPreset('digital', 'X32', 'd'); // full compressor, monitors unknown
const oneKnob: MixerProfile = { ...createFromPreset('sweep-mid', 'Yamaha', 'y'), compressor: 'one-knob' };
const noComp: MixerProfile = { ...createFromPreset('3-band', 'Basic', 'b'), outputs: { monitors: 'iem', geqOnMains: false, geqOnMonitors: false, outputPeq: false } };

describe('compressorAdvice', () => {
  it('says dynamics are fine below the source threshold', () => {
    const a = compressorAdvice('female-vocal', 10, digital)!;
    expect(a.needed).toBe(false);
    expect(a.steps).toEqual([]);
  });

  it('full controls: ratio, timing, threshold by meter (never a number), make-up', () => {
    const a = compressorAdvice('female-vocal', 16, digital)!;
    expect(a.steps[0]).toBe('Ratio 3:1.');
    expect(a.steps[2]).toMatch(/gain-reduction meter shows 3–6 dB/);
    expect(a.steps.join(' ')).not.toMatch(/threshold (to|at) -?\d/);
    expect(a.notes).toEqual([ADVANCED_NOTE, FEEDBACK_NOTE]);
  });

  it('uses the stronger ratio when the swing is very large', () => {
    expect(compressorAdvice('male-vocal', 22, digital)!.steps[0]).toBe('Ratio 4:1.');
  });

  it('one knob: clock position + LED guidance', () => {
    expect(compressorAdvice('bass', 14, oneKnob)!.steps[0]).toBe("Turn COMP to about 12 o'clock (medium).");
  });

  it('no compressor: mic technique and fader riding, no feedback note', () => {
    const a = compressorAdvice('speech-handheld', 18, noComp)!;
    expect(a.steps[0]).toMatch(/back off the mic/);
    expect(a.notes).toEqual([ADVANCED_NOTE]);
  });

  it('gentle-only sources stay quiet unless the swing is extreme', () => {
    expect(compressorAdvice('cajon', 15, digital)!.needed).toBe(false);
    expect(compressorAdvice('cajon', 25, digital)!.title).toBe('Very uneven: light compression');
  });

  it('every compressor starting point is sane', () => {
    for (const [source, s] of Object.entries(COMPRESSOR_STARTS)) {
      expect(s!.ratio, source).toBeGreaterThan(1);
      expect(s!.reductionDb[1], source).toBeLessThanOrEqual(6);
      expect(s!.why.length, source).toBeGreaterThan(40);
    }
  });
});

it('beforeAfter confirms a real improvement', () => {
  expect(beforeAfter(18, 9)).toBe('Swing was 18 dB, now 9 dB ✓.');
  expect(beforeAfter(18, 17)).toBe('Swing was 18 dB, now 17 dB. Not much change yet.');
});
