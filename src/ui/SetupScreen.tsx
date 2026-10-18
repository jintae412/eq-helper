import { useEffect, useState } from 'react';
import { SOURCE_LABELS, SOURCE_TYPES, type SourceType } from '../advice/knowledgeBase';
import {
  COMPRESSOR_LABELS, createFromPreset, MONITOR_LABELS, PRESETS,
  type BandKind, type CompressorType, type EqBand, type MixerProfile, type MonitorType, type PresetKind, type RigOutputs,
} from '../advice/mixer';
import { MIC_LABELS, type BandSetup, type BandSource, type MicType } from '../advice/band';
import type { AppData } from '../storage/store';
import { HelpSection } from './Help';
import type { ListenMode, RoomProfile } from '../advice/room';
import { formatHz } from '../advice/mixer';
import type { Update } from '../App';

export function SetupScreen({ data, update }: { data: AppData; update: Update }) {
  const [preset, setPreset] = useState<PresetKind>('3-band');
  const mixer = data.mixers.find((m) => m.id === data.activeMixerId) ?? data.mixers[0];
  const band = data.bands.find((b) => b.id === data.activeBandId);
  const room = data.rooms.find((r) => r.id === data.activeRoomId);
  const setRoom = (r: RoomProfile) => update((d) => ({ ...d, rooms: d.rooms.map((x) => (x.id === r.id ? r : x)) }));

  function addRoom() {
    const r: RoomProfile = { id: crypto.randomUUID(), name: 'New room', knownResonances: [], references: {} };
    update((d) => ({ ...d, rooms: [...d.rooms, r], activeRoomId: r.id }));
  }

  function deleteRoom() {
    if (!room || !confirm(`Delete "${room.name}"? Its known issues and references go with it.`)) return;
    update((d) => ({ ...d, rooms: d.rooms.filter((r) => r.id !== room.id), activeRoomId: null }));
  }

  const setMixer = (m: MixerProfile) => update((d) => ({ ...d, mixers: d.mixers.map((x) => (x.id === m.id ? m : x)) }));
  const setBand = (b: BandSetup) => update((d) => ({ ...d, bands: d.bands.map((x) => (x.id === b.id ? b : x)) }));

  function addMixer() {
    const m = createFromPreset(preset, `New ${PRESETS[preset].label.split(' (')[0]} mixer`);
    update((d) => ({ ...d, mixers: [...d.mixers, m], activeMixerId: m.id }));
  }

  function deleteMixer() {
    if (data.mixers.length <= 1 || !confirm(`Delete "${mixer.name}"?`)) return;
    update((d) => {
      const mixers = d.mixers.filter((m) => m.id !== mixer.id);
      return { ...d, mixers, activeMixerId: mixers[0].id };
    });
  }

  function addBand() {
    const b: BandSetup = { id: crypto.randomUUID(), name: 'New band', sources: [] };
    update((d) => ({ ...d, bands: [...d.bands, b], activeBandId: b.id }));
  }

  function deleteBand() {
    if (!band || !confirm(`Delete "${band.name}"?`)) return;
    update((d) => ({ ...d, bands: d.bands.filter((b) => b.id !== band.id), activeBandId: null }));
  }

  return (
    <>
      <h1>Setup</h1>

      <h2>Mixer &amp; speakers</h2>
      <label className="field">
        Using
        <select value={mixer.id} onChange={(e) => update((d) => ({ ...d, activeMixerId: e.target.value }))}>
          {data.mixers.map((m) => <option key={m.id} value={m.id}>{m.name || 'Untitled mixer'}</option>)}
        </select>
      </label>
      <div className="row">
        <select value={preset} onChange={(e) => setPreset(e.target.value as PresetKind)} aria-label="Mixer type for new mixer">
          {(Object.keys(PRESETS) as PresetKind[]).map((k) => <option key={k} value={k}>{PRESETS[k].label}</option>)}
        </select>
        <button className="quiet" onClick={addMixer}>Add mixer</button>
      </div>
      <MixerEditor key={mixer.id} mixer={mixer} onChange={setMixer} />
      <button className="danger" disabled={data.mixers.length <= 1} onClick={deleteMixer}>Delete this mixer</button>

      <h2>Band</h2>
      <label className="field">
        Playing today
        <select value={data.activeBandId ?? ''} onChange={(e) => update((d) => ({ ...d, activeBandId: e.target.value || null }))}>
          <option value="">None</option>
          {data.bands.map((b) => <option key={b.id} value={b.id}>{b.name || 'Untitled band'}</option>)}
        </select>
      </label>
      <div className="row">
        <button className="quiet" onClick={addBand}>New band</button>
      </div>
      {band && (
        <>
          <BandEditor key={band.id} band={band} onChange={setBand} />
          <button className="danger" onClick={deleteBand}>Delete this band</button>
        </>
      )}

      <h2>Room</h2>
      <label className="field">
        Playing at
        <select value={data.activeRoomId ?? ''} onChange={(e) => update((d) => ({ ...d, activeRoomId: e.target.value || null }))}>
          <option value="">None</option>
          {data.rooms.map((r) => <option key={r.id} value={r.id}>{r.name || 'Untitled room'}</option>)}
        </select>
      </label>
      <div className="row">
        <button className="quiet" onClick={addRoom}>New room</button>
      </div>
      {room && (
        <>
          <RoomEditor key={room.id} room={room} onChange={setRoom} />
          <button className="danger" onClick={deleteRoom}>Delete this room</button>
        </>
      )}

      <HelpSection />
    </>
  );
}

// ── Room editor ─────────────────────────────────────────────────────────────

const MODE_LABELS: Record<ListenMode, string> = { music: 'Music', speech: 'Speech' };

function RoomEditor({ room, onChange }: { room: RoomProfile; onChange: (r: RoomProfile) => void }) {
  const setResonance = (i: number, patch: Partial<RoomProfile['knownResonances'][number]>) =>
    onChange({ ...room, knownResonances: room.knownResonances.map((k, j) => (j === i ? { ...k, ...patch } : k)) });

  function clearReference(mode: ListenMode) {
    const references = { ...room.references };
    delete references[mode];
    onChange({ ...room, references });
  }

  return (
    <div className="card">
      <label className="field">
        Room name
        <input value={room.name} onChange={(e) => onChange({ ...room, name: e.target.value })} />
      </label>

      <h3>Known issues</h3>
      <p className="muted">Frequencies this room always has trouble with. Add them here or with "Save to room" on the Listen tab.</p>
      {room.knownResonances.map((k, i) => (
        <div key={i} className="row band">
          <NumberField label="Hz" value={k.freqHz} min={20} max={20000} onCommit={(freqHz) => setResonance(i, { freqHz })} />
          <input className="short" placeholder="Note, e.g. boomy" value={k.note} aria-label={`Note for ${formatHz(k.freqHz)}`}
            onChange={(e) => setResonance(i, { note: e.target.value })} />
          <button className="quiet" aria-label={`Remove ${formatHz(k.freqHz)}`}
            onClick={() => onChange({ ...room, knownResonances: room.knownResonances.filter((_, j) => j !== i) })}>✕</button>
        </div>
      ))}
      <button className="quiet" onClick={() => onChange({ ...room, knownResonances: [...room.knownResonances, { freqHz: 125, note: '' }] })}>
        Add known issue
      </button>

      <h3>"Sounds good" references</h3>
      {(Object.keys(MODE_LABELS) as ListenMode[]).map((m) => {
        const ref = room.references[m];
        return (
          <div key={m} className="row">
            <span>{MODE_LABELS[m]}: {ref ? `saved ${new Date(ref.savedAt).toLocaleDateString()}` : 'none yet (save one from the Listen tab)'}</span>
            {ref && <button className="quiet" onClick={() => clearReference(m)}>Clear</button>}
          </div>
        );
      })}
    </div>
  );
}

// ── Mixer editor ────────────────────────────────────────────────────────────

function convertBand(b: EqBand, kind: BandKind): EqBand {
  const center = b.kind === 'fixed' ? b.freqHz : Math.round(Math.sqrt(b.minHz * b.maxHz));
  const base = { label: b.label, maxGainDb: b.maxGainDb };
  if (kind === 'fixed') return { ...base, kind, freqHz: center };
  // 100 Hz–8 kHz is the most common sweepable-mid range printed on analog boards.
  const range = b.kind === 'fixed' ? { minHz: 100, maxHz: 8000 } : { minHz: b.minHz, maxHz: b.maxHz };
  return kind === 'sweep' ? { ...base, kind, ...range } : { ...base, kind, ...range, minQ: 0.3, maxQ: 10 };
}

const KIND_LABELS: Record<BandKind, string> = { fixed: 'Fixed', sweep: 'Sweepable', parametric: 'Parametric' };

function MixerEditor({ mixer, onChange }: { mixer: MixerProfile; onChange: (m: MixerProfile) => void }) {
  const setBand = (i: number, b: EqBand) => onChange({ ...mixer, bands: mixer.bands.map((x, j) => (j === i ? b : x)) });
  const o = mixer.outputs;
  const setOutputs = (patch: Partial<RigOutputs>) => onChange({ ...mixer, outputs: { ...o, ...patch } });
  const hpfMode = !mixer.hpf ? 'none' : mixer.hpf.minHz === mixer.hpf.maxHz ? 'fixed' : 'range';

  function setHpfMode(mode: string) {
    const hpf = mode === 'none' ? undefined : mode === 'fixed' ? { minHz: 80, maxHz: 80 } : { minHz: 20, maxHz: 400 };
    onChange({ ...mixer, hpf });
  }

  return (
    <div className="card">
      <p className="muted">Match these to the numbers printed next to the knobs on your mixer.</p>
      <label className="field">
        Name
        <input value={mixer.name} onChange={(e) => onChange({ ...mixer, name: e.target.value })} />
      </label>

      <h3>High-pass filter (HPF / low cut)</h3>
      <div className="row">
        <select value={hpfMode} onChange={(e) => setHpfMode(e.target.value)} aria-label="High-pass filter type">
          <option value="none">None</option>
          <option value="fixed">On/off button</option>
          <option value="range">Adjustable knob</option>
        </select>
        {mixer.hpf && hpfMode === 'fixed' && (
          <NumberField label="Hz" value={mixer.hpf.minHz} min={20} max={400}
            onCommit={(hz) => onChange({ ...mixer, hpf: { minHz: hz, maxHz: hz } })} />
        )}
        {mixer.hpf && hpfMode === 'range' && (
          <>
            <NumberField label="From Hz" value={mixer.hpf.minHz} min={20} max={mixer.hpf.maxHz - 1}
              onCommit={(hz) => onChange({ ...mixer, hpf: { ...mixer.hpf!, minHz: hz } })} />
            <NumberField label="To Hz" value={mixer.hpf.maxHz} min={mixer.hpf.minHz + 1} max={1000}
              onCommit={(hz) => onChange({ ...mixer, hpf: { ...mixer.hpf!, maxHz: hz } })} />
          </>
        )}
      </div>

      <h3>EQ knobs (per channel)</h3>
      {mixer.bands.map((b, i) => (
        <div key={i} className="row band">
          <input className="short" value={b.label} aria-label="Knob name" onChange={(e) => setBand(i, { ...b, label: e.target.value })} />
          <select value={b.kind} aria-label="Knob type" onChange={(e) => setBand(i, convertBand(b, e.target.value as BandKind))}>
            {(Object.keys(KIND_LABELS) as BandKind[]).map((k) => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
          </select>
          {b.kind === 'fixed' ? (
            <NumberField label="Hz" value={b.freqHz} min={20} max={20000} onCommit={(freqHz) => setBand(i, { ...b, freqHz })} />
          ) : (
            <>
              <NumberField label="From Hz" value={b.minHz} min={20} max={b.maxHz - 1} onCommit={(minHz) => setBand(i, { ...b, minHz })} />
              <NumberField label="To Hz" value={b.maxHz} min={b.minHz + 1} max={20000} onCommit={(maxHz) => setBand(i, { ...b, maxHz })} />
            </>
          )}
          <NumberField label="± dB" value={b.maxGainDb} min={1} max={24} onCommit={(maxGainDb) => setBand(i, { ...b, maxGainDb })} />
          <button className="quiet" aria-label={`Remove ${b.label}`}
            onClick={() => onChange({ ...mixer, bands: mixer.bands.filter((_, j) => j !== i) })}>✕</button>
        </div>
      ))}
      <button className="quiet"
        onClick={() => onChange({ ...mixer, bands: [...mixer.bands, { kind: 'sweep', label: 'MID', minHz: 100, maxHz: 8000, maxGainDb: 15 }] })}>
        Add knob
      </button>

      <h3>Channel compressor</h3>
      <label className="field">
        What each channel has
        <select value={mixer.compressor} onChange={(e) => onChange({ ...mixer, compressor: e.target.value as CompressorType })}>
          {(Object.keys(COMPRESSOR_LABELS) as CompressorType[]).map((c) => <option key={c} value={c}>{COMPRESSOR_LABELS[c]}</option>)}
        </select>
      </label>
      <p className="muted">Compression is for experienced mixers. Beginners can leave it alone.</p>

      <h3>Speakers &amp; monitors</h3>
      <p className="muted">Used to tailor feedback advice.</p>
      <label className="field">
        Monitors
        <select value={o.monitors} onChange={(e) => setOutputs({ monitors: e.target.value as MonitorType })}>
          {(Object.keys(MONITOR_LABELS) as MonitorType[]).map((m) => <option key={m} value={m}>{MONITOR_LABELS[m]}</option>)}
        </select>
      </label>
      <label className="check">
        <input type="checkbox" checked={o.geqOnMains} onChange={(e) => setOutputs({ geqOnMains: e.target.checked })} />
        Graphic EQ on the main speakers
      </label>
      {(o.monitors === 'wedges' || o.monitors === 'unknown') && (
        <label className="check">
          <input type="checkbox" checked={o.geqOnMonitors} onChange={(e) => setOutputs({ geqOnMonitors: e.target.checked })} />
          Graphic EQ on the monitors
        </label>
      )}
      <label className="check">
        <input type="checkbox" checked={o.outputPeq} onChange={(e) => setOutputs({ outputPeq: e.target.checked })} />
        Mixer has EQ on its outputs (most digital mixers)
      </label>
    </div>
  );
}

// ── Band editor ─────────────────────────────────────────────────────────────

function BandEditor({ band, onChange }: { band: BandSetup; onChange: (b: BandSetup) => void }) {
  const setSource = (s: BandSource) => onChange({ ...band, sources: band.sources.map((x) => (x.id === s.id ? s : x)) });

  return (
    <div className="card">
      <label className="field">
        Band name
        <input value={band.name} onChange={(e) => onChange({ ...band, name: e.target.value })} />
      </label>
      <h3>Who's playing</h3>
      {band.sources.map((s) => (
        <div key={s.id} className="row band">
          <input className="short" placeholder="Name, e.g. Sarah" value={s.label} aria-label="Name"
            onChange={(e) => setSource({ ...s, label: e.target.value })} />
          <select value={s.type} aria-label="Instrument" onChange={(e) => setSource({ ...s, type: e.target.value as SourceType })}>
            {SOURCE_TYPES.filter((t) => t !== 'full-mix').map((t) => <option key={t} value={t}>{SOURCE_LABELS[t]}</option>)}
          </select>
          <select value={s.mic ?? ''} aria-label="Mic type (optional)"
            onChange={(e) => setSource({ ...s, mic: (e.target.value || undefined) as MicType | undefined })}>
            <option value="">Mic: not sure</option>
            {(Object.keys(MIC_LABELS) as MicType[]).map((m) => <option key={m} value={m}>{MIC_LABELS[m]}</option>)}
          </select>
          <button className="quiet" aria-label={`Remove ${s.label || 'source'}`}
            onClick={() => onChange({ ...band, sources: band.sources.filter((x) => x.id !== s.id) })}>✕</button>
        </div>
      ))}
      <button className="quiet"
        onClick={() => onChange({ ...band, sources: [...band.sources, { id: crypto.randomUUID(), label: '', type: 'male-vocal' }] })}>
        Add person / instrument
      </button>
    </div>
  );
}

// ── Inputs ──────────────────────────────────────────────────────────────────

/** Commits on blur/Enter only if valid; otherwise snaps back. Lets users clear and retype. */
function NumberField({ label, value, min, max, onCommit }: {
  label: string; value: number; min: number; max: number; onCommit: (n: number) => void;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  function commit() {
    const n = Number(text);
    if (text.trim() !== '' && Number.isFinite(n) && n >= min && n <= max) onCommit(n);
    else setText(String(value));
  }

  return (
    <label className="field inline">
      {label}
      <input className="num" inputMode="decimal" value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
    </label>
  );
}
