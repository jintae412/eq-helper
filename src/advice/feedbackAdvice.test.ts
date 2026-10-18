import { describe, expect, it } from 'vitest';
import type { BandSetup } from './band';
import { feedbackSteps, likelyCulprit, permanentFix } from './feedbackAdvice';
import type { RigOutputs } from './mixer';

const band: BandSetup = {
  id: 'b',
  name: 'Sunday',
  sources: [
    { id: '1', label: 'Pastor Mike', type: 'speech-headset', mic: 'headset' },
    { id: '2', label: 'Sarah', type: 'female-vocal', mic: 'handheld-dynamic' },
    { id: '3', label: 'Dan', type: 'acoustic-guitar', mic: 'di' },
  ],
};

const analogWedgesGeq: RigOutputs = { monitors: 'wedges', geqOnMains: false, geqOnMonitors: true, outputPeq: false };
const digitalIem: RigOutputs = { monitors: 'iem', geqOnMains: false, geqOnMonitors: false, outputPeq: true };
const bare: RigOutputs = { monitors: 'none', geqOnMains: false, geqOnMonitors: false, outputPeq: false };

describe('likelyCulprit', () => {
  it('names band members by frequency range and mic type', () => {
    expect(likelyCulprit(5000, band)).toBe('Pastor Mike (headset)');
    expect(likelyCulprit(2500, band)).toBe('Pastor Mike (headset) or Sarah (handheld)');
    expect(likelyCulprit(150, band)).toBe('Dan (DI)');
  });

  it('falls back to a range guess without a band', () => {
    expect(likelyCulprit(2500)).toContain('vocal mic');
  });
});

describe('feedbackSteps', () => {
  it('wedges + monitor graphic EQ: diagnose, then GEQ slider, then channel fallback', () => {
    const steps = feedbackSteps(2600, analogWedgesGeq, band);
    expect(steps[0]).toContain('Pastor Mike');
    expect(steps[1]).toContain('monitor send');
    expect(steps[2]).toBe("If it's the monitors: on the monitor graphic EQ, pull the 2.5 kHz slider down 3–6 dB.");
    expect(steps.at(-1)).toMatch(/^Otherwise: cut 2\.6 kHz/);
  });

  it('in-ears skip the monitor steps entirely', () => {
    const steps = feedbackSteps(2500, digitalIem);
    expect(steps.some((s) => s.includes('monitor'))).toBe(false);
    expect(steps).toContain("If it's the mains: on the main output EQ, cut 2.5 kHz by 3–6 dB with a narrow Q (8–10).");
  });

  it('no output EQ at all: straight to the channel fix', () => {
    expect(feedbackSteps(800, bare).at(-1)).toMatch(/^Fix: cut 800 Hz/);
  });
});

it('permanentFix picks the best EQ available', () => {
  expect(permanentFix(2500, digitalIem)).toContain('output EQ');
  expect(permanentFix(2600, analogWedgesGeq)).toContain('2.5 kHz graphic EQ slider');
  expect(permanentFix(2500, bare)).toContain('channel EQ');
});
