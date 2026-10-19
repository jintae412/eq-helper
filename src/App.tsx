import { useCallback, useEffect, useState } from 'react';
import { load, save, type AppData } from './storage/store';
import { ListenScreen, type ListenView } from './ui/ListenScreen';
import { GuidedCheck } from './ui/GuidedCheck';
import { FeedbackBanner } from './ui/FeedbackBanner';
import { useListening } from './ui/useListening';
import { BalancePanel } from './ui/BalancePanel';
import { InstallCard, StartHere } from './ui/Help';
import type { SourceType } from './advice/knowledgeBase';
import { AskScreen } from './ui/AskScreen';
import { SetupScreen } from './ui/SetupScreen';
import { ReferenceScreen } from './ui/ReferenceScreen';

const TABS = [
  { id: 'listen', label: 'Listen' },
  { id: 'ask', label: 'Ask' },
  { id: 'reference', label: 'Reference' },
  { id: 'setup', label: 'Setup' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export type Update = (fn: (d: AppData) => AppData) => void;

// Real kits skew the full-mix spectrum (cymbal wash, kick boom); cajón and e-kits don't count.
const KIT: SourceType[] = ['kick', 'snare', 'toms', 'overheads'];
const SAME_RESONANCE_OCTAVES = 1 / 6;

function useAppData() {
  const [initial] = useState(() => load());
  const [data, setData] = useState(initial.data);
  const [warning, setWarning] = useState(initial.warning);

  useEffect(() => {
    if (!save(data)) setWarning('Couldn\'t save your changes. Storage may be full or blocked.');
  }, [data]);

  return { data, update: setData as Update, warning, dismissWarning: () => setWarning(undefined) };
}

export function App() {
  const [tab, setTab] = useState<Tab>('listen');
  const { data, update, warning, dismissWarning } = useAppData();
  const mixer = data.mixers.find((m) => m.id === data.activeMixerId) ?? data.mixers[0];
  const band = data.bands.find((b) => b.id === data.activeBandId);
  const room = data.rooms.find((r) => r.id === data.activeRoomId);
  const hasKit = band?.sources.some((s) => KIT.includes(s.type)) ?? false;
  const [view, setView] = useState<ListenView>('mix');
  const [ringingOut, setRingingOut] = useState(false);
  const listening = useListening({ speed: data.balanceSpeed, room, hasKit, balancePaused: view === 'guided' });
  const onRingOutChange = useCallback((active: boolean) => setRingingOut(active), []);

  function saveChecks(results: { sourceId: string; notes: string[] }[]) {
    if (!band) return;
    const at = new Date().toISOString();
    const byId = new Map(results.map((r) => [r.sourceId, r.notes]));
    update((d) => ({
      ...d,
      bands: d.bands.map((b) => (b.id !== band.id ? b : {
        ...b,
        sources: b.sources.map((s) => (byId.has(s.id) ? { ...s, lastCheck: { at, notes: byId.get(s.id)! } } : s)),
      })),
    }));
  }

  const updateRoom = (fn: (r: NonNullable<typeof room>) => NonNullable<typeof room>) =>
    room && update((d) => ({ ...d, rooms: d.rooms.map((r) => (r.id === room.id ? fn(r) : r)) }));

  return (
    <>
      <main>
        {/* Ring-out deliberately makes it ring: its own screen shows the rings instead. */}
        <FeedbackBanner alerts={ringingOut ? [] : listening.feedback.visible} outputs={mixer.outputs} band={band}
          onAcknowledge={listening.acknowledge} onDismiss={listening.dismiss} />
        {warning && (
          <div className="row error" role="alert">
            {warning}
            <button className="quiet" onClick={dismissWarning}>OK</button>
          </div>
        )}
        <InstallCard />
        {tab === 'listen' && <StartHere onGoToSetup={() => setTab('setup')} />}
        {/* Hidden, not unmounted, so screen state (recording, typed text) survives tab switches. */}
        <section hidden={tab !== 'listen'}>
          <ListenScreen listening={listening} mixer={mixer} view={view} onViewChange={setView}>
            {view === 'guided' ? (
              <GuidedCheck listening={listening} mixer={mixer} band={band} seconds={data.guidedSeconds}
                onSecondsChange={(guidedSeconds) => update((d) => ({ ...d, guidedSeconds }))}
                onSaveChecks={saveChecks} onRingOutChange={onRingOutChange} />
            ) : (
              <BalancePanel listening={listening} mixer={mixer} band={band} room={room} speed={data.balanceSpeed}
                onSpeedChange={(balanceSpeed) => update((d) => ({ ...d, balanceSpeed }))}
                onSaveReference={(mode, bandsDb) =>
                  updateRoom((r) => ({ ...r, references: { ...r.references, [mode]: { savedAt: new Date().toISOString(), bandsDb } } }))}
                onSaveResonance={(freqHz, note) =>
                  updateRoom((r) =>
                    r.knownResonances.some((k) => Math.abs(Math.log2(k.freqHz / freqHz)) <= SAME_RESONANCE_OCTAVES)
                      ? r
                      : { ...r, knownResonances: [...r.knownResonances, { freqHz, note }] })} />
            )}
          </ListenScreen>
        </section>
        <section hidden={tab !== 'ask'}>
          <AskScreen mixer={mixer} band={band} onGoToSetup={() => setTab('setup')} />
        </section>
        <section hidden={tab !== 'reference'}>
          <ReferenceScreen />
        </section>
        <section hidden={tab !== 'setup'}>
          <SetupScreen data={data} update={update} />
        </section>
      </main>
      <nav className="tabs" aria-label="Screens">
        {TABS.map((t) => (
          <button key={t.id} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
