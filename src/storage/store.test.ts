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

  it('warns instead of crashing when storage is blocked', () => {
    const blocked = { getItem: () => { throw new Error('SecurityError'); }, setItem: () => { throw new Error('QuotaExceeded'); } };
    expect(load(blocked).warning).toBeDefined();
    expect(save(defaults(), blocked)).toBe(false);
  });
});
