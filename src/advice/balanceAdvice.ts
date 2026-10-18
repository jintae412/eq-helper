import type { BalanceFinding, Direction, Region } from '../analysis/balance';
import { aimAt, buildAnswer } from './ask';
import type { BandSetup } from './band';
import { lookup, SOURCE_LABELS, type SourceType, type Symptom } from './knowledgeBase';
import { formatHz, nearestGeqSlider, type MixerProfile, type RigOutputs } from './mixer';
import type { ListenMode } from './room';

interface Copy {
  name: string;
  why: string;
  suspects: [SourceType, Symptom][]; // who usually causes it, and which KB entry fixes it
}

const SPEECH: SourceType[] = ['speech-headset', 'speech-handheld'];

const COPY: Record<string, Copy> = {
  'bump:low': {
    name: 'Boomy low end',
    why: 'Small rooms boost certain low frequencies, and bass, kick and guitar body all pile up there. Boom smears the rhythm and makes things louder without making them clearer.',
    suspects: [['bass', 'boomy'], ['kick', 'no-punch'], ['cajon', 'boomy'], ['acoustic-guitar', 'boomy'], ['keys', 'boomy'], ['speech-headset', 'boomy']],
  },
  'bump:low-mid': {
    name: 'Low-mid buildup (muddy)',
    why: 'Almost every voice and instrument has energy at 160–500 Hz. Added together it turns into mud that masks the words.',
    suspects: [['acoustic-guitar', 'muddy'], ['keys', 'muddy'], ['male-vocal', 'muddy'], ['female-vocal', 'muddy'], ['electric-guitar', 'muddy'], ['speech-headset', 'muddy'], ['speech-handheld', 'muddy']],
  },
  'bump:mid': {
    name: 'Boxy midrange',
    why: 'Too much 500 Hz–1 kHz makes the whole mix sound like it\'s coming out of a cardboard box.',
    suspects: [['male-vocal', 'boxy'], ['female-vocal', 'boxy'], ['cajon', 'boxy'], ['kick', 'boxy'], ['toms', 'boxy']],
  },
  'bump:upper-mid': {
    name: 'Honky / nasal',
    why: 'A bump around 1–1.6 kHz sounds like a megaphone and tires listeners out.',
    suspects: [['male-vocal', 'nasal'], ['female-vocal', 'nasal'], ['acoustic-guitar', 'quacky']],
  },
  'bump:presence': {
    name: 'Harsh upper mids',
    why: 'Ears are most sensitive at 1.6–5 kHz. Too much here is tiring, and it hurts at volume.',
    suspects: [['male-vocal', 'harsh'], ['female-vocal', 'harsh'], ['electric-guitar', 'harsh'], ['keys', 'harsh'], ['overheads', 'harsh'], ['speech-headset', 'harsh']],
  },
  'bump:high': {
    name: 'Too bright / sizzly',
    why: 'Excess energy above 5 kHz sounds brittle and hissy, and it exaggerates "S" sounds.',
    suspects: [['acoustic-guitar', 'string-noise'], ['electric-guitar', 'fizzy'], ['male-vocal', 'sibilant'], ['female-vocal', 'sibilant'], ['e-kit', 'harsh']],
  },
  'dip:low': {
    name: 'Thin low end',
    why: 'Less low end than your reference: the mix will feel weak and lack a pulse.',
    suspects: [['kick', 'no-punch'], ['cajon', 'no-punch']],
  },
  'dip:low-mid': {
    name: 'Lacking warmth',
    why: 'Less 160–500 Hz than your reference: voices and guitars lose their body.',
    suspects: [['male-vocal', 'thin'], ['female-vocal', 'thin']],
  },
  'dip:mid': {
    name: 'Hollow / scooped mids',
    why: 'Less 500 Hz–1 kHz than your reference: the mix sounds distant and hollow.',
    suspects: [],
  },
  'dip:upper-mid': {
    name: 'Recessed mids',
    why: 'Less 1–1.6 kHz than your reference: instruments lose definition.',
    suspects: [],
  },
  'dip:presence': {
    name: 'Clarity hole (words may be lost)',
    why: 'Word clarity lives at 1.6–5 kHz. A hole here makes vocals hard to understand, however loud they are.',
    suspects: [['male-vocal', 'buried'], ['female-vocal', 'buried'], ['acoustic-guitar', 'buried']],
  },
  'dip:high': {
    name: 'Dull top end',
    why: 'Less energy above 5 kHz than your reference: the mix sounds muffled and lifeless.',
    suspects: [['male-vocal', 'dull'], ['female-vocal', 'dull']],
  },
  'dark:overall': {
    name: 'Whole mix sounds dark',
    why: 'Highs fall off much faster than a typical mix. Words and cymbals get muffled.',
    suspects: [],
  },
  'bright:overall': {
    name: 'Whole mix sounds bright',
    why: 'Highs are much stronger than a typical mix. It will sound thin and harsh, especially when loud.',
    suspects: [],
  },
};

export const LOW_END_NOTE =
  'Low confidence: phone mics are weak below ~160 Hz, and the low end at the board can be very different from the middle of the room. Walk to the middle of the room and listen before changing anything.';
export const KIT_NOTE = 'A drum kit is playing, and kick drum low end can exaggerate this. Treat it as a hint.';
export const KNOWN_NOTE = 'Known issue in this room.';

const MAX_SUSPECTS = 2;

export interface FindingAdvice {
  title: string;
  detail: string;
  steps: string[];
  why: string;
  notes: string[];
}

function regionCopy(direction: Direction, region: Region): Copy {
  return COPY[`${direction}:${region}`];
}

/** Main-output EQ move, or null when the rig has no main EQ. */
function mainEqStep(f: BalanceFinding, outputs: RigOutputs): string | null {
  if (f.region === 'overall') {
    const dir = f.direction === 'dark' ? 'up' : 'down';
    if (outputs.outputPeq) return `On the main output EQ, add a high shelf at 8 kHz, ${dir} 2 dB.`;
    if (outputs.geqOnMains) return `On the main graphic EQ, nudge the 6.3–12.5 kHz sliders ${dir} 2 dB.`;
    return `Turn the HIGH knob ${dir} a little on the vocal and guitar channels.`;
  }
  const amount = f.direction === 'bump' ? Math.min(6, Math.max(2, Math.round(Math.abs(f.deviationDb) * 0.75))) : Math.min(3, Math.max(2, Math.round(Math.abs(f.deviationDb) * 0.5)));
  const verb = f.direction === 'bump' ? 'cut' : 'boost';
  if (outputs.outputPeq) return `On the main output EQ, ${verb} ${formatHz(f.freqHz)} by ${amount} dB (Q 1.4).`;
  if (outputs.geqOnMains) {
    return `On the main graphic EQ, pull the ${formatHz(nearestGeqSlider(f.freqHz))} slider ${f.direction === 'bump' ? 'down' : 'up'} ${amount} dB.`;
  }
  return null;
}

export function describeFinding(f: BalanceFinding, mixer: MixerProfile, mode: ListenMode, band?: BandSetup): FindingAdvice {
  const copy = regionCopy(f.direction, f.region);
  const detail = f.region === 'overall'
    ? `${f.deviationDb > 0 ? '+' : ''}${f.deviationDb.toFixed(1)} dB per octave`
    : `${f.deviationDb > 0 ? '+' : '−'}${Math.abs(f.deviationDb).toFixed(0)} dB around ${formatHz(f.freqHz)}`;

  // Speech mode: only the speaker's mic matters. Music mode: the speaker is usually silent.
  const suspects = copy.suspects.filter(([t]) => SPEECH.includes(t) === (mode === 'speech'));

  // Most likely culprit first (suspect order), not band-list order.
  const steps: string[] = [];
  const inBand = band
    ? suspects.flatMap(([type, symptom]) => band.sources.filter((s) => s.type === type).map((source) => ({ source, symptom })))
    : [];
  for (const { source, symptom } of inBand.slice(0, MAX_SUSPECTS)) {
    const entry = lookup(source.type, symptom);
    if (!entry) continue;
    const answer = buildAnswer(aimAt(entry, f.freqHz), source.type, mixer);
    steps.push(`Check ${source.label.trim() || SOURCE_LABELS[source.type]}: ${answer.steps.join(' ')}`);
  }
  if (steps.length === 0 && suspects.length > 0) {
    const names = [...new Set(suspects.map(([t]) => SOURCE_LABELS[t].toLowerCase()))].slice(0, 3);
    steps.push(`Usually caused by: ${names.join(', ')}. Check those channels first.`);
  }
  const main = mainEqStep(f, mixer.outputs);
  if (main) steps.push(`${steps.length ? 'Or, for the whole mix: ' : ''}${main}`);
  if (steps.length === 0) steps.push('No main EQ in your setup: adjust the channels that contribute most.');

  const notes = [
    ...(f.knownRoomIssue ? [KNOWN_NOTE] : []),
    ...(f.lowConfidence ? [LOW_END_NOTE] : []),
    ...(f.kitAffected ? [KIT_NOTE] : []),
  ];
  return { title: copy.name, detail, steps, why: copy.why, notes };
}

/** Before-the-service suggestion for a known room resonance. */
export function preCut(freqHz: number, outputs: RigOutputs): string {
  if (outputs.geqOnMains) return `Pull the ${formatHz(nearestGeqSlider(freqHz))} main graphic EQ slider down 3 dB.`;
  if (outputs.outputPeq) return `Cut ${formatHz(freqHz)} by 3 dB (Q 1.4) on the main output EQ.`;
  return `Expect a buildup around ${formatHz(freqHz)}. Use the HPF and a gentle low-mid cut on the channels that contribute.`;
}
