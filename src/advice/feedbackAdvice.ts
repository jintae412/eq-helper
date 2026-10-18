import { MIC_SHORT, type BandSetup, type BandSource } from './band';
import { SOURCE_LABELS, type SourceType } from './knowledgeBase';
import { formatHz, nearestGeqSlider, type RigOutputs } from './mixer';

const VOICE: SourceType[] = ['male-vocal', 'female-vocal', 'speech-headset', 'speech-handheld'];
const isVoice = (s: BandSource) => VOICE.includes(s.type);
const isBodyWorn = (s: BandSource) => s.mic === 'headset' || s.mic === 'lavalier' || s.type === 'speech-headset';

/** Which sources commonly feed back in each range. ponytail: rule of thumb, refine with real sessions. */
function suspects(freqHz: number, band: BandSetup): BandSource[] {
  const match = (s: BandSource) => {
    if (freqHz >= 4000) return isBodyWorn(s) || s.mic === 'condenser' || s.type === 'overheads';
    if (freqHz >= 1000) return isVoice(s) || isBodyWorn(s);
    if (freqHz >= 300) return isVoice(s) || s.type === 'acoustic-guitar';
    return s.type === 'acoustic-guitar' || s.type === 'kick' || s.type === 'cajon';
  };
  return band.sources.filter(match);
}

function rangeGuess(freqHz: number): string {
  if (freqHz < 300) return 'an acoustic guitar (body resonance) or a kick/cajón mic';
  if (freqHz < 1000) return 'a vocal mic or acoustic guitar';
  if (freqHz < 4000) return 'a vocal mic (the most common feedback range)';
  return 'a headset, clip-on, or condenser mic';
}

const MAX_NAMED = 3; // more than this isn't a useful hint

export function likelyCulprit(freqHz: number, band?: BandSetup): string {
  const named = band ? suspects(freqHz, band) : [];
  if (named.length === 0 || named.length > MAX_NAMED) return rangeGuess(freqHz);
  return named
    .map((s) => `${s.label.trim() || SOURCE_LABELS[s.type]}${s.mic ? ` (${MIC_SHORT[s.mic]})` : ''}`)
    .join(' or ');
}

const hasWedges = (o: RigOutputs) => o.monitors === 'wedges' || o.monitors === 'unknown';

function outputFix(out: 'main' | 'monitor', freqHz: number, o: RigOutputs, hasGeq: boolean): string | null {
  if (o.outputPeq) return `If it's the ${out}s: on the ${out} output EQ, cut ${formatHz(freqHz)} by 3–6 dB with a narrow Q (8–10).`;
  if (hasGeq) return `If it's the ${out}s: on the ${out} graphic EQ, pull the ${formatHz(nearestGeqSlider(freqHz))} slider down 3–6 dB.`;
  return null;
}

/** Ordered steps for live feedback: stop it, find the path, fix it with whatever EQ exists. */
export function feedbackSteps(freqHz: number, outputs: RigOutputs, band?: BandSetup): string[] {
  const steps = [`Right now: pull down the fader of the mic most likely ringing: ${likelyCulprit(freqHz, band)}.`];
  if (hasWedges(outputs)) {
    steps.push('Find the path: briefly lower that mic\'s monitor send. Ringing stops → it\'s the monitors. Keeps going → it\'s the mains.');
  }
  const fixes = [
    hasWedges(outputs) ? outputFix('monitor', freqHz, outputs, outputs.geqOnMonitors) : null,
    outputFix('main', freqHz, outputs, outputs.geqOnMains),
  ].filter((f): f is string => f !== null);
  steps.push(...fixes);
  steps.push(
    `${fixes.length ? 'Otherwise' : 'Fix'}: cut ${formatHz(freqHz)} on that mic's channel EQ (narrow if you can), and make sure the mic isn't pointed at a speaker.`,
  );
  return steps;
}

/** For a frequency that keeps ringing: what to set up before the next service. */
export function permanentFix(freqHz: number, outputs: RigOutputs): string {
  const hz = formatHz(freqHz);
  if (outputs.outputPeq) return `Before next service: cut ${hz} by 3–4 dB (narrow Q) on the output EQ it rang through.`;
  if (outputs.geqOnMonitors || outputs.geqOnMains) {
    return `Before next service: pull the ${formatHz(nearestGeqSlider(freqHz))} graphic EQ slider down 3 dB on the output it rang through.`;
  }
  return `Before next service: cut ${hz} a little on the channel EQ of the mic that rang, or move that mic/speaker.`;
}
