export type EqBand =
  | { kind: 'fixed'; label: string; freqHz: number; maxGainDb: number }
  | { kind: 'sweep'; label: string; minHz: number; maxHz: number; maxGainDb: number }
  | { kind: 'parametric'; label: string; minHz: number; maxHz: number; maxGainDb: number; minQ: number; maxQ: number };

export type BandKind = EqBand['kind'];

/** High-pass filter. A fixed HPF button has minHz === maxHz. */
export interface Hpf {
  minHz: number;
  maxHz: number;
}

export const MONITOR_LABELS = {
  wedges: 'Wedges (floor monitors)',
  iem: 'In-ear monitors',
  none: 'No monitors',
  unknown: 'Not sure',
} as const;
export type MonitorType = keyof typeof MONITOR_LABELS;

/** Speakers and the EQ available on them. Travels with the band's rig. */
export interface RigOutputs {
  monitors: MonitorType;
  geqOnMains: boolean;
  geqOnMonitors: boolean;
  outputPeq: boolean; // digital boards: parametric EQ on each output bus
}

export const COMPRESSOR_LABELS = {
  none: 'None',
  'one-knob': 'One COMP knob',
  full: 'Full controls (threshold, ratio, attack…)',
} as const;
export type CompressorType = keyof typeof COMPRESSOR_LABELS;

export interface MixerProfile {
  id: string;
  name: string;
  hpf?: Hpf;
  bands: EqBand[];
  outputs: RigOutputs;
  compressor: CompressorType; // per channel
}

/** Digital boards have full channel compressors; analog ones vary, so assume none until told. */
export const defaultCompressor = (bands: { kind: string }[]): CompressorType =>
  bands.some((b) => b.kind === 'parametric') ? 'full' : 'none';

/** Sensible guess: digital boards have output EQ; analog ones usually rely on an outboard graphic EQ, if any. */
export const defaultOutputs = (bands: { kind: string }[]): RigOutputs => ({
  monitors: 'unknown',
  geqOnMains: false,
  geqOnMonitors: false,
  outputPeq: bands.some((b) => b.kind === 'parametric'),
});

/** What the advice engine wants, independent of hardware. */
export type EqMove = { kind: 'eq'; freqHz: number; gainDb: number; q: number } | { kind: 'hpf'; freqHz: number };

export type Instruction =
  | { kind: 'adjust'; control: BandKind; band: string; freqHz: number; gainDb: number; q?: number; approximate: boolean }
  | { kind: 'hpf'; freqHz: number; fixed: boolean }
  /** The board's HPF can't go low enough: engaging it would cut what the source needs. */
  | { kind: 'hpf-too-high'; lowestHz: number }
  | { kind: 'unreachable'; freqHz: number };

export type PresetKind = '3-band' | 'sweep-mid' | 'dual-sweep' | 'digital';

export const PRESETS: Record<PresetKind, { label: string; profile: Omit<MixerProfile, 'id' | 'name' | 'outputs' | 'compressor'> }> = {
  '3-band': {
    label: '3-band (LOW / MID / HIGH, no sweep)',
    profile: {
      hpf: { minHz: 80, maxHz: 80 },
      bands: [
        { kind: 'fixed', label: 'LOW', freqHz: 80, maxGainDb: 15 },
        { kind: 'fixed', label: 'MID', freqHz: 2500, maxGainDb: 15 },
        { kind: 'fixed', label: 'HIGH', freqHz: 12000, maxGainDb: 15 },
      ],
    },
  },
  'sweep-mid': {
    label: '3-band with sweepable MID',
    profile: {
      hpf: { minHz: 80, maxHz: 80 },
      bands: [
        { kind: 'fixed', label: 'LOW', freqHz: 80, maxGainDb: 15 },
        { kind: 'sweep', label: 'MID', minHz: 100, maxHz: 8000, maxGainDb: 15 },
        { kind: 'fixed', label: 'HIGH', freqHz: 12000, maxGainDb: 15 },
      ],
    },
  },
  'dual-sweep': {
    label: '4-band with two sweepable MIDs',
    profile: {
      hpf: { minHz: 80, maxHz: 80 },
      bands: [
        { kind: 'fixed', label: 'LOW', freqHz: 80, maxGainDb: 15 },
        { kind: 'sweep', label: 'LOW-MID', minHz: 100, maxHz: 2000, maxGainDb: 15 },
        { kind: 'sweep', label: 'HI-MID', minHz: 400, maxHz: 8000, maxGainDb: 15 },
        { kind: 'fixed', label: 'HIGH', freqHz: 12000, maxGainDb: 15 },
      ],
    },
  },
  digital: {
    label: 'Digital (fully parametric)',
    profile: {
      hpf: { minHz: 20, maxHz: 400 },
      bands: [1, 2, 3, 4].map((n) => ({
        kind: 'parametric' as const,
        label: `Band ${n}`,
        minHz: 20,
        maxHz: 20000,
        maxGainDb: 15,
        minQ: 0.3,
        maxQ: 10,
      })),
    },
  },
};

export function createFromPreset(kind: PresetKind, name: string, id: string = crypto.randomUUID()): MixerProfile {
  const profile = structuredClone(PRESETS[kind].profile);
  return { id, name, ...profile, outputs: defaultOutputs(profile.bands), compressor: defaultCompressor(profile.bands) };
}

// A fixed band more than ~1 octave away does more collateral damage than good.
const MAX_FIXED_OCTAVES = 1;
const EXACT_ENOUGH_OCTAVES = 1 / 6;
// A low cut landing this far above where it was asked for starts eating the source's own notes
// (e.g. an 80 Hz HPF button on a bass that wanted 35 Hz).
const MAX_LOW_CUT_RAISE_OCTAVES = 1 / 2;

const octavesApart = (a: number, b: number) => Math.abs(Math.log2(a / b));
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function candidate(move: Extract<EqMove, { kind: 'eq' }>, band: EqBand): { inst: Instruction; distance: number } | null {
  const gainDb = clamp(move.gainDb, -band.maxGainDb, band.maxGainDb);
  if (band.kind === 'fixed') {
    const distance = octavesApart(move.freqHz, band.freqHz);
    if (distance > MAX_FIXED_OCTAVES) return null;
    return {
      distance,
      inst: { kind: 'adjust', control: 'fixed', band: band.label, freqHz: band.freqHz, gainDb, approximate: distance > EXACT_ENOUGH_OCTAVES },
    };
  }
  if (move.freqHz < band.minHz || move.freqHz > band.maxHz) return null;
  return {
    distance: 0,
    inst: {
      kind: 'adjust',
      control: band.kind,
      band: band.label,
      freqHz: move.freqHz,
      gainDb,
      q: band.kind === 'parametric' ? clamp(move.q, band.minQ, band.maxQ) : undefined,
      approximate: false,
    },
  };
}

export function translate(move: EqMove, profile: MixerProfile): Instruction {
  if (move.kind === 'hpf') {
    const tooHigh = (hz: number) => Math.log2(hz / move.freqHz) > MAX_LOW_CUT_RAISE_OCTAVES;
    if (profile.hpf) {
      const { minHz, maxHz } = profile.hpf;
      if (tooHigh(minHz)) return { kind: 'hpf-too-high', lowestHz: minHz };
      return { kind: 'hpf', freqHz: clamp(move.freqHz, minHz, maxHz), fixed: minHz === maxHz };
    }
    // No HPF: a broad low cut is the next best thing, unless the nearest knob sits too high.
    const lowCut = translate({ kind: 'eq', freqHz: move.freqHz, gainDb: -6, q: 0.7 }, profile);
    return lowCut.kind === 'adjust' && tooHigh(lowCut.freqHz) ? { kind: 'unreachable', freqHz: move.freqHz } : lowCut;
  }
  const best = profile.bands
    .map((b) => candidate(move, b))
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => a.distance - b.distance)[0];
  return best?.inst ?? { kind: 'unreachable', freqHz: move.freqHz };
}

export const formatHz = (hz: number) => (hz >= 1000 ? `${+(hz / 1000).toFixed(1)} kHz` : `${Math.round(hz)} Hz`);

const signedDb = (db: number) => `${db > 0 ? '+' : '−'}${Math.abs(db)} dB`;
const upDown = (db: number) => `${db > 0 ? 'up' : 'down'} ${Math.abs(db)} dB`;

export function describeInstruction(inst: Instruction): string {
  switch (inst.kind) {
    case 'hpf':
      return inst.fixed
        ? `Turn on the high-pass filter (HPF, ${formatHz(inst.freqHz)}).`
        : `Set the high-pass filter (HPF) to ${formatHz(inst.freqHz)}.`;
    case 'hpf-too-high':
      return `Leave the high-pass filter (HPF) off: its lowest setting, ${formatHz(inst.lowestHz)}, would cut into this sound.`;
    case 'unreachable':
      return `This mixer has no EQ knob near ${formatHz(inst.freqHz)}.`;
    case 'adjust':
      switch (inst.control) {
        case 'fixed':
          return `Turn ${inst.band} (${formatHz(inst.freqHz)}) ${upDown(inst.gainDb)}${inst.approximate ? ', the closest this mixer can do' : ''}.`;
        case 'sweep':
          return `Set ${inst.band} frequency to ${formatHz(inst.freqHz)}, then turn ${inst.band} ${upDown(inst.gainDb)}.`;
        case 'parametric':
          return `${inst.band}: ${formatHz(inst.freqHz)}, ${signedDb(inst.gainDb)}, Q ${inst.q}.`;
      }
  }
}

const GEQ_31 = [20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800,
  1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000];

export const nearestGeqSlider = (hz: number) =>
  GEQ_31.reduce((a, b) => (octavesApart(b, hz) < octavesApart(a, hz) ? b : a));

export function describeGeqMove(move: Extract<EqMove, { kind: 'eq' }>): string {
  return `On the main graphic EQ, pull the ${formatHz(nearestGeqSlider(move.freqHz))} slider ${upDown(move.gainDb)}.`;
}
