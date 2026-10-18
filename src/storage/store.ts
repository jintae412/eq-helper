import { MIC_LABELS, type BandSetup, type BandSource } from '../advice/band';
import { SOURCE_TYPES, type SourceType } from '../advice/knowledgeBase';
import { COMPRESSOR_LABELS, createFromPreset, defaultCompressor, defaultOutputs, MONITOR_LABELS, type EqBand, type MixerProfile, type RigOutputs } from '../advice/mixer';
import type { KnownResonance, RoomProfile, RoomReference } from '../advice/room';
import { BALANCE_SPEEDS, BAND_CENTERS, type BalanceSpeed } from '../analysis/balance';

export interface AppData {
  version: 5;
  mixers: MixerProfile[];
  activeMixerId: string;
  bands: BandSetup[];
  activeBandId: string | null;
  rooms: RoomProfile[];
  activeRoomId: string | null;
  balanceSpeed: BalanceSpeed;
  guidedSeconds: number;
}

export const GUIDED_SECONDS = { min: 8, max: 30, default: 15 };

export const STORAGE_KEY = 'eq-helper/data';
export const BACKUP_KEY = 'eq-helper/backup';

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

export function defaults(): AppData {
  const mixer = createFromPreset('3-band', 'My mixer');
  return {
    version: 5, mixers: [mixer], activeMixerId: mixer.id, bands: [], activeBandId: null,
    rooms: [], activeRoomId: null, balanceSpeed: 'normal', guidedSeconds: GUIDED_SECONDS.default,
  };
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

const isBool = (x: unknown): x is boolean => typeof x === 'boolean';

const isRigOutputs = (x: unknown): x is RigOutputs =>
  isObj(x) && Object.hasOwn(MONITOR_LABELS, x.monitors as string) &&
  isBool(x.geqOnMains) && isBool(x.geqOnMonitors) && isBool(x.outputPeq);

function isMixerProfile(x: unknown): x is MixerProfile {
  if (!isObj(x) || !isStr(x.id) || !isStr(x.name) || !Array.isArray(x.bands) || !x.bands.every(isEqBand)) return false;
  if (!isRigOutputs(x.outputs) || !Object.hasOwn(COMPRESSOR_LABELS, x.compressor as string)) return false;
  return x.hpf === undefined || (isObj(x.hpf) && isPos(x.hpf.minHz) && isPos(x.hpf.maxHz) && x.hpf.minHz <= x.hpf.maxHz);
}

const isLastCheck = (x: unknown): boolean =>
  isObj(x) && isStr(x.at) && Array.isArray(x.notes) && x.notes.every(isStr);

const isBandSource = (x: unknown): x is BandSource =>
  isObj(x) && isStr(x.id) && isStr(x.label) &&
  SOURCE_TYPES.includes(x.type as SourceType) &&
  (x.mic === undefined || Object.hasOwn(MIC_LABELS, x.mic as string)) &&
  (x.lastCheck === undefined || isLastCheck(x.lastCheck));

const isBandSetup = (x: unknown): x is BandSetup =>
  isObj(x) && isStr(x.id) && isStr(x.name) && Array.isArray(x.sources) && x.sources.every(isBandSource);

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

const isResonance = (x: unknown): x is KnownResonance => isObj(x) && isPos(x.freqHz) && isStr(x.note);

const isReference = (x: unknown): x is RoomReference =>
  isObj(x) && isStr(x.savedAt) && Array.isArray(x.bandsDb) && x.bandsDb.length === BAND_CENTERS.length && x.bandsDb.every(isNum);

const isRoom = (x: unknown): x is RoomProfile =>
  isObj(x) && isStr(x.id) && isStr(x.name) &&
  Array.isArray(x.knownResonances) && x.knownResonances.every(isResonance) &&
  isObj(x.references) &&
  (x.references.music === undefined || isReference(x.references.music)) &&
  (x.references.speech === undefined || isReference(x.references.speech));

// ── Migrations: one function per version bump, applied in order ──

/** v1 → v2: mixer profiles gained `outputs` (speakers + the EQ on them). */
function migrateV1(x: Obj): Obj {
  return {
    ...x,
    version: 2,
    mixers: Array.isArray(x.mixers)
      ? x.mixers.map((m) => (isObj(m) && Array.isArray(m.bands) ? { ...m, outputs: defaultOutputs(m.bands as { kind: string }[]) } : m))
      : x.mixers,
  };
}

/** v2 → v3: rooms (acoustics + references) and the balance responsiveness setting. */
function migrateV2(x: Obj): Obj {
  return { ...x, version: 3, rooms: [], activeRoomId: null, balanceSpeed: 'normal' };
}

/** v3 → v4: guided check capture length (band sources gained an optional lastCheck). */
function migrateV3(x: Obj): Obj {
  return { ...x, version: 4, guidedSeconds: GUIDED_SECONDS.default };
}

/** v4 → v5: mixer profiles gained a channel compressor type. */
function migrateV4(x: Obj): Obj {
  return {
    ...x,
    version: 5,
    mixers: Array.isArray(x.mixers)
      ? x.mixers.map((m) => (isObj(m) && Array.isArray(m.bands) ? { ...m, compressor: defaultCompressor(m.bands as { kind: string }[]) } : m))
      : x.mixers,
  };
}

/**
 * Keeps every valid item. `dropped`: something had to be thrown away.
 * `migrated`: an older version was upgraded (caller backs up the original either way).
 */
export function parse(input: unknown): { data: AppData; dropped: boolean; migrated: boolean } {
  let x = input;
  let migrated = false;
  if (isObj(x) && x.version === 1) {
    x = migrateV1(x);
    migrated = true;
  }
  if (isObj(x) && x.version === 2) {
    x = migrateV2(x);
    migrated = true;
  }
  if (isObj(x) && x.version === 3) {
    x = migrateV3(x);
    migrated = true;
  }
  if (isObj(x) && x.version === 4) {
    x = migrateV4(x);
    migrated = true;
  }
  if (!isObj(x) || x.version !== 5 || !Array.isArray(x.mixers) || !Array.isArray(x.bands) || !Array.isArray(x.rooms)) {
    return { data: defaults(), dropped: true, migrated };
  }
  const mixers = x.mixers.filter(isMixerProfile);
  const bands = x.bands.filter(isBandSetup);
  const rooms = x.rooms.filter(isRoom);
  let dropped = mixers.length !== x.mixers.length || bands.length !== x.bands.length || rooms.length !== x.rooms.length;
  if (mixers.length === 0) {
    mixers.push(defaults().mixers[0]);
    dropped = true;
  }
  const activeMixerId = mixers.some((m) => m.id === x.activeMixerId) ? (x.activeMixerId as string) : mixers[0].id;
  const activeBandId = bands.some((b) => b.id === x.activeBandId) ? (x.activeBandId as string) : null;
  const activeRoomId = rooms.some((r) => r.id === x.activeRoomId) ? (x.activeRoomId as string) : null;
  const g = x.guidedSeconds;
  const guidedSeconds = isNum(g) && g >= GUIDED_SECONDS.min && g <= GUIDED_SECONDS.max ? g : GUIDED_SECONDS.default;
  const balanceSpeed = Object.hasOwn(BALANCE_SPEEDS, x.balanceSpeed as string) ? (x.balanceSpeed as BalanceSpeed) : 'normal';
  return {
    data: { version: 5, mixers, activeMixerId, bands, activeBandId, rooms, activeRoomId, balanceSpeed, guidedSeconds },
    dropped,
    migrated,
  };
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
  const { data, dropped, migrated } = parse(json);
  if (!dropped && !migrated) return { data };

  // Keep the original so nothing is lost when the repaired data is saved over it.
  try {
    storage.setItem(BACKUP_KEY, raw);
  } catch {
    /* best effort */
  }
  if (!dropped) return { data };
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
