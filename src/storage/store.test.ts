import { describe, expect, it } from 'vitest';
import { BACKUP_KEY, defaults, load, save, STORAGE_KEY, type AppData } from './store';

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  };
}

const sample = (): AppData => {
  const d = defaults();
  d.bands = [{ id: 'b1', name: 'Sunday', sources: [{ id: 's1', label: 'Sarah', type: 'female-vocal', mic: 'handheld-dynamic' }] }];
  d.activeBandId = 'b1';
  return d;
};

describe('storage', () => {
  it('round-trips valid data without warnings', () => {
    const s = memoryStorage();
    const data = sample();
    expect(save(data, s)).toBe(true);
    expect(load(s)).toEqual({ data });
  });

  it('returns defaults quietly on first run', () => {
    const { data, warning } = load(memoryStorage());
    expect(warning).toBeUndefined();
    expect(data.mixers).toHaveLength(1);
    expect(data.activeMixerId).toBe(data.mixers[0].id);
  });

  it('resets corrupt JSON but backs up the original', () => {
    const s = memoryStorage({ [STORAGE_KEY]: '{not json' });
    const { data, warning } = load(s);
    expect(warning).toBeDefined();
    expect(data.mixers).toHaveLength(1);
    expect(s.map.get(BACKUP_KEY)).toBe('{not json');
  });

  it('drops only the invalid items and repairs dangling ids', () => {
    const good = sample();
    const raw = {
      ...good,
      mixers: [...good.mixers, { id: 'bad', name: 'x', bands: [{ kind: 'sweep', label: 'MID', minHz: 900, maxHz: 100, maxGainDb: 15 }] }],
      bands: [...good.bands, { id: 'b2', name: 'y', sources: [{ id: 's', label: 'z', type: 'kazoo' }] }],
      activeMixerId: 'bad',
    };
    const s = memoryStorage({ [STORAGE_KEY]: JSON.stringify(raw) });
    const { data, warning } = load(s);
    expect(warning).toBeDefined();
    expect(data.mixers.map((m) => m.id)).toEqual([good.mixers[0].id]);
    expect(data.bands.map((b) => b.id)).toEqual(['b1']);
    expect(data.activeMixerId).toBe(good.mixers[0].id);
    expect(s.map.has(BACKUP_KEY)).toBe(true);
  });

  it('migrates v1 data to v2 quietly, keeping a backup of the original', () => {
    const v1 = {
      version: 1,
      mixers: [
        { id: 'm1', name: 'Analog', hpf: { minHz: 80, maxHz: 80 }, bands: [{ kind: 'fixed', label: 'MID', freqHz: 2500, maxGainDb: 15 }] },
        { id: 'm2', name: 'X32', bands: [{ kind: 'parametric', label: 'B1', minHz: 20, maxHz: 20000, maxGainDb: 15, minQ: 0.3, maxQ: 10 }] },
      ],
      activeMixerId: 'm2',
      bands: [],
      activeBandId: null,
    };
    const raw = JSON.stringify(v1);
    const s = memoryStorage({ [STORAGE_KEY]: raw });
    const { data, warning } = load(s);
    expect(warning).toBeUndefined();
    expect(data.version).toBe(3);
    expect(data.rooms).toEqual([]);
    expect(data.balanceSpeed).toBe('normal');
    expect(data.activeMixerId).toBe('m2');
    expect(data.mixers.map((m) => m.outputs.outputPeq)).toEqual([false, true]);
    expect(data.mixers[0].outputs.monitors).toBe('unknown');
    expect(s.map.get(BACKUP_KEY)).toBe(raw);
  });

  it('round-trips rooms and drops a room with a malformed reference', () => {
    const good = sample();
    good.rooms = [{ id: 'r1', name: 'Fellowship hall', knownResonances: [{ freqHz: 125, note: 'boom' }], references: { music: { savedAt: '2026-10-18', bandsDb: Array(24).fill(-30) } } }];
    good.activeRoomId = 'r1';
    good.balanceSpeed = 'fast';
    const s = memoryStorage();
    save(good, s);
    expect(load(s)).toEqual({ data: good });

    const bad = { ...good, rooms: [...good.rooms, { id: 'r2', name: 'x', knownResonances: [], references: { speech: { savedAt: 'x', bandsDb: [1, 2] } } }] };
    const s2 = memoryStorage({ [STORAGE_KEY]: JSON.stringify(bad) });
    const { data, warning } = load(s2);
    expect(warning).toBeDefined();
    expect(data.rooms.map((r) => r.id)).toEqual(['r1']);
  });

  it('warns instead of crashing when storage is blocked', () => {
    const blocked = { getItem: () => { throw new Error('SecurityError'); }, setItem: () => { throw new Error('QuotaExceeded'); } };
    expect(load(blocked).warning).toBeDefined();
    expect(save(defaults(), blocked)).toBe(false);
  });
});
