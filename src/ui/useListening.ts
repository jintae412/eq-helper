import { useEffect, useRef, useState } from 'react';
import { startCapture, type Capture } from '../audio/capture';
import { FeedbackDetector } from '../analysis/feedback';
import { FeedbackSession, type FeedbackSnapshot } from '../analysis/feedbackSession';
import { BALANCE_SPEEDS, BandAverager, FRAMES_PER_SECOND, findIssues, toThirdOctaves, type BalanceSpeed } from '../analysis/balance';
import { BalanceTracker, type BalanceSnapshot } from '../analysis/balanceTracker';
import type { ListenMode, RoomProfile } from '../advice/room';

const ANALYSIS_INTERVAL_MS = 100; // detector thresholds assume ~10 frames/s
const TICKS_PER_BAND_FRAME = 1000 / ANALYSIS_INTERVAL_MS / FRAMES_PER_SECOND;
/** Fraction of the averaging window needed before balance advice starts. */
export const MIN_FILL = 0.6;
/** Fraction needed before a reference can be saved (a fuller average is more trustworthy). */
export const REFERENCE_FILL = 0.8;

const EMPTY_FEEDBACK: FeedbackSnapshot = { active: [], visible: [], log: [] };
const EMPTY_BALANCE: BalanceSnapshot = { current: [], history: [] };

export interface ListeningOptions {
  speed: BalanceSpeed;
  room?: RoomProfile;
  hasKit: boolean;
  /** Guided check is soloing one source at a time: don't feed that into full-mix balance. */
  balancePaused: boolean;
}

/** App-level mic, feedback detection and mix balance, so alerts work on every tab. */
export function useListening(options: ListeningOptions) {
  const [capture, setCapture] = useState<Capture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackSnapshot>(EMPTY_FEEDBACK);
  const [balance, setBalance] = useState<BalanceSnapshot>(EMPTY_BALANCE);
  const [fill, setFill] = useState(0);
  const [checked, setChecked] = useState(false); // at least one balance check ran on the current average
  const [mode, setModeState] = useState<ListenMode>('music');

  const windowFrames = (s: BalanceSpeed) => BALANCE_SPEEDS[s].windowS * FRAMES_PER_SECOND;
  const detector = useRef(new FeedbackDetector());
  const session = useRef(new FeedbackSession());
  const averager = useRef(new BandAverager(windowFrames(options.speed)));
  const tracker = useRef(new BalanceTracker());
  const live = useRef({ ...options, mode });
  live.current = { ...options, mode };

  useEffect(() => averager.current.setMaxFrames(windowFrames(options.speed)), [options.speed]);

  useEffect(() => {
    if (!capture) return;
    let tick = 0;
    const id = setInterval(() => {
      const db = capture.read();
      const found = detector.current.update({ db, binHz: capture.binHz });
      if (session.current.update(found, performance.now())) setFeedback(session.current.snapshot());

      if (++tick % TICKS_PER_BAND_FRAME !== 0 || live.current.balancePaused) return;
      const avg = averager.current;
      avg.push(toThirdOctaves(db, capture.binHz));
      setFill((prev) => (prev === avg.fill ? prev : avg.fill));

      const o = live.current;
      const speed = BALANCE_SPEEDS[o.speed];
      if (tick % (speed.evalS * 1000 / ANALYSIS_INTERVAL_MS) !== 0 || avg.fill < MIN_FILL) return;
      const findings = findIssues(avg.average()!, {
        reference: o.room?.references[o.mode]?.bandsDb,
        hasKit: o.hasKit,
        knownResonancesHz: o.room?.knownResonances.map((r) => r.freqHz) ?? [],
      });
      tracker.current.update(findings, Date.now(), speed.confirmations);
      setBalance(tracker.current.snapshot());
      setChecked(true);
    }, ANALYSIS_INTERVAL_MS);
    return () => clearInterval(id);
  }, [capture]);

  // Keep the screen awake while listening; a sleeping phone stops the mic.
  useEffect(() => {
    if (!capture || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | undefined;
    navigator.wakeLock.request('screen').then((l) => (lock = l), () => {});
    return () => void lock?.release();
  }, [capture]);

  async function start() {
    setError(null);
    try {
      setCapture(await startCapture());
    } catch (e) {
      const err = e as Error;
      setError(err.name === 'NotAllowedError' ? 'Microphone permission was denied. Allow it in Settings and try again.' : err.message);
    }
  }

  function stop() {
    capture?.stop();
    setCapture(null);
    detector.current = new FeedbackDetector();
    session.current = new FeedbackSession();
    averager.current.clear();
    tracker.current = new BalanceTracker();
    setFeedback(EMPTY_FEEDBACK);
    setBalance(EMPTY_BALANCE);
    setFill(0);
    setChecked(false);
  }

  /** Music and speech sound different: restart the average, keep the session log. */
  function setMode(m: ListenMode) {
    if (m === mode) return;
    setModeState(m);
    averager.current.clear();
    tracker.current.clearCurrent();
    setBalance(tracker.current.snapshot());
    setFill(0);
    setChecked(false);
  }

  function acknowledge(id: number) {
    if (session.current.acknowledge(id)) setFeedback(session.current.snapshot());
  }

  function dismiss(id: number) {
    const alert = session.current.dismiss(id);
    if (!alert) return;
    detector.current.ignore(alert.freqHz);
    setFeedback(session.current.snapshot());
  }

  /** Current averaged bands, if enough has been heard to trust them as a reference. */
  function referenceCandidate(): number[] | null {
    return averager.current.fill >= REFERENCE_FILL ? averager.current.average() : null;
  }

  return { capture, error, start, stop, feedback, acknowledge, dismiss, balance, fill, checked, mode, setMode, referenceCandidate };
}

export type Listening = ReturnType<typeof useListening>;
