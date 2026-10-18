import { useEffect, useRef, useState } from 'react';
import { BandAverager, FRAMES_PER_SECOND, toThirdOctaves } from '../analysis/balance';
import { analyzeSolo } from '../analysis/sourceCheck';
import { frameLevelDb, LevelWindow } from '../analysis/dynamics';
import { compressorAdvice, type CompressorAdvice } from '../advice/compressorAdvice';
import { CompressorCard } from './CompressorCard';
import { PeakFollower } from '../analysis/sweep';
import type { BandSetup, BandSource } from '../advice/band';
import { ringOutFix } from '../advice/feedbackAdvice';
import { SOURCE_LABELS, SOURCE_TYPES, type SourceType } from '../advice/knowledgeBase';
import { formatHz, type MixerProfile } from '../advice/mixer';
import { describeSolo, HPF_CUTOFF, summaryLine, type SourceAdvice } from '../advice/sourceCheckAdvice';
import { GUIDED_SECONDS } from '../storage/store';
import type { Listening } from './useListening';

interface Props {
  listening: Listening;
  mixer: MixerProfile;
  band?: BandSetup;
  seconds: number;
  onSecondsChange: (s: number) => void;
  onSaveChecks: (results: { sourceId: string; notes: string[] }[]) => void;
  onRingOutChange: (active: boolean) => void;
}

type Step =
  | { kind: 'intro' }
  | { kind: 'prompt'; index: number }
  | { kind: 'capturing'; index: number }
  | { kind: 'result'; index: number; report: Report; previousSwingDb?: number }
  | { kind: 'summary' }
  | { kind: 'ringout-safety' }
  | { kind: 'ringout'; mic: number };

interface Report {
  items: SourceAdvice[];
  comp: CompressorAdvice | null;
}
type Result = Report | 'skipped';

const ADHOC_ID = 'adhoc';
const VOICES: SourceType[] = ['male-vocal', 'female-vocal', 'speech-headset', 'speech-handheld'];
const CAPTURE_TICK_MS = 100; // level every tick (for dynamics), bands every few ticks
const TICKS_PER_BAND_FRAME = 1000 / CAPTURE_TICK_MS / FRAMES_PER_SECOND;
const SILENCE_HINT_MS = 8000;
const MAX_RINGS = 4;
const SAME_RING_OCTAVES = 1 / 12;

const reportLines = (r: Report) => [
  ...r.items.map(summaryLine),
  ...(r.comp?.needed ? [`Compressor (swing ${Math.round(r.comp.swingDb)} dB): ${r.comp.steps[0]}`] : []),
];

const verb = (t: SourceType) => (t.startsWith('speech') ? 'talk' : VOICES.includes(t) ? 'sing' : 'play');
const nameOf = (s: BandSource) => s.label.trim() || SOURCE_LABELS[s.type];
const dateOf = (iso: string) => new Date(iso).toLocaleDateString();

export function GuidedCheck({ listening, mixer, band, seconds, onSecondsChange, onSaveChecks, onRingOutChange }: Props) {
  const { capture } = listening;
  const [step, setStep] = useState<Step>({ kind: 'intro' });
  const [adhocType, setAdhocType] = useState<SourceType>('female-vocal');
  const [results, setResults] = useState<Record<number, Result>>({});

  const targets: BandSource[] = band?.sources.length
    ? band.sources
    : [{ id: ADHOC_ID, label: '', type: adhocType }];
  const canRingOut = mixer.outputs.monitors === 'wedges' || mixer.outputs.monitors === 'unknown';
  const voiceMics = targets.filter((t) => VOICES.includes(t.type));
  const ringTargets = voiceMics.length ? voiceMics : [{ id: ADHOC_ID, label: 'the vocal mic', type: 'female-vocal' as const }];

  useEffect(() => {
    onRingOutChange(step.kind === 'ringout');
    return () => onRingOutChange(false); // leaving guided mode mid ring-out must bring the banner back
  }, [step.kind, onRingOutChange]);

  function next(index: number, result: Result) {
    const updated = { ...results, [index]: result };
    setResults(updated);
    if (index + 1 < targets.length) {
      setStep({ kind: 'prompt', index: index + 1 });
      return;
    }
    onSaveChecks(
      targets.flatMap((t, i) => {
        const r = updated[i];
        return t.id === ADHOC_ID || !r || r === 'skipped' ? [] : [{ sourceId: t.id, notes: reportLines(r) }];
      }),
    );
    setStep({ kind: 'summary' });
  }

  if (!capture && step.kind !== 'intro' && step.kind !== 'summary') {
    return <p className="note">Listening stopped. Tap "Start listening" above to continue.</p>;
  }

  switch (step.kind) {
    case 'intro':
      return (
        <>
          <h2>Guided check</h2>
          <p className="muted">One person at a time through the speakers, then a short report for each.</p>
          {band?.sources.length ? (
            <ul className="log">
              {band.sources.map((s) => (
                <li key={s.id}>
                  <strong>{nameOf(s)}</strong> <span className="muted">({SOURCE_LABELS[s.type]})</span>
                  {s.lastCheck && <LastCheckNote check={s.lastCheck} />}
                </li>
              ))}
            </ul>
          ) : (
            <label className="field">
              No band set up, so check one source:
              <select value={adhocType} onChange={(e) => setAdhocType(e.target.value as SourceType)}>
                {SOURCE_TYPES.filter((t) => t !== 'full-mix').map((t) => <option key={t} value={t}>{SOURCE_LABELS[t]}</option>)}
              </select>
            </label>
          )}
          <label className="field">
            Listen to each person for {seconds} s
            <input type="range" min={GUIDED_SECONDS.min} max={GUIDED_SECONDS.max} step={1} value={seconds}
              onChange={(e) => onSecondsChange(Number(e.target.value))} />
          </label>
          {!capture && <p className="note">Tap "Start listening" above first.</p>}
          <div className="row">
            <button disabled={!capture} onClick={() => { setResults({}); setStep({ kind: 'prompt', index: 0 }); }}>Start guided check</button>
            {canRingOut && <button className="quiet" disabled={!capture} onClick={() => setStep({ kind: 'ringout-safety' })}>Ring out monitors</button>}
          </div>
        </>
      );

    case 'prompt': {
      const t = targets[step.index];
      return (
        <div className="card">
          <p className="muted">{step.index + 1} of {targets.length}</p>
          <h2>{nameOf(t)}</h2>
          <ol>
            <li>Pull <strong>every fader down except {nameOf(t)}'s</strong>. The SOLO/PFL button only goes to headphones, so the phone can't hear it.</li>
            <li>Have them {verb(t.type)} at service volume. Keep the phone at the board.</li>
          </ol>
          {t.lastCheck && <LastCheckNote check={t.lastCheck} />}
          <div className="row">
            <button onClick={() => setStep({ kind: 'capturing', index: step.index })}>Start listening to {nameOf(t)}</button>
            <button className="quiet" onClick={() => next(step.index, 'skipped')}>Skip</button>
          </div>
        </div>
      );
    }

    case 'capturing':
      return <Capturing key={step.index} listening={listening} source={targets[step.index]} seconds={seconds} mixer={mixer}
        onDone={(report) => {
          const prev = results[step.index];
          setStep({ kind: 'result', index: step.index, report, previousSwingDb: prev && prev !== 'skipped' ? prev.comp?.swingDb : undefined });
          setResults((r) => ({ ...r, [step.index]: report }));
        }}
        onCancel={() => setStep({ kind: 'prompt', index: step.index })} />;

    case 'result': {
      const t = targets[step.index];
      return (
        <>
          <h2>{nameOf(t)}</h2>
          {step.report.items.length === 0 && <p>EQ sounds balanced. Nothing sticks out.</p>}
          {step.report.items.map((a) => <SourceCard key={a.title + a.detail} advice={a} listening={listening} />)}
          {step.report.comp && <CompressorCard advice={step.report.comp} previousSwingDb={step.previousSwingDb} />}
          <div className="row">
            <button onClick={() => next(step.index, step.report)}>{step.index + 1 < targets.length ? 'Next person' : 'Finish'}</button>
            <button className="quiet" onClick={() => setStep({ kind: 'capturing', index: step.index })}>Redo</button>
          </div>
        </>
      );
    }

    case 'summary':
      return (
        <>
          <h2>Soundcheck summary</h2>
          <ul className="log">
            {targets.map((t, i) => {
              const r = results[i];
              return (
                <li key={t.id}>
                  <strong>{nameOf(t)}</strong>:{' '}
                  {r === 'skipped' || !r ? <span className="muted">skipped</span>
                    : reportLines(r).length === 0 ? 'sounded fine'
                    : <ul>{reportLines(r).map((line) => <li key={line}>{line}</li>)}</ul>}
                </li>
              );
            })}
          </ul>
          {band?.sources.length ? <p className="muted">Saved to the band, so it shows up next time.</p> : null}
          <div className="row">
            {canRingOut && <button onClick={() => setStep({ kind: 'ringout-safety' })}>Ring out monitors (optional)</button>}
            <button className="quiet" onClick={() => setStep({ kind: 'intro' })}>Done</button>
          </div>
        </>
      );

    case 'ringout-safety':
      return <RingOutSafety onStart={() => setStep({ kind: 'ringout', mic: 0 })} onSkip={() => setStep({ kind: 'intro' })} />;

    case 'ringout':
      return <RingOut key={step.mic} listening={listening} mixer={mixer} mic={ringTargets[step.mic]}
        position={`${step.mic + 1} of ${ringTargets.length}`}
        onNext={() => (step.mic + 1 < ringTargets.length ? setStep({ kind: 'ringout', mic: step.mic + 1 }) : setStep({ kind: 'intro' }))}
        onFinish={() => setStep({ kind: 'intro' })} />;
  }
}

function LastCheckNote({ check }: { check: NonNullable<BandSource['lastCheck']> }) {
  return (
    <div className="muted">
      Last check ({dateOf(check.at)}): {check.notes.length ? check.notes.join(' · ') : 'sounded fine'}
    </div>
  );
}

// ── Capture one source ──────────────────────────────────────────────────────

function Capturing({ listening, source, seconds, mixer, onDone, onCancel }: {
  listening: Listening; source: BandSource; seconds: number; mixer: MixerProfile;
  onDone: (report: Report) => void; onCancel: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [hearNothing, setHearNothing] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const capture = listening.capture;
    if (!capture) return;
    const avg = new BandAverager(seconds * FRAMES_PER_SECOND);
    const levels = new LevelWindow(Number.MAX_SAFE_INTEGER);
    let lastHeard = Date.now();
    let tick = 0;
    const id = setInterval(() => {
      const db = capture.read();
      levels.push(frameLevelDb(db, capture.binHz));
      if (++tick % TICKS_PER_BAND_FRAME !== 0) return;
      if (avg.push(toThirdOctaves(db, capture.binHz))) lastHeard = Date.now();
      setProgress(avg.fill);
      setHearNothing(Date.now() - lastHeard > SILENCE_HINT_MS);
      if (avg.fill < 1) return;
      clearInterval(id);
      const swing = levels.swingDb();
      done.current({
        items: describeSolo(analyzeSolo(avg.average()!, HPF_CUTOFF[source.type]), source.type, mixer),
        comp: swing === null ? null : compressorAdvice(source.type, swing, mixer),
      });
    }, CAPTURE_TICK_MS);
    return () => clearInterval(id);
  }, [listening.capture, seconds, source.type, mixer]);

  return (
    <div className="card">
      <h2>Listening to {nameOf(source)}…</h2>
      <progress value={progress} max={1} aria-label="Capture progress" />
      <p className="muted">Pauses don't count, so it waits for sound.</p>
      {hearNothing && <p className="note" role="status">Can't hear anything. Is {nameOf(source)}'s fader up, and are they {verb(source.type)}ing?</p>}
      <button className="quiet" onClick={onCancel}>Cancel</button>
    </div>
  );
}

// ── Result card + listen-along sweep ────────────────────────────────────────

function SourceCard({ advice, listening }: { advice: SourceAdvice; listening: Listening }) {
  const [sweeping, setSweeping] = useState(false);
  return (
    <article className="card">
      <h3>{advice.title} <span className="muted">· {advice.detail}</span></h3>
      {advice.notes.map((n) => <p key={n} className="note">{n}</p>)}
      <ol>{advice.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      <details>
        <summary>Why</summary>
        <p>{advice.why}</p>
      </details>
      {advice.sweep && !sweeping && <button className="quiet" onClick={() => setSweeping(true)}>Find it exactly</button>}
      {advice.sweep && sweeping && <Sweep range={advice.sweep} listening={listening} onDone={() => setSweeping(false)} />}
    </article>
  );
}

function Sweep({ range, listening, onDone }: { range: { loHz: number; hiHz: number }; listening: Listening; onDone: () => void }) {
  const [peak, setPeak] = useState<number | null>(null);

  useEffect(() => {
    const capture = listening.capture;
    if (!capture) return;
    const follower = new PeakFollower(range.loHz, range.hiHz);
    const id = setInterval(() => setPeak(follower.update(capture.read(), capture.binHz)), 200);
    return () => clearInterval(id);
  }, [listening.capture, range.loHz, range.hiHz]);

  return (
    <div className="sweep">
      <p className="note">Turn this channel's fader down a little first. A big narrow boost can start feedback.</p>
      <ol>
        <li>Turn the band's gain <strong>up about +10 dB</strong>.</li>
        <li>Slowly sweep its frequency between {formatHz(range.loHz)} and {formatHz(range.hiHz)} while they keep going.</li>
        <li>Where it sounds worst, stop, and turn the boost into a <strong>3–6 dB cut</strong>. Bring the fader back.</li>
      </ol>
      <p className="peak">Loudest point right now: <strong>{peak ? `~${formatHz(peak)}` : '…'}</strong></p>
      <button className="quiet" onClick={onDone}>Done sweeping</button>
    </div>
  );
}

// ── Ring-out ────────────────────────────────────────────────────────────────

function RingOutSafety({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="card">
      <h2>Ring out the monitors (optional)</h2>
      <p>This finds the frequencies that feed back first, so you can cut them before the service. Done carelessly, it can hurt ears and speakers.</p>
      <ul>
        <li>Start with the monitor volume <strong>low</strong>.</li>
        <li>Raise it <strong>slowly</strong>, a little at a time.</li>
        <li>The moment it rings, <strong>pull it back down</strong>.</li>
        <li><strong>Nobody</strong> stands in front of the wedges.</li>
      </ul>
      <label className="check">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        Got it: monitors are low and the stage is clear
      </label>
      <div className="row">
        <button disabled={!ok} onClick={onStart}>Start ring-out</button>
        <button className="quiet" onClick={onSkip}>Skip ring-out</button>
      </div>
    </div>
  );
}

function RingOut({ listening, mixer, mic, position, onNext, onFinish }: {
  listening: Listening; mixer: MixerProfile; mic: BandSource; position: string; onNext: () => void; onFinish: () => void;
}) {
  const [rings, setRings] = useState<number[]>([]);
  const [rang, setRang] = useState<number | null>(null);
  const active = listening.feedback.active;

  useEffect(() => {
    if (rang !== null || rings.length >= MAX_RINGS) return;
    const fresh = active.find((a) => !rings.some((r) => Math.abs(Math.log2(r / a.freqHz)) < SAME_RING_OCTAVES));
    if (fresh) {
      setRang(fresh.freqHz);
      setRings((r) => [...r, fresh.freqHz]);
    }
  }, [active, rang, rings]);

  const doneWithMic = rings.length >= MAX_RINGS && rang === null;
  return (
    <div className="card">
      <p className="muted">Ring-out · mic {position}</p>
      <h2>{nameOf(mic)}</h2>
      {rang === null && !doneWithMic && (
        <p>Slowly raise <strong>{nameOf(mic)}'s monitor send</strong> until it just starts to ring. Listening…</p>
      )}
      {rang !== null && (
        <div className="banner-item">
          <strong>Ring {rings.length} at {formatHz(rang)}</strong>
          <ol>
            <li>Pull the monitor send back down a little (about 3 dB).</li>
            <li>{ringOutFix(rang, mixer.outputs)}</li>
            <li>Then slowly raise the send again to find the next one.</li>
          </ol>
          <button onClick={() => setRang(null)}>Done, keep going</button>
        </div>
      )}
      {doneWithMic && <p>That's {MAX_RINGS} rings, so this mic is rung out. Leave its monitor send about 3 dB below where it last rang.</p>}
      {rings.length > 0 && <p className="muted">Found so far: {rings.map((r) => formatHz(r)).join(', ')}</p>}
      <div className="row">
        <button className={doneWithMic ? '' : 'quiet'} onClick={onNext}>Next mic</button>
        <button className="quiet" onClick={onFinish}>Finish ring-out</button>
      </div>
    </div>
  );
}
