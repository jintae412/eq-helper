import { COMPRESSOR_STARTS, SOURCE_LABELS, type SourceType } from './knowledgeBase';
import type { MixerProfile } from './mixer';

export const ADVANCED_NOTE = 'Compression is for experienced mixers. New to mixing? Skip this and just ride the fader.';
export const FEEDBACK_NOTE =
  'Go easy: heavy compression on a vocal mic with wedges makes feedback more likely. Stay at or under 6 dB of gain reduction.';

const VOICE: SourceType[] = ['male-vocal', 'female-vocal', 'speech-headset', 'speech-handheld'];
// Swing this far above the source's threshold → use the stronger ratio.
const STRONG_EXTRA_DB = 6;

export interface CompressorAdvice {
  needed: boolean;
  swingDb: number;
  title: string;
  steps: string[];
  why: string;
  notes: string[];
}

const fmt = (n: number) => `${Math.round(n)} dB`;
const ratio = (r: number) => `${r}:1`;

/** Compressor suggestion for one source, from how far its level swings while performing. */
export function compressorAdvice(source: SourceType, swingDb: number, mixer: MixerProfile): CompressorAdvice | null {
  const start = COMPRESSOR_STARTS[source];
  if (!start) return null;

  if (swingDb <= start.swingDb) {
    return {
      needed: false, swingDb, title: 'Dynamics are fine', steps: [],
      why: `Level swings about ${fmt(swingDb)}, which is normal for a ${SOURCE_LABELS[source].toLowerCase()}. No compressor needed.`,
      notes: [],
    };
  }

  const r = start.strongRatio && swingDb > start.swingDb + STRONG_EXTRA_DB ? start.strongRatio : start.ratio;
  const [lo, hi] = start.reductionDb;
  let steps: string[];
  switch (mixer.compressor) {
    case 'full':
      steps = [
        `Ratio ${ratio(r)}.`,
        `Attack ${start.attack}, release ${start.release}.`,
        `Lower the threshold until the gain-reduction meter shows ${lo}–${hi} dB on the loudest parts, and little or nothing on the soft parts.`,
        'Bring the make-up/output gain back up by about the same amount so the level matches.',
      ];
      break;
    case 'one-knob':
      steps = [
        `Turn COMP to about ${r >= 4 ? '12 o\'clock (medium)' : '10 o\'clock (light)'}.`,
        'The COMP light should flicker on loud parts, not stay on. If it stays on, back it off.',
        'If it gets quieter overall, nudge the fader up to match.',
      ];
      break;
    case 'none':
      steps = [
        VOICE.includes(source)
          ? 'No channel compressor on this mixer: ask them to back off the mic a little on loud parts and lean in on soft ones.'
          : 'No channel compressor on this mixer: ask them to even out their playing a little.',
        'Ride the fader: pull it down a touch on loud sections, push it up on quiet ones.',
      ];
      break;
  }

  const wedges = mixer.outputs.monitors === 'wedges' || mixer.outputs.monitors === 'unknown';
  return {
    needed: true,
    swingDb,
    title: start.gentleOnly ? 'Very uneven: light compression' : 'Uneven level: compression helps',
    steps,
    why: start.why,
    notes: [ADVANCED_NOTE, ...(wedges && VOICE.includes(source) && mixer.compressor !== 'none' ? [FEEDBACK_NOTE] : [])],
  };
}

/** Redo after setting the compressor: did the swing actually shrink? */
export function beforeAfter(beforeDb: number, afterDb: number): string {
  const better = beforeDb - afterDb >= 3;
  return `Swing was ${fmt(beforeDb)}, now ${fmt(afterDb)}${better ? ' ✓' : '. Not much change yet'}.`;
}
