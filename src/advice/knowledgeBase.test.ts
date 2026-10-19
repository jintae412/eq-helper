import { describe, expect, it } from 'vitest';
import { KB, lookup, search, SOURCE_TYPES, symptomsFor } from './knowledgeBase';
import { buildAnswer } from './ask';
import { createFromPreset } from './mixer';

describe('knowledge base invariants', () => {
  it('has unique ids', () => {
    expect(new Set(KB.map((e) => e.id)).size).toBe(KB.length);
  });

  it('has at most one entry per (source, symptom)', () => {
    const pairs = KB.flatMap((e) => e.sources.flatMap((s) => e.symptoms.map((y) => `${s}/${y}`)));
    expect(pairs.filter((p, i) => pairs.indexOf(p) !== i)).toEqual([]);
  });

  it.each(KB)('$id has sane moves, lowercase synonyms, and a real explanation', (e) => {
    expect(e.moves.length).toBeGreaterThan(0);
    expect(e.why.length).toBeGreaterThan(40);
    for (const s of e.synonyms) expect(s).toBe(s.toLowerCase());
    for (const m of e.moves) {
      if (m.kind === 'hpf') {
        expect(m.freqHz).toBeGreaterThanOrEqual(20);
        expect(m.freqHz).toBeLessThanOrEqual(400);
        continue;
      }
      expect(m.gainDb).toBeGreaterThanOrEqual(-12);
      expect(m.gainDb).toBeLessThanOrEqual(6);
      expect(m.gainDb).not.toBe(0);
      expect(m.q).toBeGreaterThan(0);
      expect(m.q).toBeLessThanOrEqual(10);
      expect(m.rangeHz).toBeDefined();
      expect(m.freqHz).toBeGreaterThanOrEqual(m.rangeHz![0]);
      expect(m.freqHz).toBeLessThanOrEqual(m.rangeHz![1]);
    }
  });

  it('gives every source at least one symptom', () => {
    expect(SOURCE_TYPES.filter((s) => symptomsFor(s).length === 0)).toEqual([]);
  });
});

describe('lookup and search', () => {
  it('finds by source + symptom', () => {
    expect(lookup('male-vocal', 'muddy')?.id).toBe('vocal-muddy');
    expect(lookup('bass', 'sibilant')).toBeUndefined();
  });

  it('matches user wording via synonyms, scoped to a source', () => {
    expect(search('I can hear the strings too much, pick noise', 'acoustic-guitar').map((e) => e.id)).toEqual(['acoustic-string-noise']);
    expect(search('sounds murky', 'female-vocal').map((e) => e.id)).toEqual(['vocal-muddy']);
    expect(search('   ')).toEqual([]);
  });
});

describe('buildAnswer', () => {
  const muddy = lookup('male-vocal', 'muddy')!;

  it('leads with non-EQ fixes when the mixer cannot reach the frequency', () => {
    const noHpfThreeBand = { ...createFromPreset('3-band', 't', 'a'), hpf: undefined };
    const a = buildAnswer(lookup('male-vocal', 'nasal')!, 'male-vocal', noHpfThreeBand);
    expect(a.reachable).toBe(false);
    expect(a.steps[0]).toContain('no EQ knob near 1 kHz');
  });

  it('gives exact steps on a sweepable board', () => {
    const a = buildAnswer(muddy, 'male-vocal', createFromPreset('sweep-mid', 't', 'b'));
    expect(a.reachable).toBe(true);
    expect(a.steps).toEqual([
      'Turn on the high-pass filter (HPF, 80 Hz).',
      'Set MID frequency to 300 Hz, then turn MID down 4 dB.',
    ]);
  });

  it('tells bass to leave a fixed 80 Hz HPF off instead of turning it on', () => {
    const a = buildAnswer(lookup('bass', 'boomy')!, 'bass', createFromPreset('sweep-mid', 't', 'd'));
    expect(a.steps[0]).toBe('Leave the high-pass filter (HPF) off: its lowest setting, 80 Hz, would cut into this sound.');
    expect(a.steps.join(' ')).not.toContain('Turn on the high-pass filter');
    expect(a.reachable).toBe(true); // the MID cut still works
  });

  it('uses graphic EQ sliders for whole-mix advice', () => {
    const a = buildAnswer(lookup('full-mix', 'muddy')!, 'full-mix', createFromPreset('3-band', 't', 'c'));
    expect(a.steps).toEqual(['On the main graphic EQ, pull the 315 Hz slider down 3 dB.']);
  });
});
