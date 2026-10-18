import { SOURCE_TYPES, type SourceType } from '../advice/knowledgeBase';
import { createFromPreset, type EqBand, type MixerProfile } from '../advice/mixer';

export const MIC_LABELS = {
  'handheld-dynamic': 'Handheld (dynamic)',
  headset: 'Headset',
  lavalier: 'Lavalier / clip-on',
  condenser: 'Condenser',
  di: 'DI / line',
} as const;
export type MicType = keyof typeof MIC_LABELS;

export interface BandSource {
  id: string;
  label: string;
  type: SourceType;
  mic?: MicType;
}

export interface BandSetup {
  id: string;
  name: string;
  sources: BandSource[];
}

export interface AppData {
  version: 1;
  mixers: MixerProfile[];
  activeMixerId: string;
  bands: BandSetup[];
  activeBandId: string | null;
}

export const STORAGE_KEY = 'eq-helper/data';
export const BACKUP_KEY = 'eq-helper/backup';

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

export function defaults(): AppData {
  const mixer = createFromPreset('3-band', 'My mixer');
  return { version: 1, mixers: [mixer], activeMixerId: mixer.id, bands: [], activeBandId: null };
}

// ── Validation: saved data is a trust boundary (old versions, corruption, manual edits) ──

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === 'object' && x !== null && !Array.isArray(x);
const isStr = (x: unknown): x is string => typeof x === 'string';
const isPos = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x) && x > 0;

function isEqBand(x: unknown): x is EqBand {
  if (!isObj(x) || !isStr(x.label) || !isPos(x.maxGainDb)) return false;
  switch (x.kind) {
    case 'fixed':
      return isPos(x.freqHz);
    case 'sweep':
      return isPos(x.minHz) && isPos(x.maxHz) && x.minHz < x.maxHz;
    case 'parametric':
      return isPos(x.minHz) && isPos(x.maxHz) && x.minHz < x.maxHz && isPos(x.minQ) && isPos(x.maxQ) && x.minQ <= x.maxQ;
    default:
      return false;
  }
}

function isMixerProfile(x: unknown): x is MixerProfile {
  if (!isObj(x) || !isStr(x.id) || !isStr(x.name) || !Array.isArray(x.bands) || !x.bands.every(isEqBand)) return false;
  return x.hpf === undefined || (isObj(x.hpf) && isPos(x.hpf.minHz) && isPos(x.hpf.maxHz) && x.hpf.minHz <= x.hpf.maxHz);
}

const isBandSource = (x: unknown): x is BandSource =>
  isObj(x) && isStr(x.id) && isStr(x.label) &&
  SOURCE_TYPES.includes(x.type as SourceType) &&
  (x.mic === undefined || Object.hasOwn(MIC_LABELS, x.mic as string));

const isBandSetup = (x: unknown): x is BandSetup =>
  isObj(x) && isStr(x.id) && isStr(x.name) && Array.isArray(x.sources) && x.sources.every(isBandSource);

/** Keeps every valid item; `dropped` says whether anything had to be thrown away. */
export function parse(x: unknown): { data: AppData; dropped: boolean } {
  if (!isObj(x) || x.version !== 1 || !Array.isArray(x.mixers) || !Array.isArray(x.bands)) {
    return { data: defaults(), dropped: true };
  }
  const mixers = x.mixers.filter(isMixerProfile);
  const bands = x.bands.filter(isBandSetup);
  let dropped = mixers.length !== x.mixers.length || bands.length !== x.bands.length;
  if (mixers.length === 0) {
    mixers.push(defaults().mixers[0]);
    dropped = true;
  }
  const activeMixerId = mixers.some((m) => m.id === x.activeMixerId) ? (x.activeMixerId as string) : mixers[0].id;
  const activeBandId = bands.some((b) => b.id === x.activeBandId) ? (x.activeBandId as string) : null;
  return { data: { version: 1, mixers, activeMixerId, bands, activeBandId }, dropped };
}

export function load(storage: KeyValueStore = localStorage): { data: AppData; warning?: string } {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: defaults(), warning: 'This browser blocked saving, so your setup won\'t be remembered.' };
  }
  if (raw === null) return { data: defaults() };

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    json = undefined;
  }
  const { data, dropped } = parse(json);
  if (!dropped) return { data };

  // Keep the original so nothing is lost when the repaired data is saved over it.
  try {
    storage.setItem(BACKUP_KEY, raw);
  } catch {
    /* best effort */
  }
  return { data, warning: 'Some saved setup data was unreadable and has been reset. A backup copy was kept.' };
}

export function save(data: AppData, storage: KeyValueStore = localStorage): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false; // quota exceeded or storage blocked
  }
}
