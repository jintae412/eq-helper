import type { BalanceFinding } from '../analysis/balance';
import type { SoloAnalysis } from '../analysis/sourceCheck';
import { aimAt, buildAnswer } from './ask';
import { LOW_END_NOTE } from './balanceAdvice';
import { KB, SOURCE_LABELS, SYMPTOM_LABELS, type KbEntry, type SourceType } from './knowledgeBase';
import { describeInstruction, formatHz, translate, type MixerProfile } from './mixer';

/** Below this, the source has nothing useful (rumble, thump, proximity boom). Missing = keep the lows. */
export const HPF_CUTOFF: Partial<Record<SourceType, number>> = {
  'male-vocal': 100,
  'female-vocal': 120,
  'speech-headset': 150,
  'speech-handheld': 120,
  'acoustic-guitar': 80, // just under the low E (82 Hz)
  'electric-guitar': 100,
  overheads: 300,
};

export interface SourceAdvice {
  title: string;
  detail: string;
  steps: string[];
  why: string;
  notes: string[];
  /** Boost-and-sweep range this mixer can actually sweep, if any. */
  sweep?: { loHz: number; hiHz: number };
}

/** The knowledge base entry for this source whose cut range contains the bump. */
function entryForBump(source: SourceType, freqHz: number): { entry: KbEntry; range: [number, number] } | undefined {
  for (const entry of KB) {
    if (!entry.sources.includes(source)) continue;
    const move = entry.moves.find((m) => m.kind === 'eq' && m.gainDb < 0 && m.rangeHz && freqHz >= m.rangeHz[0] && freqHz <= m.rangeHz[1]);
    if (move?.rangeHz) return { entry, range: move.rangeHz };
  }
  return undefined;
}

/** Overlap between the problem's usual range and a sweepable/parametric band on this mixer. */
function sweepRange(range: [number, number], mixer: MixerProfile): { loHz: number; hiHz: number } | undefined {
  for (const b of mixer.bands) {
    if (b.kind === 'fixed') continue;
    const loHz = Math.max(range[0], b.minHz);
    const hiHz = Math.min(range[1], b.maxHz);
    if (loHz < hiHz) return { loHz, hiHz };
  }
  return undefined;
}

function bumpAdvice(f: BalanceFinding, source: SourceType, mixer: MixerProfile): SourceAdvice {
  const detail = `+${f.deviationDb.toFixed(0)} dB around ${formatHz(f.freqHz)}`;
  const notes = f.lowConfidence ? [LOW_END_NOTE] : [];
  const match = entryForBump(source, f.freqHz);
  if (!match) {
    // ponytail: generic fallback for bumps the knowledge base doesn't cover yet
    const step = describeInstruction(translate({ kind: 'eq', freqHz: f.freqHz, gainDb: -3, q: 2 }, mixer));
    const range: [number, number] = [f.freqHz / 1.4, f.freqHz * 1.4];
    return {
      title: 'Resonance', detail, steps: [step], notes, sweep: sweepRange(range, mixer),
      why: `This ${SOURCE_LABELS[source].toLowerCase()} has a peak that sticks out from the rest of its sound. A small cut evens it out.`,
    };
  }
  const { entry, range } = match;
  const answer = buildAnswer(aimAt(entry, f.freqHz), source, mixer);
  return {
    title: entry.symptoms.map((s) => SYMPTOM_LABELS[s]).join(' / '),
    detail,
    steps: answer.reachable ? answer.steps : [...answer.nonEqFixes, ...answer.steps],
    why: entry.why,
    notes,
    sweep: sweepRange(range, mixer),
  };
}

function hpfAdvice(source: SourceType, cutoffHz: number, mixer: MixerProfile): SourceAdvice {
  return {
    title: 'Too much low end',
    detail: `rumble below ${formatHz(cutoffHz)}`,
    steps: [describeInstruction(translate({ kind: 'hpf', freqHz: cutoffHz }, mixer))],
    why: `Below about ${formatHz(cutoffHz)} a ${SOURCE_LABELS[source].toLowerCase()} has nothing useful: just rumble, stage thump and proximity boom. A high-pass filter cleans that up and frees headroom for the whole mix.`,
    notes: [],
  };
}

const MAX_ITEMS = 3;

export function describeSolo(analysis: SoloAnalysis, source: SourceType, mixer: MixerProfile): SourceAdvice[] {
  const cutoff = HPF_CUTOFF[source];
  return [
    ...(analysis.needsHpf && cutoff ? [hpfAdvice(source, cutoff, mixer)] : []),
    ...analysis.bumps.map((b) => bumpAdvice(b, source, mixer)),
  ].slice(0, MAX_ITEMS);
}

/** One line per item for the saved "last check" summary. */
export const summaryLine = (a: SourceAdvice) => `${a.title} (${a.detail}): ${a.steps[0]}`;
