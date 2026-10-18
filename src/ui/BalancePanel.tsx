import { BALANCE_SPEEDS, type BalanceFinding, type BalanceSpeed } from '../analysis/balance';
import type { TrackedIssue } from '../analysis/balanceTracker';
import { describeFinding, preCut } from '../advice/balanceAdvice';
import type { BandSetup } from '../advice/band';
import { formatHz, type MixerProfile } from '../advice/mixer';
import type { ListenMode, RoomProfile } from '../advice/room';
import { MIN_FILL, REFERENCE_FILL, type Listening } from './useListening';

interface Props {
  listening: Listening;
  mixer: MixerProfile;
  band?: BandSetup;
  room?: RoomProfile;
  speed: BalanceSpeed;
  onSpeedChange: (s: BalanceSpeed) => void;
  onSaveReference: (mode: ListenMode, bandsDb: number[]) => void;
  onSaveResonance: (freqHz: number, note: string) => void;
}

const MAX_CARDS = 3;

export function BalancePanel({ listening, mixer, band, room, speed, onSpeedChange, onSaveReference, onSaveResonance }: Props) {
  const { capture, balance, fill, checked, mode } = listening;
  const reference = room?.references[mode];
  const windowS = BALANCE_SPEEDS[speed].windowS;

  function saveReference() {
    const bands = listening.referenceCandidate();
    if (bands) onSaveReference(mode, bands);
  }

  let status: string | null = null;
  if (!capture) status = 'Start listening to get mix balance advice.';
  else if (fill < MIN_FILL) status = `Listening… first advice in about ${Math.ceil((MIN_FILL - fill) * windowS)} s (while music is playing).`;
  else if (!checked) status = 'Checking the mix…';
  else if (balance.current.length === 0) status = 'No balance issues right now.';

  return (
    <>
      <h2>Mix balance</h2>

      {room && room.knownResonances.length > 0 && (
        <div className="card">
          <h3>Before the service: known issues in {room.name || 'this room'}</h3>
          <ul>
            {room.knownResonances.map((r) => (
              <li key={r.freqHz}><strong>{formatHz(r.freqHz)}</strong>{r.note && ` (${r.note})`}: {preCut(r.freqHz, mixer.outputs)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="row">
        <div className="segmented" role="group" aria-label="What's happening">
          {(['music', 'speech'] as const).map((m) => (
            <button key={m} aria-pressed={mode === m} onClick={() => listening.setMode(m)}>
              {m === 'music' ? 'Music' : 'Speech'}
            </button>
          ))}
        </div>
        <label className="field inline">
          Responsiveness
          <select value={speed} onChange={(e) => onSpeedChange(e.target.value as BalanceSpeed)}>
            {(Object.keys(BALANCE_SPEEDS) as BalanceSpeed[]).map((s) => (
              <option key={s} value={s}>{BALANCE_SPEEDS[s].label} ({BALANCE_SPEEDS[s].windowS} s)</option>
            ))}
          </select>
        </label>
      </div>

      <p className="muted">
        {!room
          ? 'No room picked: comparing the mix to its own overall shape.'
          : reference
            ? `Comparing to the ${mode} reference for ${room.name || 'this room'} (saved ${new Date(reference.savedAt).toLocaleDateString()}).`
            : `No ${mode} reference for ${room.name || 'this room'} yet: comparing the mix to its own overall shape.`}
      </p>

      {status && <p>{status}</p>}

      {balance.current.slice(0, MAX_CARDS).map((issue, i) => (
        <IssueCard key={issue.key} issue={issue} primary={i === 0} mixer={mixer} band={band} mode={mode}
          canSaveToRoom={!!room} onSaveResonance={onSaveResonance} />
      ))}

      {room ? (
        <div className="row">
          <button className="quiet" disabled={!capture || fill < REFERENCE_FILL} onClick={saveReference}>
            This sounds good: save as {mode} reference
          </button>
          <span className="muted">Keep the phone at the board. References only compare well from the same spot.</span>
        </div>
      ) : (
        <p className="muted">Pick a room in Setup to save a "sounds good" reference.</p>
      )}

      {balance.history.length > 0 && (
        <>
          <h3>Earlier this session</h3>
          <ul className="log">
            {balance.history.map((h) => {
              const a = describeFinding(h.finding, mixer, mode, band);
              return <li key={h.key}><strong>{a.title}</strong> ({a.detail}){h.count > 1 && `, ${h.count}×`}</li>;
            })}
          </ul>
        </>
      )}
    </>
  );
}

const canPin = (f: BalanceFinding) => f.direction === 'bump' && f.region !== 'overall' && !f.knownRoomIssue;

function IssueCard({ issue, primary, mixer, band, mode, canSaveToRoom, onSaveResonance }: {
  issue: TrackedIssue; primary: boolean; mixer: MixerProfile; band?: BandSetup; mode: ListenMode;
  canSaveToRoom: boolean; onSaveResonance: (freqHz: number, note: string) => void;
}) {
  const f = issue.finding;
  const a = describeFinding(f, mixer, mode, band);
  return (
    <article className={primary ? 'card' : 'card secondary'}>
      <h3>{a.title} <span className="muted">· {a.detail}</span></h3>
      {a.notes.map((n) => <p key={n} className="note">{n}</p>)}
      <ol>{a.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      <details>
        <summary>Why</summary>
        <p>{a.why}</p>
      </details>
      {canSaveToRoom && canPin(f) && (
        <button className="quiet" onClick={() => onSaveResonance(f.freqHz, a.title)}>Save to room as a known issue</button>
      )}
    </article>
  );
}
