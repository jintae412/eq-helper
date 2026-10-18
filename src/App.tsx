import { useEffect, useState } from 'react';
import { load, save, type AppData } from './storage/store';
import { ListenScreen } from './ui/ListenScreen';
import { FeedbackBanner } from './ui/FeedbackBanner';
import { useListening } from './ui/useListening';
import { BalancePanel } from './ui/BalancePanel';
import type { SourceType } from './advice/knowledgeBase';
import { AskScreen } from './ui/AskScreen';
import { SetupScreen } from './ui/SetupScreen';

const TABS = [
  { id: 'listen', label: 'Listen' },
  { id: 'ask', label: 'Ask' },
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
  const listening = useListening({ speed: data.balanceSpeed, room, hasKit });

  const updateRoom = (fn: (r: NonNullable<typeof room>) => NonNullable<typeof room>) =>
    room && update((d) => ({ ...d, rooms: d.rooms.map((r) => (r.id === room.id ? fn(r) : r)) }));

  return (
    <>
      <main>
        <FeedbackBanner alerts={listening.feedback.visible} outputs={mixer.outputs} band={band}
          onAcknowledge={listening.acknowledge} onDismiss={listening.dismiss} />
        {warning && (
          <div className="row error">
            {warning}
            <button className="quiet" onClick={dismissWarning}>OK</button>
          </div>
        )}
        {/* Hidden, not unmounted, so screen state (recording, typed text) survives tab switches. */}
        <section hidden={tab !== 'listen'}>
          <ListenScreen listening={listening} mixer={mixer}>
            <BalancePanel listening={listening} mixer={mixer} band={band} room={room} speed={data.balanceSpeed}
              onSpeedChange={(balanceSpeed) => update((d) => ({ ...d, balanceSpeed }))}
              onSaveReference={(mode, bandsDb) =>
                updateRoom((r) => ({ ...r, references: { ...r.references, [mode]: { savedAt: new Date().toISOString(), bandsDb } } }))}
              onSaveResonance={(freqHz, note) =>
                updateRoom((r) =>
                  r.knownResonances.some((k) => Math.abs(Math.log2(k.freqHz / freqHz)) <= SAME_RESONANCE_OCTAVES)
                    ? r
                    : { ...r, knownResonances: [...r.knownResonances, { freqHz, note }] })} />
          </ListenScreen>
        </section>
        <section hidden={tab !== 'ask'}>
          <AskScreen mixer={mixer} band={band} onGoToSetup={() => setTab('setup')} />
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
