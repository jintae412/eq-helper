import type { KbEntry, SourceType } from './knowledgeBase';
import { describeGeqMove, describeInstruction, formatHz, translate, type MixerProfile } from './mixer';

export interface Answer {
  steps: string[];
  /** False when no move maps onto this mixer: the UI leads with the non-EQ fixes. */
  reachable: boolean;
  nonEqFixes: string[];
  ranges: string[];
  why: string;
}

/** Retarget an entry's EQ moves at a measured frequency when it's inside where that problem usually lives. */
export function aimAt(entry: KbEntry, freqHz: number): KbEntry {
  return {
    ...entry,
    moves: entry.moves.map((m) =>
      m.kind === 'eq' && m.rangeHz && freqHz >= m.rangeHz[0] && freqHz <= m.rangeHz[1] ? { ...m, freqHz } : m),
  };
}

export function buildAnswer(entry: KbEntry, source: SourceType, mixer: MixerProfile): Answer {
  const ranges = entry.moves.flatMap((m) =>
    m.rangeHz ? [`Usually ${formatHz(m.rangeHz[0])}–${formatHz(m.rangeHz[1])}: if it doesn't help, try nearby in that range.`] : [],
  );

  if (source === 'full-mix') {
    // ponytail: assumes a main graphic EQ; phase 2 adds output gear to mixer profiles
    return {
      steps: entry.moves.map((m) => (m.kind === 'eq' ? describeGeqMove(m) : describeInstruction(translate(m, mixer)))),
      reachable: true,
      nonEqFixes: entry.nonEqFixes,
      ranges,
      why: entry.why,
    };
  }

  const instructions = entry.moves.map((m) => translate(m, mixer));
  return {
    steps: instructions.map(describeInstruction),
    reachable: instructions.some((i) => i.kind !== 'unreachable'),
    nonEqFixes: entry.nonEqFixes,
    ranges,
    why: entry.why,
  };
}
